const DEFAULTS = {
  openInForeground: false,
  scrollRatio: 0.5,
  enableDblClick: true,
  enableScroll: true,
  dblClickDelay: 250,
};

let settings = { ...DEFAULTS };

chrome.storage.sync.get(DEFAULTS, (loaded) => {
  settings = { ...DEFAULTS, ...loaded };
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  for (const key of Object.keys(changes)) {
    if (key in settings) settings[key] = changes[key].newValue;
  }
});

let pendingTimer = null;
// プログラム的に再発火させた click を自分で再処理しないためのフラグ
let bypassNextClick = false;

function clearPending() {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
}

function isSamePageHashLink(href) {
  try {
    const url = new URL(href, location.href);
    return (
      url.origin === location.origin &&
      url.pathname === location.pathname &&
      url.search === location.search &&
      !!url.hash
    );
  } catch {
    return false;
  }
}

document.addEventListener(
  'click',
  (e) => {
    if (bypassNextClick) return;
    if (!settings.enableDblClick) return;
    if (e.button !== 0) return;
    // 修飾キー併用は既存挙動（Ctrl+Click=新タブ等）を尊重して素通し
    if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;

    const anchor = e.target.closest && e.target.closest('a');
    if (!anchor) return;
    const href = anchor.href;
    if (!href) return;
    if (href.startsWith('javascript:')) return;
    // 既に新タブで開く設定のリンクは介入しない
    if (anchor.target === '_blank') return;
    if (anchor.hasAttribute('download')) return;
    // ページ内アンカーは遅延させると違和感があるので素通し
    if (isSamePageHashLink(href)) return;

    if (e.detail === 1) {
      // 1回目のクリック：ダブルクリック待ちで一旦保留
      e.preventDefault();
      e.stopImmediatePropagation();
      clearPending();
      const targetAnchor = anchor;
      pendingTimer = setTimeout(() => {
        pendingTimer = null;
        // 通常クリックとして再発火。SPA の click ハンドラ（pushState 等）も正しく走る
        bypassNextClick = true;
        try {
          targetAnchor.click();
        } finally {
          bypassNextClick = false;
        }
      }, Math.max(50, Math.min(800, Number(settings.dblClickDelay) || 250)));
    } else if (e.detail === 2) {
      // ダブルクリック確定：保留中の遷移を破棄して新タブで開く
      e.preventDefault();
      e.stopImmediatePropagation();
      clearPending();
      window.getSelection()?.removeAllRanges();
      chrome.runtime.sendMessage({
        type: 'OPEN_IN_NEW_TAB',
        url: href,
        active: settings.openInForeground,
      });
    }
    // detail >= 3 はテキスト選択等の意図と判断して何もしない
  },
  true
);

const isEditable = (el) => {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
};

document.addEventListener(
  'keydown',
  (e) => {
    if (!settings.enableScroll) return;
    if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    if (isEditable(e.target)) return;

    const ratio = Math.max(0.1, Math.min(1.0, Number(settings.scrollRatio) || 0.5));
    const amount = window.innerHeight * ratio;
    const delta = e.key === 'ArrowDown' ? amount : -amount;

    e.preventDefault();
    window.scrollBy({ top: delta, behavior: 'smooth' });
  },
  true
);
