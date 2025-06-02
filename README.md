# Flowledge

## Основные компоненты

### 1. **Бэкенд для работы с нейросетями**
#### a. **Integrations Runner API**
- Отвечает за интеграцию с внешними ИИ-сервисами и обработку данных. CRUD над интеграциями, выполнение скрипта в изолированном процессе с подстановкой секрета.
- Тестовая версия: mistral-large-latest
- Инструментарий: FastAPI, MongoDB, Subprocess. В тестовой версии полноценная изоляция среды выполнения не предусмотрена.

#### b. **Synopsis Forge API**
- Создает конспекты по видео: принимает видеофайл, извлекает из него аудио и преобразует его в текст с помощью модели **Faster Whisper**. Добавляет пунктуацию и форматирует текст с использованием модели **DeepMultilingualPunctuation**. Разбивает аудио на чанки для параллельной обработки, что ускоряет процесс транскрибации. Возвращает готовый конспект в виде текста.
- Инструментарий: FastAPI, GridFS и MongoDB, FFmpeg, Faster Whisper, DeepMultilingualPunctuation.

<img width="300px" src="https://github.com/wybin4/flowledge/blob/master/assets/neural-backend.png"/>

### 2. **Пользовательское API (User Sphere API)**
- Управление пользователями, права и роли, настройки, аутентификация (LDAP и парольный fallback), работа с медиа, работа с курсами и их контентом, версионирование и публикация курсов
- Инструментарий: Kotlin, Spring Boot, MongoDB, MongoDB Reactive, Spring Security, Spring LDAP, Spring Boot WebSocket, JWT

<img width="300px" src="https://github.com/wybin4/flowledge/blob/master/assets/user-sphere-backend.png"/>

### 3. **Фронтенд**
- Инструментарий: Next.js & TypeScript, CodeMirror, Dnd Kit, Redux & React Redux, StompJS, LokiJS, React Query, React Select, React Modal, i18next

<img width="300px" src="https://github.com/wybin4/flowledge/blob/master/assets/frontend.png"/>

### 3. **Дизайн**
- Референсы, айдентика (сгенерировано), карты, макеты, скриншоты

<video width="100%" controls>
  <source src="https://github.com/wybin4/flowledge/blob/master/assets/video.mp4" type="video/mp4">
  Ваш браузер не поддерживает видео.
</video>

if error `MongoServerError[AlreadyInitialized]: already initialized` persists use
```
docker exec -it mongo mongosh
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
})
```