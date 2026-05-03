chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== 'OPEN_IN_NEW_TAB') return;
  chrome.tabs.create({
    url: message.url,
    active: !!message.active,
    // 元タブの隣に新タブを開くため openerTabId を渡す
    openerTabId: sender.tab?.id,
  });
});
