const en = {
  common: {
    close: 'Close',
    loading: 'Loading...',
    unknownError: 'Unknown error',
    privacy: 'Do not sell or share my personal info'
  },
  language: {
    english: 'English',
    vietnamese: 'Vietnamese'
  },
  login: {
    browserTitle: 'Continue in your browser',
    browserSubtitle: 'and complete sign in',
    retryPrompt: "Browser tab didn't open?",
    retry: 'Try again',
    titleLine1: 'Sign in or create',
    titleLine2: 'an account to',
    titleLine3: 'get started',
    continueWithBrowser: 'Continue with browser',
    signupPrompt: "Don't have an account?",
    signupNow: 'Sign up now'
  },
  dashboard: {
    searchPlaceholder: 'Search apps, accounts, combos...',
    categoryAriaLabel: 'Choose category',
    other: 'Other',
    noResults: 'No matching results',
    version: 'Version',
    device: 'Device'
  },
  product: {
    accountFallback: 'Account {{id}}',
    expiresOn: 'Expires {{date}}',
    pending: 'Pending',
    open: 'Open',
    maintenance: 'Maintenance'
  },
  introduction: {
    title: 'Toolsngon User Guide',
    subtitle: 'Please read the guide carefully. If you run into any issue, contact the admin.',
    chooseAccountTitle: 'Choose an account',
    chooseAccountDescription: 'Choose the shared account you want to sign in with',
    openTabTitle: 'Open a tab',
    openTabDescription: 'Press open to create a tab with the account already signed in',
    waitTitle: 'Wait',
    waitDescription: 'Wait a few seconds until the account is signed in',
    issueTitle: 'Issue',
    issueDescriptionPrefix: 'If the account is not signed in, press',
    issueDescriptionAction: 'Sign in again',
    issueDescriptionSuffix: 'to retry. If it still does not work, contact support',
    watchVideo: 'Watch guide video',
    videoTitle: 'Guide video',
    videoDescription: 'Video guide for using the Toolsngon app.'
  },
  updater: {
    checking: 'Checking for updates...',
    available: 'New update available. Preparing download...',
    downloading: 'Downloading {{progress}}%',
    downloaded: 'Update downloaded, restarting app...',
    notAvailable: 'App is already up to date.',
    error: 'Update failed: {{error}}',
    preparing: 'Preparing update...',
    unknownError: 'Unknown error',
    keepPcOn: "Don't turn off your PC. This will take a while."
  },
  supportGuide: {
    loadError: 'Could not load the guide list.',
    emptyContent: 'No guide content yet.',
    fallbackTitle: 'Support guide',
    openOriginalFile: 'Open original file',
    allGuides: 'All guides',
    emptyGuides: 'No guides are available for your app yet.',
    generalGuide: 'General guide'
  },
  sidebar: {
    navigation: 'Navigation',
    accountManager: 'Account manager',
    accountStore: 'Account store',
    userGuide: 'User guide',
    openApps: 'Open apps',
    expand: 'Expand',
    collapse: 'Collapse'
  },
  tabControl: {
    accountManager: 'Account manager',

    noNotifications: 'No notifications right now',
    settings: 'Settings',
    logout: 'Log out'
  },
  tabBar: {
    newTab: 'New tab'
  },
  profileBar: {
    active: 'Active'
  },
  supportChat: {
    supportChat: 'Support chat',
    inputMessagePlaceholder: 'Enter the content you need assistance with...'
  }
} as const

export default en
