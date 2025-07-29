document.addEventListener("DOMContentLoaded", () => {
    const dropArea = document.getElementById('get-file');
    const img = dropArea.querySelector('img');
    const h2 = dropArea.querySelector('h2');
    const fileInput = document.getElementById('fileInput');
    const fileLink = document.getElementById('file-link');

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const MAX_SIZE_MB = 10;
    const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

    dropArea.addEventListener('click', () => fileInput.click());

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

    dropArea.addEventListener('drop', e => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    });

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
        fileLink.style.cursor = '';
        fileLink.style.color = '';
        fileLink.style.textDecoration = '';
        fileLink.onclick = null;

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
                h2.textContent = '✅ Файл загружен! Кликните по ссылке, чтобы скопировать.';
                fileLink.textContent = data.url;
                fileLink.style.cursor = 'pointer';
                fileLink.style.color = 'blue';
                fileLink.style.textDecoration = 'underline';

                fileLink.onclick = () => {
                    copyTextToClipboard('http://withoutgg.duckdns.org:5000' + data.url);
                };
            } else {
                throw new Error('Сервер не вернул ссылку');
            }
        })
        .catch(err => {
            h2.textContent = '❌ Ошибка: ' + err.message;
        });
    }

    function copyTextToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    showCopySuccess();
                })
                .catch(() => {
                    fallbackCopyText(text);
                });
        } else {
            fallbackCopyText(text);
        }
    }

    function fallbackCopyText(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';  // чтобы не скакало окно при фокусе
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess();
            } else {
                showCopyError();
            }
        } catch (err) {
            showCopyError();
        }

        document.body.removeChild(textarea);
    }

    function showCopySuccess() {
        h2.textContent = '✅ Ссылка скопирована в буфер обмена!';
        setTimeout(() => {
            h2.textContent = '✅ Файл загружен! Кликните по ссылке, чтобы скопировать.';
        }, 2000);
    }

    function showCopyError() {
        h2.textContent = '❌ Не удалось скопировать ссылку.';
    }
});
