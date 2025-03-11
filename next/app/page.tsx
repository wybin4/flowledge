"use client"

export default function Home() {
  return <></>;
  //   const [markdownText, setMarkdownText] = useState<string>(
  //     `
  // Намасте, продолжим работу над андроид диктофоном.

  // Мы сделали большой перерыв и при работе с обычным проектом это не рекомендуется делать. У нас, фактически, новый проект, вышли новые версии всех библиотек, и может быть они теперь работают без багов.

  // Поэтому мы запустим 'agp upgrade assistance' и обновим Android Gradle плагин и библиотеки.
  //     `
  //   );
  //   const [file, setFile] = useState<File | null>(null);
  //   const [isUploading, setIsUploading] = useState<boolean>(false);
  //   const [uploadStatus, setUploadStatus] = useState<string>('');
  //   const [videoUrl, setVideoUrl] = useState<string | null>(null); // Храним URL загруженного видео

  //   // Обработка загрузки файла
  //   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //     if (event.target.files && event.target.files[0]) {
  //       setFile(event.target.files[0]);
  //     }
  //   };

  //   // Обработка отправки формы
  //   const handleSubmit = async (event: React.FormEvent) => {
  //     event.preventDefault();

  //     if (!file) {
  //       alert('Пожалуйста, выберите файл для загрузки.');
  //       return;
  //     }

  //     setIsUploading(true);
  //     setUploadStatus('Загрузка...');

  //     try {
  //       // Создаем FormData для отправки файла
  //       const formData = new FormData();
  //       formData.append('file', file);

  //       // Отправляем файл на сервер
  //       const response = await fetch('http://127.0.0.1:8000/upload/', {
  //         method: 'POST',
  //         body: formData
  //       });

  //       const data = await response.json();
  //       if (response.ok) {
  //         setMarkdownText(data.transcription);
  //         setUploadStatus('Файл успешно загружен!');
  //         setVideoUrl(`http://127.0.0.1:8000/uploads/${data.filename}`); // Формируем URL загруженного видео
  //       } else {
  //         setUploadStatus('Ошибка при загрузке файла.');
  //       }
  //     } catch (error) {
  //       console.error('Ошибка:', error);
  //       setUploadStatus('Произошла ошибка при загрузке.');
  //     } finally {
  //       setIsUploading(false);
  //     }
  //   };

  //   return (
  //     <>
  //       <div className="container">
  //         <h1>Загрузка видео</h1>
  //         <form onSubmit={handleSubmit}>
  //           <div className="form-group">
  //             <label htmlFor="video">Выберите видеофайл:</label>
  //             <input
  //               type="file"
  //               id="video"
  //               accept="video/*"
  //               onChange={handleFileChange}
  //               disabled={isUploading}
  //             />
  //           </div>
  //           <button type="submit" disabled={isUploading}>
  //             {isUploading ? 'Загрузка...' : 'Загрузить'}
  //           </button>
  //         </form>
  //         {uploadStatus && <p>{uploadStatus}</p>}

  //         {/* Отображение видео после загрузки */}
  //         {videoUrl && (
  //           <div className="video-preview">
  //             <h2>Просмотр видео:</h2>
  //             <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
  //               <video controls width="100%">
  //                 <source src={videoUrl} type="video/mp4" />
  //                 Ваш браузер не поддерживает тег video.
  //               </video>
  //             </div>
  //           </div>
  //         )}
  //       </div>

  //       {markdownText !== '' && <Editor markdownText={markdownText} setMarkdownText={setMarkdownText} />}
  //     </>
  //   );
}
