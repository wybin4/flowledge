## Начало работы

```
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate  # Windows
pip install fastapi uvicorn gunicorn h11 httptools anyio asgiref certifi charset-normalizer click idna faster-whisper pydub ffmpeg-python deepmultilingualpunctuation huggingface-hub transformers torch numpy pydantic python-multipart filelock

pip install fastapi[all] motor
pip install requests
```

## Также установим FFmpeg:

- Linux/macOS:
 - `sudo apt install ffmpeg`  # Ubuntu/Debian
 - `brew install ffmpeg`  # macOS
- Windows: скачай и установи FFmpeg, добавь его в PATH.

Проверь версию ffmpeg `ffmpeg -version`, если работает вне venv и не работает внутри venv, сделай от имени администратора
`mklink [PATH_TO_VENV]\venv\Scripts\ffmpeg.exe [PATH_TO_FFMPEG]\ffmpeg.exe`

## Скачиваем Vosk-модель

Выбери и скачай подходящую модель с официального сайта Vosk. Например, для русского:

```
mkdir model
wget https://alphacephei.com/vosk/models/vosk-model-ru-0.22.zip
unzip vosk-model-ru-0.22.zip -d model
mv model/vosk-model-ru-0.22 model/ru
```

## Запускаем сервер

Выполни команду: `uvicorn main:app --reload`
Если все настроено правильно, сервер запустится на http://127.0.0.1:8000

## Тестируем API

Перейди в Swagger UI: http://127.0.0.1:8000/docs
Там можно загрузить видео и получить текст.

