// OFF 時に新規タブが開く先（いつもの Google 検索）。newtab.js と揃える。
const GOOGLE_SEARCH_URL = 'https://www.google.com';

const DEFAULTS = {
  openInForeground: false,
  scrollRatio: 0.5,
  enableDblClick: true,
  enableScroll: true,
  dblClickDelay: 250,
  enableNewTabUrl: false,
  newTabUrl: 'https://www.google.com/search?udm=50',
};

const $ = (id) => document.getElementById(id);

// ON 時に保存・編集するユーザー指定 URL。OFF 表示中も失わないよう保持する。
let savedNewTabUrl = DEFAULTS.newTabUrl;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// OFF のときは入力欄を無効化し、いつもの Google 検索 URL をグレーで見せる。
function renderNewTabUrl() {
  const enabled = $('enableNewTabUrl').checked;
  const el = $('newTabUrl');
  el.disabled = !enabled;
  el.value = enabled ? savedNewTabUrl : GOOGLE_SEARCH_URL;
}

function load() {
  chrome.storage.sync.get(DEFAULTS, (data) => {
    $('openInForeground').checked = !!data.openInForeground;
    $('enableDblClick').checked = !!data.enableDblClick;
    $('enableScroll').checked = !!data.enableScroll;
    $('scrollRatio').value = data.scrollRatio;
    $('dblClickDelay').value = data.dblClickDelay;
    $('enableNewTabUrl').checked = !!data.enableNewTabUrl;
    savedNewTabUrl = data.newTabUrl;
    renderNewTabUrl();
  });
}

function save() {
  const enableNewTabUrl = $('enableNewTabUrl').checked;
  // ON のときだけ入力値を採用。OFF 表示中の Google 検索 URL で上書きしない。
  if (enableNewTabUrl) {
    savedNewTabUrl = $('newTabUrl').value.trim() || DEFAULTS.newTabUrl;
  }
  const value = {
    openInForeground: $('openInForeground').checked,
    enableDblClick: $('enableDblClick').checked,
    enableScroll: $('enableScroll').checked,
    scrollRatio: clamp(parseFloat($('scrollRatio').value) || 0.5, 0.1, 1.0),
    dblClickDelay: clamp(parseInt($('dblClickDelay').value, 10) || 250, 50, 800),
    enableNewTabUrl,
    newTabUrl: savedNewTabUrl,
  };
  chrome.storage.sync.set(value, () => {
    const status = $('status');
    status.textContent = '保存しました';
    setTimeout(() => (status.textContent = ''), 1200);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  document.body.addEventListener('change', (e) => {
    // トグル切替時は先に欄を再描画し、ON 復帰時に保存済み URL を入力欄へ戻してから保存する
    if (e.target.id === 'enableNewTabUrl') renderNewTabUrl();
    save();
  });
});
