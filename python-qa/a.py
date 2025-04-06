from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline
import random

model_name = "google/flan-t5-large"

context = """
Объяснение (Ctrl+F6): объясняет сложные термины или концепции простыми словами с примерами.

Ответы на вопросы (Ctrl+F7): отвечает на вопросы из буфера обмена.

"""

question = "Что делает команда 'Ctrl+F7'?"

# Использование pipeline для генерации текста
generator = pipeline('text2text-generation', model=model_name, tokenizer=model_name)

# Формируем промпт для правильного ответа
correct_prompt = f"""
Контекст: {context}
Вопрос: {question}
Дай точный ответ на основе контекста.
"""

# Генерируем правильный ответ
correct_response = generator(correct_prompt, max_length=100, num_return_sequences=1)[0]['generated_text']

# Формируем промпт для неправильных ответов
wrong_prompt = f"""
Вопрос: {question}
Сгенерируй правдоподобный, но неверный ответ, который НЕ соответствует следующему контексту: {context}
"""

# Генерируем три неправильных ответа
wrong_responses = []
for _ in range(3):
    response = generator(wrong_prompt, max_length=100, num_return_sequences=1)[0]['generated_text']
    wrong_responses.append(response)

# Перемешиваем все ответы
all_answers = wrong_responses + [correct_response]
random.shuffle(all_answers)

# Находим индекс правильного ответа
correct_index = all_answers.index(correct_response)

# Выводим варианты ответов
print("\nВарианты ответов:")
for i, answer in enumerate(all_answers, 1):
    print(f"{i}. {answer}")
print(f"\nПравильный ответ: {correct_index + 1}")

# Загрузка модели и токенизатора для дополнительных задач
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)
