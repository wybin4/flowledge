from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import re

# Загружаем модель и токенизатор для генерации вопросов
model_name = "lmqg/t5-large-squad-qg"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Загружаем модель и токенизатор для перевода с русского на английский
translation_model_name_en = "Helsinki-NLP/opus-mt-ru-en"
translator_en = AutoModelForSeq2SeqLM.from_pretrained(translation_model_name_en)
translator_tokenizer_en = AutoTokenizer.from_pretrained(translation_model_name_en)

# Загружаем модель и токенизатор для перевода с английского на русский
translation_model_name_ru = "Helsinki-NLP/opus-mt-en-ru"
translator_ru = AutoModelForSeq2SeqLM.from_pretrained(translation_model_name_ru)
translator_tokenizer_ru = AutoTokenizer.from_pretrained(translation_model_name_ru)

MAX_TOKENS = 512  # максимальное количество токенов, которое мы можем обработать

def split_text(text, max_tokens=MAX_TOKENS):
    # Разделяем текст на абзацы
    paragraphs = text.split("\n")
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        para = para.strip()  # Убираем лишние пробелы и пустые строки
        if not para:
            continue  # Пропускаем пустые строки
        
        # Разделяем абзац на предложения
        sentences = re.split(r'([.!?])', para)
        sentence = ""
        
        for s in sentences:
            sentence += s  # Добавляем предложение к текущему куску
            # Проверяем, не превышает ли длина текущего куска лимит токенов
            if len(tokenizer(sentence)["input_ids"]) > max_tokens:
                # Если превышает, добавляем текущий кусок в список и начинаем новый
                if sentence.strip():
                    chunks.append(sentence.strip())
                sentence = ""  # Сбрасываем текущую строку для нового блока
        
        if sentence.strip():  # Добавляем последний кусок
            chunks.append(sentence.strip())
    
    return chunks

def filter_question(question):
    excluded_phrases = ["What is the name of the generator that generates questions?"]
    for phrase in excluded_phrases:
        if question.strip().startswith(phrase):
            return False
    return True

def translate_to_english(text):
    # Переводим текст с русского на английский
    # print(text)
    inputs = translator_tokenizer_en(text, return_tensors="pt", padding=True, truncation=True, max_length=MAX_TOKENS)
    with torch.no_grad():
        outputs = translator_en.generate(**inputs)
    translated_text = translator_tokenizer_en.decode(outputs[0], skip_special_tokens=True)
    return translated_text

def translate_to_russian(text):
    # Переводим текст с английского на русский
    inputs = translator_tokenizer_ru(text, return_tensors="pt", padding=True, truncation=True, max_length=MAX_TOKENS)
    with torch.no_grad():
        outputs = translator_ru.generate(**inputs)
    translated_text = translator_tokenizer_ru.decode(outputs[0], skip_special_tokens=True)
    return translated_text

def generate_question(context):
    chunks = split_text(context)
    questions = []
    
    for chunk in chunks:
        # Проверяем длину токенов
        input_ids = tokenizer(chunk)["input_ids"]
        if len(input_ids) > MAX_TOKENS:
            print(f"Skipped chunk due to length: {chunk[:100]}...")  # Печатаем начало длинных фрагментов для отладки
            continue        # Переводим каждый кусок текста
        translated_chunk = translate_to_english(chunk)
        # print(f"Generated text for chunk: {translated_chunk}")

        # Генерация вопросов на основе переведенного текста
        inputs = tokenizer.encode_plus(f"generate question: {translated_chunk}", return_tensors="pt", padding=True, truncation=True, max_length=MAX_TOKENS)
        with torch.no_grad():
            outputs = model.generate(**inputs)
        question = tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Печатаем вопрос для отладки
        # print(f"Generated question: {question}")
        
        if filter_question(question):
            # Переводим вопрос на русский
            translated_question = translate_to_russian(question)
            questions.append(translated_question)

    return questions