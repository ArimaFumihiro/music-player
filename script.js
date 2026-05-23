'use strict';

const $ = (e) => document.getElementById(e);

// --- DOM要素 ---
const $hamburger = $('hamburger');
const $nav = $('navigation');
const $theme = $('theme');
const $drum = $('drum');
const $drumSelect = $('drum-select');
const $thisBgm = $('this-bgm');

// 各カテゴリーのNext表示用
const nextElements = {
  standBy: $('next-standBy-bgm'),
  admission: $('next-admission-bgm'),
  award: $('next-award-bgm'),
  closing: $('next-closing-bgm'),
  introduction: $('next-introduction-bgm'),
  bulletin: $('next-bulletin-bgm')
};

// メインボタン群
const buttons = {
  standBy: { btn: $('standBy'), text: $('standBy-text'), shape: $('standBy-shapes'), label: '待機' },

  admission: { btn: $('admission'), text: $('admission-text'), shape: $('admission-shapes'), label: '入場' },

  award: {
    btn: $('award'),
    text: $('award-text'),
    shape: $('award-shapes'),
    label: '表彰'
  },

  closing: {
    btn: $('closing'),
    text: $('closing-text'),
    shape: $('closing-shapes'),
    label: '閉会'
  },

  introduction: { btn: $('introduction'), text: $('introduction-text'), shape: $('introduction-shapes'), label: '紹介' },

  bulletin: { btn: $('bulletin'), text: $('bulletin-text'), shape: $('bulletin-shapes'), label: '会報' }
};

// --- データ定義 ---
const bgm = {
  standBy: [
    { id: 'sb01', title: '待機曲 01', path: 'standBy_title_01' },
    { id: 'sb02', title: '待機曲 02', path: 'standBy_title_02' },
    { id: 'sb03', title: '待機曲 03', path: 'standBy_title_03' },
    { id: 'sb04', title: '待機曲 04', path: 'standBy_title_04' },
    { id: 'sb05', title: '待機曲 05', path: 'standBy_title_05' },
    { id: 'sb06', title: '待機曲 06', path: 'standBy_title_06' },
    { id: 'sb07', title: '待機曲 07', path: 'standBy_title_07' },
  ],
  bulletin: [
    { id: 'bu01', title: '会報曲 01', path: 'bulletin_title_01' },
    { id: 'bu02', title: '会報曲 02', path: 'bulletin_title_02' },
    { id: 'bu03', title: '会報曲 03', path: 'bulletin_title_03' },
  ],
  introduction: [
    { id: 'in01', title: '紹介曲 01', path: 'introduction_title_01' },
    { id: 'in02', title: '紹介曲 02', path: 'introduction_title_02' },
    { id: 'in03', title: '紹介曲 03', path: 'introduction_title_03' },
  ],
  admission: [
    { id: 'ad01', title: '入場曲 01', path: 'admission_title_01' },
    { id: 'ad02', title: '入場曲 02', path: 'admission_title_02' },
    { id: 'ad03', title: '入場曲 03', path: 'admission_title_03' },
    { id: 'ad04', title: '入場曲 04', path: 'admission_title_04' },
    { id: 'ad05', title: '入場曲 05', path: 'admission_title_05' },
    { id: 'ad06', title: '入場曲 06', path: 'admission_title_06' },
    { id: 'ad07', title: '入場曲 07', path: 'admission_title_07' },
  ],
  award: [
    { id: 'aw01', title: '表彰曲 01', path: 'award_title_01' }
  ],
  closing: [
    { id: 'cl01', title: '閉会曲 01', path: 'closing_title_01' },
    { id: 'cl02', title: '閉会曲 02', path: 'closing_title_02' },
    { id: 'cl03', title: '閉会曲 03', path: 'closing_title_03' },
    { id: 'cl04', title: '閉会曲 04', path: 'closing_title_04' },
  ],
  drumRoll: [
    { id: 'dr01', title: 'Short',  path: 'drumRoll_title_01' },
    { id: 'dr02', title: 'Medium', path: 'drumRoll_title_02' },
    { id: 'dr03', title: 'Long',   path: 'drumRoll_title_03' },
  ],
};

const settings = {
  useCustom: false,
  customPlaylists: {
    standBy: [], bulletin: [], introduction: [], admission: [], award: [], closing: []
  },
  playing: null,
  thisBgm: '',
  stopText: '停止',
  // true = 待機中（再生可能）, false = 再生中（停止可能）
  states: {
    standBy: true, bulletin: true, introduction: true,
    admission: true, award: true, closing: true, drumRoll: true
  },
};

// カテゴリごとの再生位置管理（drumRoll含む）
const playListManager = {};
['standBy', 'admission', 'award', 'closing', 'introduction', 'bulletin', 'drumRoll'].forEach(cat => {
  playListManager[cat] = { index: 0 };
});

let currentEditingCategory = '';

// --- 画面切り替え ---
const $mainView = $('main');
const $settingsView = $('settings-view');

function switchView(view) {
  if (view === 'settings') {
    $mainView.style.display = 'none';
    $settingsView.style.display = 'block';
  } else {
    $mainView.style.display = 'block';
    $settingsView.style.display = 'none';
  }
  // ナビを閉じる
  $hamburger.classList.remove('is-active');
  $nav.classList.remove('is-active');
}

// --- 有効なプレイリストを返す ---
// useCustom が ON かつカスタムリストが1曲以上あればカスタム、なければデフォルト
function getSource(category) {
  if (
    settings.useCustom &&
    settings.customPlaylists[category] &&
    settings.customPlaylists[category].length > 0
  ) {
    return settings.customPlaylists[category];
  }
  return bgm[category];
}

// --- UI反映 ---
function applySettingsToUI() {
  const $useCustomChk = $('useCustom');
  if ($useCustomChk) $useCustomChk.checked = settings.useCustom;

  $thisBgm.textContent = settings.thisBgm;

  for (const cat in nextElements) {
    const source = getSource(cat);
    const idx = playListManager[cat].index;
    nextElements[cat].textContent = source[idx]?.title || 'なし';
  }

  for (const cat in buttons) {
    const b = buttons[cat];
    b.text.textContent = settings.states[cat] ? b.label : settings.stopText;
    b.shape.className = settings.states[cat] ? 'icon-play' : 'icon-stop';
    b.shape.textContent = settings.states[cat] ? '▶' : '⏹';
  }
}

// --- 再生ロジック ---
function playSound() {
  settings.playing?.play().catch(err => console.log('再生エラー:', err));
}

function whatNow(category) {
  const source = getSource(category);
  const track = source[playListManager[category].index];
  if (!track) return;

  const pathPrefix = category === 'drumRoll' ? 'drumRoll' : category;
  settings.playing = new Audio(`./bgm/${pathPrefix}/${track.path}.mp3`);
  settings.thisBgm = track.title;
  applySettingsToUI();

  settings.playing.onended = () => {
    if (category === 'drumRoll') {
      // ドラムロールは1回鳴らして終わり
      settings.states.drumRoll = true;
      settings.playing = null;
      settings.thisBgm = '';
      setButtonsState(false);
      applySettingsToUI();
    } else {
      // 次のトラックへ進んで連続再生
      advanceTrack(category);
      whatNow(category);
      playSound();
    }
  };
}

// インデックスを1つ進める（末尾なら0に戻る）
function advanceTrack(category) {
  const source = getSource(category);
  playListManager[category].index =
    (playListManager[category].index + 1) % source.length;
  applySettingsToUI();
}

// --- 停止処理 ---
function stopAudio(audioRef) {
  if (!audioRef) return;
  audioRef.onended = null;
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  if (isIOS) {
    audioRef.pause();
    audioRef.currentTime = 0;
  } else {
    const FADE_OUT_DURATION = 1500;
    const interval = 100;
    const step = audioRef.volume / (FADE_OUT_DURATION / interval);
    const fadeOut = setInterval(() => {
      if (audioRef.volume > step) {
        audioRef.volume -= step;
      } else {
        audioRef.volume = 0;
        audioRef.pause();
        clearInterval(fadeOut);
      }
    }, interval);
  }
}

function setButtonsState(bool, currentBtn) {
  const all = [...Object.values(buttons).map(b => b.btn), $drum];
  all.forEach(btn => {
    if (btn !== currentBtn) {
      btn.disabled = bool;
      btn.style.opacity = bool ? '0.5' : '1.0';
      btn.style.cursor = bool ? 'not-allowed' : 'pointer';
    }
  });
}

// --- カスタム曲選択（設定画面） ---
function renderSettings(category) {
  currentEditingCategory = category;
  $('settings-title').textContent = `${buttons[category].label}曲 の選択 (最大5曲)`;

  const container = $('available-songs');
  const sortableList = $('sortable-list');
  container.innerHTML = '';
  sortableList.innerHTML = '';

  // 全曲リスト（チェックボックス）
  bgm[category].forEach(track => {
    const isSelected = settings.customPlaylists[category].some(t => t.id === track.id);
    const div = document.createElement('div');
    div.className = 'song-item';
    div.innerHTML = `
      <input type="checkbox" id="chk-${track.id}" ${isSelected ? 'checked' : ''}>
      <label for="chk-${track.id}">${track.title}</label>
    `;
    div.querySelector('input').onchange = (e) => toggleSong(track, e.target.checked);
    container.appendChild(div);
  });

  // 再生順リスト（ドラッグで並び替え）
  settings.customPlaylists[category].forEach(track => {
    sortableList.appendChild(createSortableItem(track));
  });
}

function toggleSong(track, isChecked) {
  const list = settings.customPlaylists[currentEditingCategory];
  if (isChecked) {
    if (list.length >= 5) {
      alert('最大5曲まで選択可能です。');
      renderSettings(currentEditingCategory);
      return;
    }
    list.push(track);
  } else {
    const idx = list.findIndex(t => t.id === track.id);
    if (idx > -1) list.splice(idx, 1);
  }
  // カテゴリの再生位置をリセット（曲順が変わるため）
  playListManager[currentEditingCategory].index = 0;
  saveToLocalStorage();
  renderSettings(currentEditingCategory);
  applySettingsToUI();
}

function createSortableItem(track) {
  const li = document.createElement('li');
  li.textContent = track.title;
  li.draggable = true;
  li.dataset.id = track.id;

  li.addEventListener('dragstart', () => li.classList.add('dragging'));
  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
    updateOrderFromUI();
  });
  return li;
}

function updateOrderFromUI() {
  const items = [...$('sortable-list').querySelectorAll('li')];
  settings.customPlaylists[currentEditingCategory] = items.map(item =>
    bgm[currentEditingCategory].find(t => t.id === item.dataset.id)
  );
  // 並び替えたらインデックスをリセット
  playListManager[currentEditingCategory].index = 0;
  saveToLocalStorage();
  applySettingsToUI();
}

// ドラッグ移動中の処理
$('sortable-list').addEventListener('dragover', e => {
  e.preventDefault();
  const draggingItem = document.querySelector('.dragging');
  if (!draggingItem) return;
  const siblings = [...$('sortable-list').querySelectorAll('li:not(.dragging)')];
  const nextSibling = siblings.find(
    sibling => e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2
  );
  $('sortable-list').insertBefore(draggingItem, nextSibling || null);
});

// --- データ保存・入出力 ---
function saveToLocalStorage() {
  localStorage.setItem('playlist_custom_settings', JSON.stringify(settings.customPlaylists));
}

$('csv-export').onclick = () => {
  let csv = 'category,id,title\n';
  for (const cat in settings.customPlaylists) {
    settings.customPlaylists[cat].forEach(t => {
      csv += `${cat},${t.id},${t.title}\n`;
    });
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'music_settings.csv';
  a.click();
};

$('csv-import').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    const lines = evt.target.result.split('\n').slice(1);
    const newData = { standBy: [], bulletin: [], introduction: [], admission: [], award: [], closing: [] };
    lines.forEach(line => {
      const [cat, id] = line.split(',');
      if (cat && id && bgm[cat]) {
        const track = bgm[cat].find(t => t.id === id.trim());
        if (track) newData[cat].push(track);
      }
    });
    settings.customPlaylists = newData;
    // インポート後は全カテゴリのインデックスをリセット
    for (const cat in playListManager) playListManager[cat].index = 0;
    saveToLocalStorage();
    applySettingsToUI();
    alert('設定を読み込みました。');
  };
  reader.readAsText(file);
};

// --- イベントリスナー設定 ---
$hamburger.onclick = () => {
  $hamburger.classList.toggle('is-active');
  $nav.classList.toggle('is-active');
};

$('view-player').onclick = (e) => {
  e.preventDefault();
  switchView('player');
};

document.querySelectorAll('.select-category').forEach(el => {
  el.onclick = () => {
    switchView('settings');
    renderSettings(el.dataset.cat);
  };
});

$('back-to-player').onclick = () => switchView('player');

$('useCustom').onchange = (e) => {
  settings.useCustom = e.target.checked;
  // モード切り替え時はインデックスをリセット
  for (const cat in playListManager) playListManager[cat].index = 0;
  applySettingsToUI();
};

// メインボタンのイベント一括登録
for (const cat in buttons) {
  buttons[cat].btn.onclick = () => {
    const isReady = settings.states[cat];
    if (isReady) {
      // 再生開始
      stopAudio(settings.playing);
      settings.playing = null;
      setButtonsState(true, buttons[cat].btn);
      whatNow(cat);
      playSound();
    } else {
      // 停止
      stopAudio(settings.playing);
      settings.playing = null;
      settings.thisBgm = '';
      setButtonsState(false);
    }
    settings.states[cat] = !isReady;
    applySettingsToUI();
  };
}

$drum.onclick = () => {
  const isReady = settings.states.drumRoll;
  if (isReady) {
    stopAudio(settings.playing);
    settings.playing = null;
    setButtonsState(true, $drum);
    whatNow('drumRoll');
    playSound();
  } else {
    stopAudio(settings.playing);
    settings.playing = null;
    settings.thisBgm = '';
    setButtonsState(false);
  }
  settings.states.drumRoll = !isReady;
  applySettingsToUI();
};

$drumSelect.onchange = (e) => {
  const track = bgm.drumRoll.find(t => t.title === e.target.value);
  if (track) {
    playListManager.drumRoll.index = bgm.drumRoll.indexOf(track);
  }
};

// --- 初期化 ---
window.onload = () => {
  const saved = localStorage.getItem('playlist_custom_settings');
  if (saved) {
    try {
      settings.customPlaylists = JSON.parse(saved);
    } catch (err) {
      console.warn('保存データの読み込みに失敗しました:', err);
    }
  }
  applySettingsToUI();
};
