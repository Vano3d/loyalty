const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'data.json';

app.use(cors());
app.use(express.json());

// Статика - публичные файлы фронтенда в папке public
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET: Получить данные
app.get('/data', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    if (err) return res.status(500).send('Error');
    res.json(JSON.parse(data));
  });
});

// POST: Сохранить новые данные
app.post('/data', (req, res) => {
  fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).send('Error');
    res.json({ status: 'ok' });
  });
});

app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
