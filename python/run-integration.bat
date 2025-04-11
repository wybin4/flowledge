@echo off
call venv\Scripts\activate

uvicorn api-integration:app --port 8001 --reload --reload-dir ./api-integration.py