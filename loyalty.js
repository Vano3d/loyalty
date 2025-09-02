// Перечень преимуществ: id, текст, цвет
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

// Состояния прикрепленных преимуществ по уровням
let levelPerks = [
  [14],                               // Без уровня
  [15, 10],                           // Новичок
  [],                                 // Модник
  [3, 10],                            // Шопоголик
  []                                  // Фэшн Киллер
];

// Функции для работы с localStorage
function saveToLocalStorage() {
  try {
    localStorage.setItem('loyalty_perks', JSON.stringify(perks));
    localStorage.setItem('loyalty_levelPerks', JSON.stringify(levelPerks));
  } catch (error) {
    console.error('Ошибка сохранения в localStorage:', error);
  }
}

function loadFromLocalStorage() {
  try {
    const savedPerks = localStorage.getItem('loyalty_perks');
    const savedLevelPerks = localStorage.getItem('loyalty_levelPerks');
    
    if (savedPerks) {
      perks = JSON.parse(savedPerks);
    }
    
    if (savedLevelPerks) {
      levelPerks = JSON.parse(savedLevelPerks);
    }
  } catch (error) {
    console.error('Ошибка загрузки из localStorage:', error);
    // В случае ошибки используем значения по умолчанию
  }
}

// Функция для сброса данных к значениям по умолчанию
function resetToDefaults() {
  if (confirm('Вы уверены, что хотите сбросить все данные к значениям по умолчанию?')) {
    localStorage.removeItem('loyalty_perks');
    localStorage.removeItem('loyalty_levelPerks');
    location.reload();
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
    el.innerHTML = `${perk.text} <span class="edit" title="Редактировать">&#9998;</span>`;
    el.addEventListener('dragstart', handleDragStart);
    el.addEventListener('dragend', handleDragEnd);
    el.querySelector('.edit').onclick = () => openEditPerk(perk.id);
    list.appendChild(el);
  });
}

// Рендеринг зон преимуществ по уровням
function renderDropzones() {
  document.querySelectorAll('.dropzone').forEach((zone, idx) => {
    zone.innerHTML = '';
    zone.classList.add('in-dropzone');
    (levelPerks[idx] || []).forEach(perkId => {
      let perk = perks.find(p => p.id === perkId);
      if (!perk) return; // на случай сбоя индексов
      const el = document.createElement('div');
      el.className = `perk ${perk.color}`;
      el.innerHTML = `${perk.text} <span class="remove" title="Убрать">×</span>`;
      el.dataset.id = perk.id;
      el.dataset.source = "dropzone";
      el.dataset.level = idx;
      el.setAttribute('draggable', true);
      el.querySelector('.remove').onclick = () => removePerkFromLevel(idx, perk.id);
      el.addEventListener('dragstart', handleDragStart);
      el.addEventListener('dragend', handleDragEnd);
      zone.appendChild(el);
    });
    zone.ondragover = evt => { 
      evt.preventDefault(); 
      zone.classList.add('zone-over');
    };
    zone.ondragleave = () => { zone.classList.remove('zone-over'); };
    zone.ondrop = evt => {
      evt.preventDefault();
      zone.classList.remove('zone-over');
      let perkId = +evt.dataTransfer.getData('perk-id');
      let fromLevel = evt.dataTransfer.getData('levelIdx');
      if (fromLevel && fromLevel !== '' && +fromLevel !== idx) {
        fromLevel = +fromLevel;
        // Удалить из старого
        levelPerks[fromLevel] = levelPerks[fromLevel].filter(id => id !== perkId);
        // Добавить в новый, если ещё не добавили
        if (!levelPerks[idx].includes(perkId)) {
          levelPerks[idx].push(perkId);
        }
        saveToLocalStorage(); // Сохраняем изменения
        renderDropzones();
      } else if (!levelPerks[idx].includes(perkId)) {
        // Добавление из правого набора (перетаскивание копии из perks-list)
        levelPerks[idx].push(perkId);
        saveToLocalStorage(); // Сохраняем изменения
        renderDropzones();
      }
    }
  });
}

// Drag and Drop logic
function handleDragStart(evt) {
  evt.dataTransfer.setData('perk-id', evt.target.dataset.id);
  // Определяем, из какого dropzone перетаскиваем
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
  levelPerks[levelIdx] = levelPerks[levelIdx].filter(id => id !== perkId);
  saveToLocalStorage(); // Сохраняем изменения
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
document.getElementById('save-perk-btn').onclick = function() {
  let text = document.getElementById('perk-text').value.trim();
  let color = document.getElementById('perk-color').value;
  if (!text) return alert('Введите текст преимущества!');
  // Редактирование существующего
  if (window._editingPerkId) {
    let perk = perks.find(p => p.id === window._editingPerkId);
    if (perk) {
      perk.text = text;
      perk.color = color;
    }
  } else { // Новый
    let newId = Math.max(0, ...perks.map(p => p.id)) + 1;
    perks.push({id: newId, text, color});
  }
  saveToLocalStorage(); // Сохраняем изменения
  resetPerkForm();
  renderPerksList();
  renderDropzones();
};

// Загрузка данных при инициализации
loadFromLocalStorage();

// Показ при загрузке
renderPerksList();
renderDropzones();

// Добавляем кнопку для сброса данных (опционально)
// Можно добавить в HTML: <button onclick="resetToDefaults()">Сбросить к умолчанию</button>
