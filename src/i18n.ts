export type Language = 'en' | 'ja';

export const translations = {
  en: {
    sidebar: {
      dock: 'Dock',
      bookmarks: 'Bookmarks',
      buttons: 'Buttons',
      cards: 'Cards',
      bookshelf: 'BookShelf',
      icons: 'Icons',
      tables: 'Tables',
      snippets: 'Snippets',
      rss: 'RSS Feeds',
      history: 'Tab History',
      timeline: 'Timeline',
      graph: 'Graph',
      settings: 'Settings'
    },
    header: {
      welcome: 'Welcome back',
      happening: "Here's what's happening today."
    },
    settings: {
      title: 'Settings',
      userName: 'User Name',
      theme: 'App Theme',
      clockFont: 'Number Font',
      language: 'Language',
      design: 'Design Customization',
      iconShape: 'Icon Shape',
      iconShapeSquare: 'Rounded Square',
      iconShapeRound: 'Circle',
      iconSize: 'Icon Size',
      borderRadius: 'Border Radius',
      extremeMode: 'Extreme Mode: Applies to ALMOST EVERYTHING! 🎨',
      notifications: 'Notifications',
      timerAlerts: 'Show timer alerts',
      readerTitle: 'Dark Mode Reader',
      readerEnabled: 'Enable Reader',
      readerBg: 'Background Color',
      readerText: 'Text Color',
      readerLink: 'Link Color',
      readerBrightness: 'Image Brightness',
      cancel: 'Cancel',
      save: 'Save Changes'
    },
    bookmarks: {
      viewMode: 'View Mode',
      groupView: 'Grouped',
      cloudView: 'Cloud',
      timelineTitle: 'Bookmark Timeline',
      timelineDesc: 'View your bookmarks in chronological order.',
      managerDesc: 'Organize and manage your browser bookmarks.',
      addFolder: 'New Folder',
      folderName: 'Folder Name'
    },
    widgets: {
      clock: { dateLocale: 'en-US' },
      todo: { title: 'TODO List', placeholder: 'Add task...', empty: 'No tasks yet.' },
      calendar: { locale: 'en-US' },
      search: { title: 'Quick Search', placeholder: 'Search Google...', help: 'Press Enter to search on Google' },
      weather: { title: 'Current', unavailable: 'Weather unavailable', humidity: 'Humid', precip: 'Precip' },
      timer: { title: 'Timer', finished: 'Timer finished! Time to take a break.', add: 'Add', custom: 'min' },
      notes: { title: 'Sticky Note', placeholder: 'Type your notes here...' },
      rss: { title: 'RSS Reader', empty: 'No feeds registered or found.', help: 'Go to RSS Feeds to add some.' },
      bookmarks: { title: 'Bookmarks', empty: 'No bookmarks in Bookmark Bar.' }
    },
    snippets: {
      title: 'Code Snippets',
      description: 'Manage and reuse your saved code snippets.',
      new: 'New',
      export: 'Export',
      search: 'Search...',
      empty: 'No snippets found',
      emptySub: 'Create a new snippet or save text from any webpage via right-click.',
      modalTitle: 'Create New Snippet',
      labelTitle: 'Title',
      labelContent: 'Snippet Content',
      placeholderTitle: 'e.g. Useful Regex, SQL Query, etc.',
      placeholderContent: 'Paste or type your code here...',
      manualEntry: 'Manual entry'
    },
    history: {
      title: 'Tab History',
      description: 'Manage your saved tab sessions (Max 10).',
      autoRestore: 'Auto-restore latest',
      empty: 'No history saved yet.',
      emptySub: 'Right-click on any page and select "Save current tab state" to start.',
      restoreAll: 'Restore All',
      tabsSaved: 'tabs saved'
    },
    rss: {
      title: 'RSS Feeds',
      description: 'Add and manage your favorite RSS feeds.',
      addNew: 'Add New Feed',
      feedTitle: 'Feed Title',
      feedUrl: 'Feed URL',
      add: 'Add',
      yourFeeds: 'Your Feeds',
      empty: 'No RSS feeds registered',
      emptySub: 'Add your first feed above to see the latest news in your Dock.'
    }
  },
  ja: {
    sidebar: {
      dock: 'ドック',
      bookmarks: 'ブックマーク',
      buttons: 'ボタン',
      cards: 'カード',
      bookshelf: '本棚',
      icons: 'アイコン',
      tables: 'テーブル',
      snippets: 'スニペット',
      rss: 'RSSフィード',
      history: 'タブ履歴',
      timeline: 'タイムライン',
      graph: 'グラフ',
      settings: '設定'
    },
    header: {
      welcome: 'おかえりなさい',
      happening: '今日の状況はこちらです。'
    },
    settings: {
      title: '設定',
      userName: 'ユーザー名',
      theme: 'テーマ',
      clockFont: '数字のフォント',
      language: '言語',
      design: 'デザインのカスタマイズ',
      iconShape: 'アイコンの形状',
      iconShapeSquare: '角丸四角',
      iconShapeRound: '円形',
      iconSize: 'アイコンサイズ',
      borderRadius: '角の丸み',
      extremeMode: 'エクストリームモード: ほぼ全ての要素に適用されます！ 🎨',
      notifications: '通知',
      timerAlerts: 'タイマー通知を表示する',
      readerTitle: 'ダークモード・リーダー',
      readerEnabled: 'リーダーを有効化',
      readerBg: '背景色',
      readerText: 'テキスト色',
      readerLink: 'リンクの色',
      readerBrightness: '画像の明るさ',
      cancel: 'キャンセル',
      save: '変更を保存'
    },
    bookmarks: {
      viewMode: '表示モード',
      groupView: 'グループ化',
      cloudView: 'クラウド',
      timelineTitle: 'ブックマーク・タイムライン',
      timelineDesc: 'ブックマークを登録日時の順に表示します。',
      managerDesc: 'ブラウザのブックマークを整理・管理します。',
      addFolder: '新規フォルダ',
      folderName: 'フォルダ名'
    },
    widgets: {
      clock: { dateLocale: 'ja-JP' },
      todo: { title: 'TODOリスト', placeholder: 'タスクを追加...', empty: 'タスクはありません。' },
      calendar: { locale: 'ja-JP' },
      search: { title: 'クイック検索', placeholder: 'Googleで検索...', help: 'EnterキーでGoogle検索' },
      weather: { title: '現在地', unavailable: '天気情報を取得できません', humidity: '湿度', precip: '降水' },
      timer: { title: 'タイマー', finished: 'タイマー終了！休憩しましょう。', add: '追加', custom: '分' },
      notes: { title: '付箋', placeholder: 'メモを入力...' },
      rss: { title: 'RSSリーダー', empty: 'フィードが登録されていないか見つかりません。', help: 'RSSフィードから追加してください。' },
      bookmarks: { title: 'ブックマーク', empty: 'ブックマークバーに項目がありません。' }
    },
    snippets: {
      title: 'コードスニペット',
      description: '保存したコードスニペットを管理・再利用します。',
      new: '新規作成',
      export: 'エクスポート',
      search: '検索...',
      empty: 'スニペットが見つかりません',
      emptySub: '新規作成するか、ウェブページ上で右クリックして保存してください。',
      modalTitle: 'スニペットの新規作成',
      labelTitle: 'タイトル',
      labelContent: '内容',
      placeholderTitle: '例: 便利な正規表現、SQLクエリなど',
      placeholderContent: 'ここにコードを貼り付けるか入力してください...',
      manualEntry: '手動入力'
    },
    history: {
      title: 'タブ履歴',
      description: '保存されたタブセッション（最大10件）を管理します。',
      autoRestore: '起動時に最新を復元',
      empty: '履歴はまだありません。',
      emptySub: 'ページ上で右クリックし「現在のタブの状態を保存する」を選択してください。',
      restoreAll: 'すべて復元',
      tabsSaved: '個のタブが保存済み'
    },
    rss: {
      title: 'RSSフィード',
      description: 'お気に入りのRSSフィードを追加・管理します。',
      addNew: '新しいフィードを追加',
      feedTitle: 'フィードのタイトル',
      feedUrl: 'フィードのURL',
      add: '追加',
      yourFeeds: '登録済みフィード',
      empty: 'RSSフィードが登録されていません',
      emptySub: '上のフォームから最初のフィードを追加して、最新ニュースを表示しましょう。'
    }
  }
};
