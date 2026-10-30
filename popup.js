const $ = (id) => document.getElementById(id);

function render(enabled) {
  $('on').setAttribute('aria-pressed', String(enabled));
  $('off').setAttribute('aria-pressed', String(!enabled));
  $('state').textContent = enabled
    ? 'すべての機能が有効です'
    : 'すべての機能を停止しています';
}

function setEnabled(enabled) {
  chrome.storage.sync.set({ enabled }, () => render(enabled));
}

chrome.storage.sync.get({ enabled: true }, (data) => render(!!data.enabled));

$('on').addEventListener('click', () => setEnabled(true));
$('off').addEventListener('click', () => setEnabled(false));
