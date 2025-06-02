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
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Any, Dict
from bson import ObjectId
from datetime import datetime
from gridfs import GridFSBucket
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket

app = FastAPI(
    title="Whisper Speech-to-Text API",
    description="API для распознавания речи с Faster Whisper и пунктуацией",
    version="1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

whisper_model = WhisperModel("medium", device="cpu", compute_type="int8")
punctuation_model = PunctuationModel()

FRAME_RATE = 16000
CHANNELS = 1
CHUNK_SIZE = 30 * 1000 

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

MONGODB_URL = "mongodb://127.0.0.1:27017/flowledge?directConnection=true&serverSelectionTimeoutMS=2000"
client = AsyncIOMotorClient(MONGODB_URL)
db = client["flowledge"] 
files_collection = db["uploads"] 
fs = AsyncIOMotorGridFSBucket(db)

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
    sentences = re.split(r'([.?!])\s*', text) 
    formatted_text = ""

    for i in range(0, len(sentences) - 1, 2):
        sentence = sentences[i].strip().capitalize() 
        punctuation = sentences[i + 1] 
        formatted_text += f"{sentence}{punctuation}\n" 

    return formatted_text.strip() 

def add_punctuation(text: str) -> str:
    """Добавляет пунктуацию и исправляет заглавные буквы"""
    try:
        punctuated_text = punctuation_model.restore_punctuation(text)
        return capitalize_sentences(punctuated_text)
    except Exception as e:
        print(f"Ошибка при пунктуации: {e}")
        return text

class CreateSynopsisRequest(BaseModel):
    fileId: str

@app.post("/api/synopsis.create")
async def create_synopsis(request: CreateSynopsisRequest):
    """Получает файл из GridFS по fileId, извлекает аудио, разбивает на чанки, обрабатывает параллельно и объединяет результат"""
    fileId = request.fileId
    try:
        file = await fs.open_download_stream(ObjectId(fileId))
        if not file:
            raise HTTPException(status_code=404, detail="Файл не найден")
        print(file)
        video_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(video_path, "wb") as buffer:
            buffer.write(await file.read())

        audio_path = video_path.rsplit(".", 1)[0] + ".wav"
        extract_audio(video_path, audio_path)
        chunk_paths = split_audio(audio_path)

        print(audio_path)

        with ThreadPoolExecutor() as executor:
            transcriptions = list(executor.map(transcribe_audio_whisper, chunk_paths))
            punctuated_texts = list(executor.map(add_punctuation, transcriptions))

        full_transcription = " ".join(punctuated_texts)

        os.remove(video_path)
        os.remove(audio_path) 
        for chunk_path in chunk_paths:
            os.remove(chunk_path)

        return {
            "synopsis": full_transcription,
            "filename": file.filename
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))