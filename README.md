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

<img width="600px" src="https://github.com/wybin4/flowledge/blob/master/assets/neural-backend.png"/>

### 2. **Пользовательское API (User Sphere API)**
- Управление пользователями, права и роли, настройки, аутентификация (LDAP и парольный fallback), работа с медиа, работа с курсами и их контентом, версионирование и публикация курсов
- Инструментарий: Kotlin, Spring Boot, MongoDB, MongoDB Reactive, Spring Security, Spring LDAP, Spring Boot WebSocket, JWT

<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/user-sphere-backend.png"/>

### 3. **Фронтенд**
- Инструментарий: Next.js & TypeScript, CodeMirror, Dnd Kit, Redux & React Redux, StompJS, LokiJS, React Query, React Select, React Modal, i18next

<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/frontend.png"/>

### 4. **Дизайн**
- [Figma](https://www.figma.com/design/pbl6x7VHdzOTV24OEC1rdy/flowledge?node-id=704-34&t=B5dZqG2KaboCVLCc-1): Референсы, айдентика (сгенерировано), макеты, скриншоты
- [Структурные карты](https://xmind.ai/ra1CxfB7)

### 5. **Материалы**
- [Видео](https://rutube.ru/video/9b6772469c10244cf12cd8aa1e278f10)
- Скриншоты
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/admin-panel.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/lda-mapping.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/admin-panel-users.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/courses-hub.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/edit-course.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/courses-list.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/course-preview.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/course-progress.png"/>
<img width="800px" src="https://github.com/wybin4/flowledge/blob/master/assets/survey.png"/>

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
