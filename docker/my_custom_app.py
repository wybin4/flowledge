"""docstring for packages."""
import time
import os
import logging
from datetime import datetime, timedelta
from multiprocessing import Pool, Process, Queue
from multiprocessing import cpu_count
from functools import partial
from queue import Empty as EmptyQueueException
import tornado.ioloop
import tornado.web
from prometheus_client import Gauge, generate_latest, REGISTRY
from prometheus_api_client import PrometheusConnect, Metric
from configuration import Configuration
import model
import schedule

# Set up logging
_LOGGER = logging.getLogger(__name__)

METRICS_LIST = Configuration.metrics_list

# list of ModelPredictor Objects shared between processes
PREDICTOR_MODEL_LIST = list()


pc = PrometheusConnect(
    url=Configuration.prometheus_url,
    headers=Configuration.prom_connect_headers,
    disable_ssl=True,
)

for metric in METRICS_LIST:
    # Initialize a predictor for all metrics first
    metric_init = pc.get_current_metric_value(metric_name=metric)

    for unique_metric in metric_init:
        PREDICTOR_MODEL_LIST.append(
            model.MetricPredictor(
                unique_metric,
                rolling_data_window_size=Configuration.rolling_training_window_size,
            )
        )

# A gauge set for the predicted values
GAUGE_DICT = dict()
for predictor in PREDICTOR_MODEL_LIST:
    unique_metric = predictor.metric
    label_list = list(unique_metric.label_config.keys())
    label_list.append("value_type")
    if unique_metric.metric_name not in GAUGE_DICT:
        GAUGE_DICT[unique_metric.metric_name] = Gauge(
            unique_metric.metric_name + "_" + predictor.model_name,
            predictor.model_description,
            label_list,
        )


class MainHandler(tornado.web.RequestHandler):
    def initialize(self, data_queue):
        self.data_queue = data_queue  # Сохраняем очередь

    async def get(self):
        try:
            model_list = self.data_queue.get_nowait()
        except EmptyQueueException:
            model_list = PREDICTOR_MODEL_LIST

        for predictor_model in model_list:
            # 1. Загружаем свежие данные из Prometheus
            current_value = pc.get_current_metric_value(
                metric_name=predictor_model.metric.metric_name,
                label_config=predictor_model.metric.label_config,
            )[0]

            fresh_metric_data = Metric(current_value)  # Преобразуем в объект Metric

            # 2. Обновляем данные в модели
            predictor_model.metric = fresh_metric_data

            # # 3. Переобучаем модель (опционально)
            # predictor_model.train(fresh_metric_data, Configuration.retraining_interval_minutes)

            # 4. Предсказываем на свежих данных
            prediction = predictor_model.predict_value(datetime.now())

            # 5. Публикуем предсказания
            for column_name in list(prediction.columns):
                GAUGE_DICT[predictor_model.metric.metric_name].labels(
                    **predictor_model.metric.label_config, value_type=column_name
                ).set(prediction[column_name][0])

            # 6. Рассчитываем аномалию
            anomaly = 1
            if (
                fresh_metric_data.metric_values["y"][0] < prediction["yhat_upper"][0]
            ) and (
                fresh_metric_data.metric_values["y"][0] > prediction["yhat_lower"][0]
            ):
                anomaly = 0
            GAUGE_DICT[predictor_model.metric.metric_name].labels(
                **predictor_model.metric.label_config, value_type="anomaly"
            ).set(anomaly)

        self.write(generate_latest(REGISTRY).decode("utf-8"))
        self.set_header("Content-Type", "text; charset=utf-8")


def make_app(data_queue):
    """Initialize the tornado web app."""
    _LOGGER.info("Initializing Tornado Web App")
    return tornado.web.Application(
        [
            (r"/metrics", MainHandler, {"data_queue": data_queue}),
            (r"/", MainHandler, {"data_queue": data_queue}),
        ]
    )

def train_individual_model(predictor_model, initial_run):
    metric_to_predict = predictor_model.metric
    pc = PrometheusConnect(
    url=Configuration.prometheus_url,
    headers=Configuration.prom_connect_headers,
    disable_ssl=True,
    )

    data_start_time = datetime.now() - Configuration.metric_chunk_size
    if initial_run:
        data_start_time = (
            datetime.now() - Configuration.rolling_training_window_size
        )

    # Download new metric data from prometheus
    new_metric_data = pc.get_metric_range_data(
        metric_name=metric_to_predict.metric_name,
        label_config=metric_to_predict.label_config,
        start_time=data_start_time,
        end_time=datetime.now(),
    )[0]

    # Train the new model
    start_time = datetime.now()
    predictor_model.train(
            new_metric_data, Configuration.retraining_interval_minutes)

    _LOGGER.info(
        "Total Training time taken = %s, for metric: %s %s",
        str(datetime.now() - start_time),
        metric_to_predict.metric_name,
        metric_to_predict.label_config,
    )
    return predictor_model

def train_model(initial_run=False, data_queue=None):
    """Train the machine learning model."""
    global PREDICTOR_MODEL_LIST
    parallelism = min(Configuration.parallelism, cpu_count())
    _LOGGER.info(f"Training models using ProcessPool of size:{parallelism}")
    training_partial = partial(train_individual_model, initial_run=initial_run)
    with Pool(parallelism) as p:
        result = p.map(training_partial, PREDICTOR_MODEL_LIST)
    PREDICTOR_MODEL_LIST = result
    data_queue.put(PREDICTOR_MODEL_LIST)


if __name__ == "__main__":
    # Queue to share data between the tornado server and the model training
    predicted_model_queue = Queue()

    # Initial run to generate metrics, before they are exposed
    train_model(initial_run=True, data_queue=predicted_model_queue)

    # Set up the tornado web app
    app = make_app(predicted_model_queue)
    app.listen(8080)
    server_process = Process(target=tornado.ioloop.IOLoop.instance().start)
    # Start up the server to expose the metrics.
    server_process.start()

    # Schedule the model training
    schedule.every(Configuration.retraining_interval_minutes).minutes.do(
        train_model, initial_run=False, data_queue=predicted_model_queue
    )
    _LOGGER.info(
        "Will retrain model every %s minutes", Configuration.retraining_interval_minutes
    )

    while True:
        schedule.run_pending()
        time.sleep(1)

    # join the server process in case the main process ends
    server_process.join()
