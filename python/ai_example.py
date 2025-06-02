import requests
import sys
import json
from mistralai import Mistral

api_key = sys.argv[1]
context_json = sys.argv[2]
 
context = json.loads(context_json)

client = Mistral(api_key=api_key)

chat_response = client.chat.complete(
    model= "mistral-large-latest",
    messages = [
        {
            "role": "user",
            "content": 
                f"""
                Сгенерируй {context['num_questions']} вопросов по тексту, к каждому 3 неправильных и 1 правильный ответ
                Шаблон вопроса:
                [номер вопроса]. [вопрос]
                Ответы:
                A. [ответ A]
                B. [ответ B]
                C. [ответ C]
                D. [ответ D]
                Правильный ответ: [буква правильного ответа]
                Дальше идет текст и не надо добавлять его в ответ. Вопросы и ответ только на русском.
                Текст: {context['text']}
                """,
        },
    ]
)
print(chat_response.choices[0].message.content)