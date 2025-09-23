@echo off
call venv\Scripts\activate

uvicorn api-whisper:app --reload --reload-dir ./main.py