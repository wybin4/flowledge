import os
import shutil
import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
from faster_whisper import WhisperModel
from deepmultilingualpunctuation import PunctuationModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, T5ForConditionalGeneration, T5Tokenizer
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
import torch
from motor.motor_asyncio import AsyncIOMotorClient  # Импортируем AsyncIOMotorClient
from pydantic import BaseModel
from bson import ObjectId
from typing import List

# Инициализация FastAPI
app = FastAPI(
    title="Whisper Speech-to-Text API",
    description="API для распознавания речи с Faster Whisper и пунктуацией",
    version="1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Разрешаем CORS-запросы
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Укажите адрес фронтенда
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы (GET, POST и т. д.)
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Загружаем модели
whisper_model = WhisperModel("medium", device="cpu", compute_type="int8")  # Оптимизация для CPU
punctuation_model = PunctuationModel()

# Создание папки для загрузок
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

FRAME_RATE = 16000
CHANNELS = 1
CHUNK_SIZE = 30 * 1000  # 30 секунд в миллисекундах

def extract_audio(video_path: str, audio_path: str):
    """Извлекает аудио из видео с помощью FFmpeg"""
    command = ["ffmpeg", "-i", video_path, "-ac", "1", "-ar", "16000", "-vn", audio_path, "-y"]
    subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def split_audio(audio_path: str) -> List[str]:
    """Разбивает аудио на чанки по CHUNK_SIZE и сохраняет их"""
    audio = AudioSegment.from_file(audio_path)
    chunks = [audio[i:i + CHUNK_SIZE] for i in range(0, len(audio), CHUNK_SIZE)]
    
    chunk_paths = []
    for i, chunk in enumerate(chunks):
        chunk_path = f"{audio_path.rsplit('.', 1)[0]}_chunk_{i}.wav"
        chunk.export(chunk_path, format="wav")
        chunk_paths.append(chunk_path)

    return chunk_paths

def transcribe_audio_whisper(audio_path: str) -> str:
    """Распознает речь с помощью Faster Whisper"""
    segments, _ = whisper_model.transcribe(audio_path)
    return " ".join(segment.text for segment in segments)

def capitalize_sentences(text: str) -> str:
    """Делает первую букву после точки заглавной и добавляет перенос строки после каждого предложения"""
    sentences = re.split(r'([.?!])\s*', text)  # Разбиваем текст, сохраняя знаки препинания
    formatted_text = ""

    for i in range(0, len(sentences) - 1, 2):
        sentence = sentences[i].strip().capitalize()  # Делаем заглавной первую букву
        punctuation = sentences[i + 1]  # Берем знак препинания
        formatted_text += f"{sentence}{punctuation}\n"  # Добавляем перенос строки после предложения

    return formatted_text.strip()  # Убираем лишние пробелы/переносы в начале и конце

def add_punctuation(text: str) -> str:
    """Добавляет пунктуацию и исправляет заглавные буквы"""
    try:
        punctuated_text = punctuation_model.restore_punctuation(text)
        return capitalize_sentences(punctuated_text)
    except Exception as e:
        print(f"Ошибка при пунктуации: {e}")
        return text

@app.post("/upload/")
async def upload_video(file: UploadFile = File(...)):
    """Загружает видео, извлекает аудио, разбивает на чанки, обрабатывает параллельно и объединяет результат"""
    video_path = os.path.join(UPLOAD_DIR, file.filename)
    audio_path = video_path.rsplit(".", 1)[0] + ".wav"

    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extract_audio(video_path, audio_path)
    chunk_paths = split_audio(audio_path)

    # Обработка чанков в несколько потоков
    with ThreadPoolExecutor() as executor:
        transcriptions = list(executor.map(transcribe_audio_whisper, chunk_paths))
        punctuated_texts = list(executor.map(add_punctuation, transcriptions))

    full_transcription = " ".join(punctuated_texts)
    print(full_transcription)

    return {
        "transcription": full_transcription,
        "filename": file.filename  # Добавили filename в ответ
    }

MODELS = {
    "rut5": {
        "tokenizer": T5Tokenizer.from_pretrained("cointegrated/rut5-base-paraphraser"),
        "model": T5ForConditionalGeneration.from_pretrained("cointegrated/rut5-base-paraphraser"),
    },
}

class TextRequest(BaseModel):
    text: str
    type: str = "rut5"  

def improve_chunk(chunk: str, model_type: str) -> str:
    """Обрабатывает один чанк текста выбранной моделью."""
    if model_type not in MODELS:
        raise HTTPException(status_code=400, detail=f"Unsupported model type: {model_type}")

    tokenizer = MODELS[model_type]["tokenizer"]
    model = MODELS[model_type]["model"]

    input_text = f"paraphrase: {chunk} </s>"
    input_ids = tokenizer.encode(input_text, return_tensors="pt")

    with torch.no_grad():
        outputs = model.generate(input_ids, max_length=128, num_return_sequences=1)

    return tokenizer.decode(outputs[0], skip_special_tokens=True)

def split_text(text: str, chunk_size: int = 100) -> list:
    """Разбивает текст на чанки фиксированного размера, но только на конце предложений."""
    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))
        match = re.search(r'[.!?](?:\s|$)', text[start:end])

        if match:
            end = start + match.end()
        else:
            end = min(start + chunk_size, len(text))

        chunks.append(text[start:end].strip())
        start = end

    return chunks

@app.post("/improve/")
async def improve_text(request: TextRequest):
    """Получает текст, разбивает на чанки, исправляет и возвращает улучшенный вариант."""
    if request.type not in MODELS:
        raise HTTPException(status_code=400, detail=f"Unsupported model type: {request.type}")

    chunks = split_text(request.text)

    with ThreadPoolExecutor() as executor:
        improved_chunks = list(executor.map(lambda chunk: improve_chunk(chunk, request.type), chunks))

    return {"text": " ".join(improved_chunks)}

MONGODB_URL = "mongodb://127.0.0.1:27017/eduflow?directConnection=true&serverSelectionTimeoutMS=2000"
client = AsyncIOMotorClient(MONGODB_URL)
db = client["eduflow"]

class ApiIntegration(BaseModel):
    _id: str
    name: str
    secret: str
    script: str
    u: dict
    createdAt: str
    updatedAt: str
    enabled: bool

def serialize_doc(doc) -> dict:
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@app.post("/api-integrations/", response_model=ApiIntegration)
async def create_api_integration(integration: ApiIntegration):
    integration_dict = integration.dict()
    if not all(key in integration_dict for key in ["name", "secret", "script"]):
        raise HTTPException(status_code=400, detail="Все поля должны быть заполнены")
    
    result = await db.api_integrations.insert_one(integration_dict)
    integration_dict["_id"] = str(result.inserted_id)  # Исправлено на "_id"
    return integration_dict

@app.get("/api-integrations/", response_model=List[ApiIntegration])
async def get_api_integrations():
    integrations = []
    async for doc in db.api_integrations.find():
        integrations.append(serialize_doc(doc))
    return integrations

@app.get("/api-integrations/{integration_id}", response_model=ApiIntegration)
async def get_api_integration(integration_id: str):
    try:
        doc = await db.api_integrations.find_one({"_id": ObjectId(integration_id)})
        if doc is not None:
            return serialize_doc(doc)
        return {"error": "Интеграция не найдена"}
    except Exception as e:
        return {"error": f"Произошла ошибка: {str(e)}"}

@app.put("/api-integrations/{integration_id}", response_model=ApiIntegration)
async def update_api_integration(integration_id: str, integration: ApiIntegration):
    try:
        integration_dict = integration.dict()
        
        result = await db.api_integrations.update_one(
            {"_id": ObjectId(integration_id)},
            {"$set": integration_dict}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Интеграция не найдена или данные не изменены")
        
        integration_dict["id"] = integration_id
        return integration_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Произошла ошибка: {str(e)}")

async def get_script_from_db(integration_id: str) -> str:
    """
    Извлекает скрипт из базы данных по идентификатору интеграции.
    
    :param integration_id: Идентификатор интеграции.
    :return: Скрипт в виде строки.
    """
    doc = await db.api_integrations.find_one({"_id": ObjectId(integration_id)})
    if doc and 'script' in doc:
        return doc['script']
    else:
        raise ValueError("Скрипт не найден")

def execute_script(script: str):
    """
    Выполняет переданный скрипт в дочернем процессе.
    
    :param script: Скрипт для выполнения.
    :return: Результат выполнения скрипта.
    """
    process = subprocess.Popen(
        ['python', '-c', script],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    stdout, stderr = process.communicate()
    
    if process.returncode != 0:
        raise Exception(f"Ошибка выполнения скрипта: {stderr.decode()}")
    
    return stdout.decode()

@app.get("/execute-script/{integration_id}")
async def execute_script_route(integration_id: str):
    """
    Извлекает скрипт из базы данных по идентификатору интеграции и выполняет его.
    
    :param integration_id: Идентификатор интеграции.
    :return: Результат выполнения скрипта.
    """
    try:
        doc = await db.api_integrations.find_one({"_id": ObjectId(integration_id)})
        if not doc or 'secret' not in doc:
            raise HTTPException(status_code=404, detail="Интеграция не найдена или API-ключ отсутствует")
        
        api_key = doc['secret']
        
        script = doc.get('script', '')
        
        result = execute_script(script)
        
        return {
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Произошла ошибка: {str(e)}")

