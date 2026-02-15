# Flowledge - платформа для корпоративного обучения

## Основные компоненты

### 1. **Бэкенд для работы с нейросетями**
#### a. **Integrations Runner API**
- Отвечает за интеграцию с внешними ИИ-сервисами и обработку данных. CRUD над интеграциями, выполнение скрипта в изолированном процессе с подстановкой секрета.
- Тестовая версия: mistral-large-latest
- Инструментарий: Python, FastAPI, MongoDB, Subprocess. В тестовой версии полноценная изоляция среды выполнения не предусмотрена.

#### b. **Synopsis Forge API**
- Создает конспекты по видео: принимает видеофайл, извлекает из него аудио и преобразует его в текст с помощью модели **Faster Whisper**. Добавляет пунктуацию и форматирует текст с использованием модели **DeepMultilingualPunctuation**. Разбивает аудио на чанки для параллельной обработки, что ускоряет процесс транскрибации. Возвращает готовый конспект в виде текста.
- Инструментарий: Python, FastAPI, GridFS и MongoDB, FFmpeg, Faster Whisper, DeepMultilingualPunctuation.

<img width="600px" src="https://github.com/wybin4/flowledge/blob/master/assets/neural-backend.png"/>

### 2. **Пользовательское API (User Sphere API)**

Монолитный сервис User Sphere был декомпозирован на набор микросервисов на Go в соответствии с новой архитектурой платформы. API остался идентичным.

**Исходная реализация (монолит):**
- Управление пользователями, права и роли, настройки, аутентификация (LDAP и парольный fallback), работа с медиа, работа с курсами и их контентом, версионирование и публикация курсов
Инструментарий: Kotlin, Spring Boot, MongoDB, MongoDB Reactive, Spring Security, Spring LDAP, Spring Boot WebSocket, JWT
- Инструментарий: Kotlin, Spring Boot, MongoDB, MongoDB Reactive, Spring Security, Spring LDAP, Spring Boot WebSocket, JWT

**Текущая реализация (микросервисная):**
- Функционал распределен между внутренними сервисами на Go: Account Service, Policy Service, Course Services
- Инфраструктурные сервисы на Go: Media Service, WS Service
- Взаимодействие через API Gateway и Kafka
- Инструментарий: Go, MongoDB, gorilla/mux, gorilla/websocket, mongo-driver, watermill-kafka, go.uber.org/fx как DI-контейнер, go-ldap, golang-jwt

<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/user-sphere-backend.png"/>

### 3. **Фронтенд**
- Инструментарий: Next.js & TypeScript, CodeMirror, Dnd Kit, Redux & React Redux, StompJS, LokiJS, React Query, React Select, React Modal, i18next

<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/frontend.png"/>

### 4. **Мониторинг и алертинг**

**Prometheus — сбор метрик со всех сервисов, включая:**
- HTTP-метрики API Gateway (количество запросов по маршрутам, длительность обработки, коды ответов, параллельные запросы)
- Метрики безопасности (блокировки rate limiter, неудачные попытки входа, блокировки аккаунтов)
- Runtime-метрики Go-приложений (горутины, использование кучи, GC, CPU, файловые дескрипторы, память)

<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/prometheus.png"/>

**Grafana — визуализация метрик с разделением на дашборды:**
- Security-дашборд (метрики API Gateway)
- Runtime-дашборд (метрики Go-приложений)
- Дашборды для анализа аномалий (интеграция с PAD)

**PAD (Prometheus Anomaly Detector)** — экспериментальный сервис для обнаружения аномалий во временных рядах. Использует модель Prophet для прогнозирования и выявления выбросов (например, анализ запросов к /api/auth/login)

<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/grafana-api.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/grafana-process.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/grafana-anomaly.png"/>

**Алертинг в Grafana — настроены правила оповещения с приоритетами:**
- Critical — BruteForceSuspicion, HighFailureRatio
- Warning — HighLoginTrafficSpike, LoginSilence
- Info — SuspiciousSuccessfulLogins

Контактные точки: Telegram.

<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/grafana-alert-rules.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/grafana-alert.png"/>

### 5. **Развертывание**

**Оркестрация: Kubernetes**

Типы ресурсов:
- StatefulSet: MongoDB, Zookeeper, Kafka, PAD, LDAP
- Deployment: все микросервисы (Account, Policy, Course, Gateway, Media, WS) и UI
- Доступ: Ingress-контроллер (наружу только Gateway, Media, MongoDB, Kafka UI)
- Контейнеры: multi-stage сборка в Alpine, образы в закрытом репозитории
- Среда: MiniKube для локального тестирования (ключевые сервисы по 3 реплики)

<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/minikube.png"/>

### 6. **Дизайн**
- [Figma](https://www.figma.com/design/pbl6x7VHdzOTV24OEC1rdy/flowledge?node-id=704-34&t=B5dZqG2KaboCVLCc-1): Референсы, айдентика (сгенерировано), макеты, скриншоты
- [Структурные карты](https://xmind.ai/ra1CxfB7)

### 7. **Материалы**
- [Видео](https://rutube.ru/video/9b6772469c10244cf12cd8aa1e278f10)
- Скриншоты
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/admin-panel.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/lda-mapping.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/admin-panel-users.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/courses-hub.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/edit-course.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/courses-list.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/course-preview.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/course-progress.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/survey.png"/>