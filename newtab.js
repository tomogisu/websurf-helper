// OFF 時のフォールバック先（いつもの Google 検索）
const GOOGLE_SEARCH_URL = 'https://www.google.com';

const DEFAULTS = {
  enableNewTabUrl: false,
  newTabUrl: 'https://www.google.com/search?udm=50',
};

// replace で遷移し、戻る履歴にこの中継ページを残さない
chrome.storage.sync.get(DEFAULTS, (data) => {
  const url = data.enableNewTabUrl && data.newTabUrl ? data.newTabUrl : GOOGLE_SEARCH_URL;
  location.replace(url);
});
