const fileInput = document.getElementById('fileInput');
const result = document.getElementById('result');

fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (data.url) {
        result.innerHTML = `<a href="${data.url}" target="_blank">Скачать файл</a>`;
    } else {
        result.textContent = 'Ошибка загрузки';
    }
});
