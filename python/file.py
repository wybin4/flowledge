# Пример кода в виде строки
code_string = """
from openai import OpenAI

def main(api_key):
    if not api_key:
        raise ValueError("API ключ не может быть пустым.")
    client = OpenAI(api_key=api_key, base_url='http://127.0.0.1:1337')
    completion = client.chat.completions.create(
        model='gpt-3.5-turbo',
        store=True,
        messages=[{'role': 'user', 'content': 'расскажи про ИИ'}]
    )
    print(completion.choices[0].message.content)

if __name__ == '__main__':
    main("fsdfdsfdsf")
"""

# Выполнение кода из строки
exec(code_string)