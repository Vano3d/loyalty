const SERVER_URL = 'https://loyalty-9zup.onrender.com/data';

// Глобальные переменные для преимуществ и состояний по уровням
let perks = [
  {id: 1, text: "мерч Unicorn", color: "perk-red"},
  {id: 2, text: "Экскурсия в офис Unicorn", color: "perk-red"},
  {id: 3, text: "Бесплатный экспресс", color: "perk-red"},
  {id: 4, text: "Стилист", color: "perk-red"},
  {id: 5, text: "Персональный менеджер", color: "perk-red"},
  {id: 6, text: "Безусловный возврат", color: "perk-yellow"},
  {id: 7, text: "Бесплатная доставка по РФ", color: "perk-yellow"},
  {id: 8, text: "Подарок на ДР", color: "perk-yellow"},
  {id: 9, text: "Больше шансов в розыгрышах", color: "perk-yellow"},
  {id: 10, text: "Повышенный бонус за рефералку 750 р.", color: "perk-yellow"},
  {id: 11, text: "Повышенный бонус за рефералку 1000 р.", color: "perk-yellow"},
  {id: 12, text: "Промокод 1000 р.", color: "perk-yellow"},
  {id: 13, text: "Промокод 1500 р.", color: "perk-yellow"},
  {id: 14, text: "кэшбек 50 руб.", color: "perk-gray"},
  {id: 15, text: "кэшбек 150 руб.", color: "perk-gray"},
  {id: 16, text: "кэшбек 200 руб.", color: "perk-gray"},
  {id: 17, text: "кэшбек 300 руб.", color: "perk-gray"},
  {id: 18, text: "кэшбек 400 руб.", color: "perk-gray"}
];

let levelPerks = [
  [14],               // Без уровня
  [15, 10],           // Новичок
  [11, 16],           // Модник
  [17, 3, 10],        // Шопоголик
  [18]                // Фэшн Киллер
];

// Инициализация массива уровней
function initLevelPerks() {
  while (levelPerks.length < 5) {
    levelPerks.push([]);
  }
}

// Загрузка данных с сервера
async function loadFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error('Ошибка загрузки с сервера');
    const data = await response.json();
    perks = data.perks;
    levelPerks = data.levelPerks;
    initLevelPerks();
    renderPerksList();
    renderDropzones();
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    // При ошибке показываем локальные данные
    initLevelPerks();
    renderPerksList();
    renderDropzones();
  }
}

// Сохранение данных на сервер
async function saveToServer() {
  try {
    await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perks, levelPerks })
    });
  } catch (error) {
    console.error('Ошибка сохранения:', error);
  }
}

// Функция удаления преимущества
function deletePerk(perkId) {
  const perk = perks.find(p => p.id === perkId);
  if (!perk) return;

  if (confirm(`Вы уверены, что хотите удалить преимущество "${perk.text}"?\nОно будет удалено из всех уровней.`)) {
    perks = perks.filter(p => p.id !== perkId);
    levelPerks = levelPerks.map(level => level.filter(id => id !== perkId));
    saveToServer();
    renderPerksList();
    renderDropzones();
  }
}

// Рендеринг набора преимуществ
function renderPerksList() {
  const list = document.getElementById('perks-list');
  list.innerHTML = '';
  perks.forEach(perk => {
    const el = document.createElement('div');
    el.className = `perk ${perk.color}`;
    el.setAttribute('draggable', true);
    el.dataset.id = perk.id;
    el.dataset.source = "perks-list";
    el.innerHTML = `${perk.text} <span class="edit" title="Редактировать">&#9998;</span> <span class="delete" title="Удалить">🗑</span>`;
    el.addEventListener('dragstart', handleDragStart);
    el.addEventListener('dragend', handleDragEnd);
    el.querySelector('.edit').onclick = (e) => {
      e.stopPropagation();
      openEditPerk(perk.id);
    };
    el.querySelector('.delete').onclick = (e) => {
      e.stopPropagation();
      deletePerk(perk.id);
    };
    list.appendChild(el);
  });
}

// Рендеринг зон преимуществ по уровням
function renderDropzones() {
  document.querySelectorAll('.dropzone').forEach((zone, idx) => {
    zone.innerHTML = '';
    zone.classList.add('in-dropzone');
    if (!levelPerks[idx]) levelPerks[idx] = [];
    (levelPerks[idx] || []).forEach(perkId => {
      let perk = perks.find(p => p.id === perkId);
      if (!perk) return;
      const el = document.createElement('div');
      el.className = `perk ${perk.color}`;
      el.innerHTML = `${perk.text} <span class="remove" title="Убрать">×</span>`;
      el.dataset.id = perk.id;
      el.dataset.source = "dropzone";
      el.dataset.level = idx;
      el.setAttribute('draggable', true);
      el.querySelector('.remove').onclick = (e) => {
        e.stopPropagation();
        removePerkFromLevel(idx, perk.id);
      };
      el.addEventListener('dragstart', handleDragStart);
      el.addEventListener('dragend', handleDragEnd);
      zone.appendChild(el);
    });
    zone.ondragover = evt => {
      evt.preventDefault();
      zone.classList.add('zone-over');
    };
    zone.ondragleave = () => zone.classList.remove('zone-over');
    zone.ondrop = evt => {
      evt.preventDefault();
      zone.classList.remove('zone-over');
      const perkId = +evt.dataTransfer.getData('perk-id');
      const fromLevel = evt.dataTransfer.getData('levelIdx');

      if (!levelPerks[idx]) levelPerks[idx] = [];

      if (fromLevel && fromLevel !== '' && +fromLevel !== idx) {
        const fromIdx = +fromLevel;
        if (!levelPerks[fromIdx]) levelPerks[fromIdx] = [];
        levelPerks[fromIdx] = levelPerks[fromIdx].filter(id => id !== perkId);
        if (!levelPerks[idx].includes(perkId)) {
          levelPerks[idx].push(perkId);
        }
      } else if (!levelPerks[idx].includes(perkId)) {
        levelPerks[idx].push(perkId);
      }

      saveToServer();
      renderDropzones();
    };
  });
}

// Drag and Drop logic
function handleDragStart(evt) {
  evt.dataTransfer.setData('perk-id', evt.target.dataset.id);
  if (evt.target.dataset.source === "dropzone") {
    evt.dataTransfer.setData('levelIdx', evt.target.dataset.level);
  } else {
    evt.dataTransfer.setData('levelIdx', '');
  }
  evt.target.classList.add('dragging');
}

function handleDragEnd(evt) {
  evt.target.classList.remove('dragging');
}

// Удаление из уровня
function removePerkFromLevel(levelIdx, perkId) {
  if (!levelPerks[levelIdx]) levelPerks[levelIdx] = [];
  levelPerks[levelIdx] = levelPerks[levelIdx].filter(id => id !== perkId);
  saveToServer();
  renderDropzones();
}

// Редактирование/добавление новых преимуществ
function openEditPerk(id) {
  let perk = perks.find(p => p.id === id);
  if (!perk) return;
  document.getElementById('add-perk-form').style.display = '';
  document.getElementById('perk-text').value = perk.text;
  document.getElementById('perk-color').value = perk.color;
  window._editingPerkId = id;
}

function resetPerkForm() {
  document.getElementById('perk-text').value = '';
  document.getElementById('perk-color').value = 'perk-red';
  window._editingPerkId = null;
  document.getElementById('add-perk-form').style.display = 'none';
}

document.getElementById('add-perk-btn').onclick = () => {
  resetPerkForm();
  document.getElementById('add-perk-form').style.display = '';
};

document.getElementById('cancel-perk-btn').onclick = resetPerkForm;

document.getElementById('save-perk-btn').onclick = function () {
  let text = document.getElementById('perk-text').value.trim();
  let color = document.getElementById('perk-color').value;
  if (!text) return alert('Введите текст преимущества!');
  if (window._editingPerkId) {
    let perk = perks.find(p => p.id === window._editingPerkId);
    if (perk) {
      perk.text = text;
      perk.color = color;
    }
  } else {
    let newId = perks.length ? Math.max(...perks.map(p => p.id)) + 1 : 1;
    perks.push({ id: newId, text, color });
  }
  saveToServer();
  resetPerkForm();
  renderPerksList();
  renderDropzones();
};

// Инициализация - загрузка данных с сервера
loadFromServer();
