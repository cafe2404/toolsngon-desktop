const vi = {
  common: {
    close: 'Đóng',
    loading: 'Đang tải...',
    unknownError: 'Lỗi không xác định',
    privacy: 'Do not sell or share my personal info'
  },
  language: {
    english: 'Tiếng Anh',
    vietnamese: 'Tiếng Việt'
  },
  login: {
    browserTitle: 'Tiếp tục trên trình duyệt',
    browserSubtitle: 'và hoàn tất đăng nhập',
    retryPrompt: 'Không thấy tab trình duyệt?',
    retry: 'Thử lại',
    titleLine1: 'Đăng nhập hoặc tạo',
    titleLine2: 'tài khoản để',
    titleLine3: 'bắt đầu',
    continueWithBrowser: 'Tiếp tục với trình duyệt',
    signupPrompt: 'Chưa có tài khoản?',
    signupNow: 'Đăng ký ngay'
  },
  dashboard: {
    searchPlaceholder: 'Tìm kiếm ứng dụng, tài khoản, combo...',
    categoryAriaLabel: 'Chọn danh mục',
    other: 'Khác',
    noResults: 'Không có kết quả phù hợp',
    version: 'Phiên bản',
    device: 'Thiết bị'
  },
  product: {
    accountFallback: 'Tài khoản {{id}}',
    expiresOn: 'Hạn {{date}}',
    pending: 'Tạm chờ',
    open: 'Mở',
    maintenance: 'Bảo trì'
  },
  introduction: {
    title: 'Hướng dẫn sử dụng Toolsngon',
    subtitle: 'Vui lòng xem kĩ hướng dẫn, nếu gặp vấn đề gì vui lòng liên hệ admin.',
    chooseAccountTitle: 'Chọn tài khoản',
    chooseAccountDescription: 'Chọn tài khoản cần đăng nhập trong danh sách tài khoản được chia sẻ của bạn',
    openTabTitle: 'Mở tab',
    openTabDescription: 'Ấn nút mở để tạo tab đã đăng nhập tài khoản',
    waitTitle: 'Chờ đợi',
    waitDescription: 'Đợi vài giây cho đến khi tài khoản được đăng nhập',
    issueTitle: 'Vấn đề',
    issueDescriptionPrefix: 'Nếu tài khoản chưa được đăng nhập ấn nút',
    issueDescriptionAction: 'Đăng nhập lại',
    issueDescriptionSuffix: 'để đăng nhập lại. Nếu không thành công hãy gọi hỗ trợ',
    watchVideo: 'Xem video hướng dẫn',
    videoTitle: 'Video hướng dẫn',
    videoDescription: 'Video hướng dẫn sử dụng app Toolsngon.'
  },
  updater: {
    checking: 'Đang kiểm tra bản cập nhật...',
    available: 'Có bản cập nhật mới. Đang chuẩn bị tải...',
    downloading: 'Đang tải {{progress}}%',
    downloaded: 'Đã tải bản cập nhật, đang khởi động lại app...',
    notAvailable: 'App đã ở phiên bản mới nhất.',
    error: 'Cập nhật thất bại: {{error}}',
    preparing: 'Đang chuẩn bị cập nhật...',
    unknownError: 'Lỗi không xác định',
    keepPcOn: 'Đừng tắt máy. Quá trình này sẽ mất một lúc.'
  },
  supportGuide: {
    loadError: 'Không thể tải danh sách hướng dẫn.',
    emptyContent: 'Chưa có nội dung hướng dẫn.',
    fallbackTitle: 'Hướng dẫn hỗ trợ',
    openOriginalFile: 'Mở file gốc',
    allGuides: 'Tất cả hướng dẫn',
    emptyGuides: 'Chưa có hướng dẫn nào cho app của bạn.',
    generalGuide: 'Hướng dẫn chung'
  },
  tabControl: {
    accountManager: 'Quản lý tài khoản',
    supportChat: 'Chat hỗ trợ',
    noNotifications: 'Hiện không có thông báo',
    settings: 'Cài đặt',
    logout: 'Đăng xuất'
  },
  tabBar: {
    newTab: 'Tab mới'
  },
  profileBar: {
    active: 'Đang mở'
  },
  supportChat :{
    supportChat: 'Chat hỗ trợ',
    inputMessagePlaceholder:"Nhập nội dung cần hỗ trợ..."
  }
} as const

export default vi
