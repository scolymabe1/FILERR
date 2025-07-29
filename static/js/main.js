document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById('get-file');
  const img = dropArea.querySelector('img');
  const h2 = dropArea.querySelector('h2');
  const fileInput = document.getElementById('fileInput');
  const fileLink = document.getElementById('file-link');

  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const MAX_SIZE_MB = 10;
  const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

  // Клик по области — открыть окно выбора файла
  dropArea.addEventListener('click', () => fileInput.click());

  // Выделение и подсветка dragover
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
      e.preventDefault();
      dropArea.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
      e.preventDefault();
      dropArea.classList.remove('dragover');
    });
  });

  // Обработка файла при drop
  dropArea.addEventListener('drop', e => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  });

  // Обработка выбора файла через input
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  function handleFile(file) {
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      h2.textContent = '❌ Неверный тип файла';
      fileInput.value = '';
      return;
    }

    if (file.size > MAX_SIZE) {
      h2.textContent = `⚠️ Слишком большой файл (максимум ${MAX_SIZE_MB} МБ)`;
      fileInput.value = '';
      return;
    }

    h2.textContent = 'Загрузка: ' + file.name;
    if (img) img.src = 'img/new-image.gif';
    fileLink.textContent = '';

    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
      .then(async res => {
        if (!res.ok) throw new Error('Ошибка сервера');
        const data = await res.json();

        if (data.url) {
          h2.textContent = '✅ Файл загружен!';
          fileLink.innerHTML = `🔗 <a href="${data.url}" target="_blank" rel="noopener noreferrer">Открыть файл</a>`;
        } else {
          throw new Error('Сервер не вернул ссылку');
        }
      })
      .catch(err => {
        h2.textContent = '❌ Ошибка: ' + err.message;
      });
  }
});
