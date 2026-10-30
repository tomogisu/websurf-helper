// content script はページ上の任意の href を渡してくるため、受け側でも http(s) に限る
function isWebUrl(url) {
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== 'OPEN_IN_NEW_TAB') return;
  if (!isWebUrl(message.url)) return;
  chrome.tabs.create({
    url: message.url,
    active: !!message.active,
    // 元タブの隣に新タブを開くため openerTabId を渡す
    openerTabId: sender.tab?.id,
  });
});

// ブックマーク由来の遷移を新タブで開き直す。
// 遷移自体はブロックできないため、確定後に元タブを戻す。こうするとファビコンが消えない。
const handlingTabs = new Set();

chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return;
  if (details.transitionType !== 'auto_bookmark') return;
  // 戻る操作で再び auto_bookmark として通知されても再処理しない
  if (details.transitionQualifiers?.includes('forward_back')) return;
  if (handlingTabs.has(details.tabId)) return;

  // service worker は停止・再起動するため、メモリに持たず都度読む
  const { enabled, enableBookmarkNewTab } = await chrome.storage.sync.get({
    enabled: true,
    enableBookmarkNewTab: true,
  });
  if (!enabled || !enableBookmarkNewTab) return;

  handlingTabs.add(details.tabId);
  try {
    // 戻る履歴が無い（新規タブ直後など）場合は失敗するので、そのタブでそのまま開く
    await chrome.tabs.goBack(details.tabId);
  } catch {
    handlingTabs.delete(details.tabId);
    return;
  }

  chrome.tabs.create({
    url: details.url,
    active: true,
    openerTabId: details.tabId,
  });
  // goBack による再コミットが落ち着いてから解除する
  setTimeout(() => handlingTabs.delete(details.tabId), 1000);
});
