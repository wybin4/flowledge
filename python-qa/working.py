import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import re

model_name = "lmqg/t5-large-squad-qg"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

def split_text(text, max_tokens=512):
    """
    Разделяет текст на части, не превышающие максимальное количество токенов.
    Если абзац превышает максимальную длину, делит его пополам по знаку препинания.
    """
    # Разделяем текст на абзацы
    paragraphs = text.split("\n")
    chunks = []
    
    for para in paragraphs:
        # Преобразуем абзац в токены
        tokens = tokenizer(para)["input_ids"]
        
        # Если абзац меньше max_tokens, добавляем его как есть
        if len(tokens) <= max_tokens:
            chunks.append(para)
        else:
            # Разделяем абзац на предложения по знакам препинания
            sentences = re.split(r'([.!?])', para)  # Разделяем по знакам препинания
            sentence = ""
            for s in sentences:
                sentence += s
                # Если длина токенов превышает лимит, добавляем текущий кусок в список
                if len(tokenizer(sentence)["input_ids"]) > max_tokens:
                    chunks.append(sentence.strip())
                    sentence = s
            if sentence:  # Добавляем последний кусок
                chunks.append(sentence.strip())
    
    return chunks

def filter_question(question):
    """
    Функция фильтрует вопросы, которые начинаются с шаблонных фраз.
    """
    # Список фраз, которые мы хотим исключить
    excluded_phrases = ["What is the name of the generator that generates questions?"]
    # Проверяем, начинается ли вопрос с одного из исключённых выражений
    for phrase in excluded_phrases:
        if question.strip().startswith(phrase):
            return False  # Не добавлять этот вопрос
    
    return True  # Оставить вопрос

def generate_question(context):
    # Разбиваем контекст на части
    chunks = split_text(context)
    questions = []
    
    for chunk in chunks:
        # Токенизируем и генерируем вопросы
        inputs = tokenizer.encode_plus(f"generate question: {chunk}", return_tensors="pt", padding=True, truncation=True, max_length=512)
        with torch.no_grad():
            outputs = model.generate(**inputs)
        question = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Фильтруем вопросы
        if filter_question(question):
            questions.append(question)
    
    return questions  # Возвращаем список вопросов для каждого чанка

context = """
The best way to get better at AI isn’t just reading articles (though, thanks for reading this one). It’s about actually using AI to solve real problems — especially the annoying, time-wasting ones.

As a Python developer, I’ve built a handful of AI-powered tools that cut down my workload dramatically. Some of these tools automate tedious tasks. Others enhance my workflow in ways I didn’t even know I needed. The best part? You can build them too.

Here are five AI-powered Python tools that save me at least 10 hours every week — and the exact steps to build them yourself.
"""

# Генерация вопросов
questions = generate_question(context)
for i, question in enumerate(questions, 1):
    print(f"Generated question {i}: {question}")
