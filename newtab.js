// OFF 時のフォールバック先（いつもの Google 検索）
const GOOGLE_SEARCH_URL = 'https://www.google.com';

const DEFAULTS = {
  enabled: true,
  enableNewTabUrl: false,
  newTabUrl: 'https://www.google.com/search?udm=50',
};

// replace で遷移し、戻る履歴にこの中継ページを残さない
chrome.storage.sync.get(DEFAULTS, (data) => {
  const custom = data.enabled && data.enableNewTabUrl ? data.newTabUrl : '';
  // javascript: などの実行系スキームへ遷移させないため、http(s) 以外は既定に戻す
  const url = /^https?:\/\//i.test(custom) ? custom : GOOGLE_SEARCH_URL;
  location.replace(url);
});
