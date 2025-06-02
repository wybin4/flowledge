import os
import json
from datetime import datetime
from typing import List, Any, Dict

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import subprocess

# 8001
app = FastAPI(
    title="Integration Hub API",
    version="2.1",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGODB_URL = "mongodb://127.0.0.1:27017/flowledge?directConnection=true&serverSelectionTimeoutMS=2000"
client = AsyncIOMotorClient(MONGODB_URL)
db = client["flowledge"]

class ApiIntegration(BaseModel):
    _id: str
    name: str
    secret: str
    script: str
    u: dict
    createdAt: str
    updatedAt: str
    enabled: bool

@app.get("/api/api-integrations.get", response_model=List[Any])
async def get_api_integrations(page: int = 1, pageSize: int = 10, searchQuery: str = None, sortQuery: str = None):
    query = {}
    if searchQuery:
        query["name"] = {"$regex": searchQuery, "$options": "i"}
    
    sort_query = {"createdAt": -1}
    if sortQuery:
        sortQueryParams = sortQuery.split(":")
        if len(sortQueryParams) < 2 or not sortQueryParams[0]:
            raise ValueError("key_or_list must not be empty")
        sort_order = 1 if sortQueryParams[1] == "top" else -1 if sortQueryParams[1] == "bottom" else None
        if sort_order is not None:
            sort_query[sortQueryParams[0]] = sort_order

    integrations = []
    async for doc in db.api_integrations.find(query).sort(sort_query).skip((page - 1) * pageSize).limit(pageSize):
        filtered_doc = {
            "_id": str(doc["_id"]),
            "name": doc["name"],
            "createdAt": doc["createdAt"],
            "enabled": doc["enabled"],
            "entity": doc["entity"],
            "u": doc["u"]
        }
        integrations.append(filtered_doc)
    return integrations

@app.get("/api/api-integrations.count", response_model=int)
async def get_api_integrations_count(searchQuery: str = None):
    query = {}
    if searchQuery:
        query["name"] = {"$regex": searchQuery, "$options": "i"}
    
    count = await db.api_integrations.count_documents(query)
    return count

@app.get("/api/api-integrations.get/{integration_id}", response_model=Any)
async def get_api_integration(integration_id: str):
    try:
        doc = await db.api_integrations.find_one({"_id": integration_id})
        if doc is not None:
            return doc
        return {"error": "Интеграция не найдена"}
    except Exception as e:
        return {"error": f"Произошла ошибка: {str(e)}"}

@app.post("/api/api-integrations.create", response_model=Any)
async def create_api_integration(integration: Dict[str, Any]):
    try:
        required_fields = ["name", "secret", "script", "u", "enabled", "entity"]
        for field in required_fields:
            if field not in integration:
                raise HTTPException(status_code=400, detail=f"Отсутствует обязательное поле: {field}")

        integration_data = {
            "_id": str(ObjectId()),
            "name": integration["name"],
            "secret": integration["secret"],
            "script": integration["script"],
            "u": integration["u"],
            "enabled": integration["enabled"],
            "entity": integration["entity"],
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        await db.api_integrations.insert_one(integration_data)
        return integration_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Произошла ошибка: {str(e)}")

@app.put("/api/api-integrations.update/{integration_id}", response_model=Any)
async def update_api_integration(integration_id: str, integration: Dict[str, Any]):
    try:
        integration_data = {
            "name": integration.get("name"),
            "secret": integration.get("secret"),
            "script": integration.get("script"),
            "u": integration.get("u"),
            "entity": integration.get("entity"),
            "enabled": integration.get("enabled"),
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        result = await db.api_integrations.update_one(
            {"_id": integration_id},
            {"$set": integration_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Интеграция не найдена или данные не изменены")
        
        integration_data["_id"] = integration_id
        return integration_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Произошла ошибка: {str(e)}")

@app.delete("/api/api-integrations.delete/{integration_id}", response_model=Any)
async def delete_api_integration(integration_id: str):
    try:
        result = await db.api_integrations.delete_one({"_id": integration_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Интеграция не найдена")
        return {"message": "Интеграция успешно удалена"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Произошла ошибка: {str(e)}")

async def get_script_from_db(integration_id: str) -> str:
    """
    Извлекает скрипт из базы данных по идентификатору интеграции.
    
    :param integration_id: Идентификатор интеграции.
    :return: Скрипт в виде строки.
    """
    doc = await db.api_integrations.find_one({"_id": integration_id})
    if doc and 'script' in doc:
        return doc['script']
    else:
        raise ValueError("Скрипт не найден")

def execute_script(script: str, api_key: str, context: Dict[str, Any]):
    """
    Выполняет переданный скрипт в дочернем процессе.
    
    :param script: Скрипт для выполнения.
    :return: Результат выполнения скрипта.
    """

    process = subprocess.Popen(
        ['python', '-c', script, api_key, json.dumps(context)], 
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    stdout, stderr = process.communicate()
    
    if process.returncode != 0:
        print(f"Ошибка выполнения скрипта: {stderr.decode('utf-8', errors='replace')}")
        print(f"Вывод скрипта: {stdout.decode('utf-8', errors='replace')}")
        raise Exception(f"Ошибка выполнения скрипта: {stderr.decode('utf-8', errors='replace')}")
    
    try:
        return stdout.decode('utf-8')
    except UnicodeDecodeError:
        return stdout.decode('windows-1251', errors='replace')

class ExecuteScriptRequest(BaseModel):
    integration_id: str
    context: Dict[str, Any]

@app.post("/api/api-integrations.execute")
async def execute_script_route(request: ExecuteScriptRequest):
    """
    Извлекает скрипт из базы данных по идентификатору интеграции и выполняет его.
    
    :param request: Запрос с идентификатором интеграции и контекстом.
    :return: Результат выполнения скрипта.
    """
    return {
        "survey": """
        1. Что, по мнению преподавателя физики, является ключевым для обучения программированию?
        Ответы:
        A. Углубленное изучение теории
        B. Применение знаний на практике
        C. Чтение учебников
        D. Просмотр видеоуроков
        Правильный ответ: B

        2. Какую цель преследует статья с проектами для начинающих python-разработчиков?
        Ответы:
        A. Создание самого оригинального портфолио
        B. Разбор простых технологий и тем для развития практических навыков
        C. Создание сложных проектов, таких как Оптимус Прайм или Звезда смерти
        D. Изучение теории программирования
        Правильный ответ: B

        3. Что помогут сделать предложенные в статье проекты для начинающих python-разработчиков?
        Ответы:
        A. Закрепить теорию и применить знания на практике
        B. Научиться создавать комплексные системы
        C. Получить глубокие знания по физике
        D. Разработать двигатель на китовом жире
        Правильный ответ: A

        4. Какие навыки и темы можно проработать с помощью предложенных в статье проектов?
        Ответы:
        A. Навыки работы с автомобилями
        B. Навыки программирования и работы с библиотеками
        C. Навыки кулинарии
        D. Навыки создания мультфильмов
        Правильный ответ: B

        5. Какую аналогию приводит преподаватель физики, чтобы объяснить важность практики в обучении?
        Ответы:
        A. Чтобы научиться ходить – надо бегать
        B. Чтобы научиться решать задачи по физике – надо решать задачи по физике
        C. Чтобы научиться подтягиваться – надо подтягиваться
        D. Чтобы научиться программировать – надо читать книги
        Правильный ответ: B
        """
    }
    # try:
    #     doc = await db.api_integrations.find_one({"_id": request.integration_id})
    #     if not doc or 'secret' not in doc:
    #         raise HTTPException(status_code=404, detail="Интеграция не найдена или API-ключ отсутствует")
        
    #     api_key = doc['secret']
        
    #     script = doc.get('script', '')
        
    #     result = execute_script(script, api_key, request.context)
        
    #     return {
    #         "survey": result
    #     }
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"Произошла ошибка: {str(e)}")
