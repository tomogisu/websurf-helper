const DEFAULTS = {
  openInForeground: false,
  scrollRatio: 0.5,
  enableDblClick: true,
  enableScroll: true,
  dblClickDelay: 250,
};

const $ = (id) => document.getElementById(id);

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function load() {
  chrome.storage.sync.get(DEFAULTS, (data) => {
    $('openInForeground').checked = !!data.openInForeground;
    $('enableDblClick').checked = !!data.enableDblClick;
    $('enableScroll').checked = !!data.enableScroll;
    $('scrollRatio').value = data.scrollRatio;
    $('dblClickDelay').value = data.dblClickDelay;
  });
}

function save() {
  const value = {
    openInForeground: $('openInForeground').checked,
    enableDblClick: $('enableDblClick').checked,
    enableScroll: $('enableScroll').checked,
    scrollRatio: clamp(parseFloat($('scrollRatio').value) || 0.5, 0.1, 1.0),
    dblClickDelay: clamp(parseInt($('dblClickDelay').value, 10) || 250, 50, 800),
  };
  chrome.storage.sync.set(value, () => {
    const status = $('status');
    status.textContent = '保存しました';
    setTimeout(() => (status.textContent = ''), 1200);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  document.body.addEventListener('change', save);
});
