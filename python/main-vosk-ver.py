import os
import shutil
import subprocess
import json
import re
from concurrent.futures import ThreadPoolExecutor
from typing import List
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from vosk import Model, KaldiRecognizer, SetLogLevel
from pydub import AudioSegment
from deepmultilingualpunctuation import PunctuationModel

SetLogLevel(0)

app = FastAPI(
    title="Vosk Speech-to-Text API",
    description="API для распознавания речи с Vosk и пунктуации",
    version="1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Загружаем модели
asr_model = Model("model/ru")
punctuation_model = PunctuationModel()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

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


def transcribe_audio(audio_path: str) -> str:
    """Распознает речь с помощью Vosk"""
    audio = AudioSegment.from_file(audio_path)
    audio = audio.set_channels(CHANNELS).set_frame_rate(FRAME_RATE)

    rec = KaldiRecognizer(asr_model, FRAME_RATE)
    rec.SetWords(True)

    rec.AcceptWaveform(audio.raw_data)
    result = rec.Result()
    text = json.loads(result).get("text", "")

    return text


def capitalize_sentences(text: str) -> str:
    """Делает первую букву после точки заглавной"""
    sentences = re.split(r'(\. |\? |\! )', text)
    sentences = [s.capitalize() for s in sentences]
    return ''.join(sentences)


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

    transcribed_texts = []
    
    with ThreadPoolExecutor() as executor:
        transcriptions = list(executor.map(transcribe_audio, chunk_paths))
        punctuated_texts = list(executor.map(add_punctuation, transcriptions))
    
    full_transcription = " ".join(punctuated_texts)

    return {"transcription": full_transcription}
