export default {
  appName: '情侣小家',
  pages: [
    'pages/index/index',
    'pages/login/login',
    'pages/profile/profile',
    'pages/theme-showcase/theme-showcase',
    'pages/couple/tasks/tasks',
    'pages/couple/bills/bills',
    'pages/couple/moments/moments',
    'pages/couple/calendar/calendar'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF6B81',
    navigationBarTitleText: '情侣小家',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#FF6B81',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/couple/tasks/tasks',
        text: '家务',
        iconPath: 'assets/icons/task.png',
        selectedIconPath: 'assets/icons/task-active.png'
      },
      {
        pagePath: 'pages/couple/bills/bills',
        text: '账单',
        iconPath: 'assets/icons/bill.png',
        selectedIconPath: 'assets/icons/bill-active.png'
      },
      {
        pagePath: 'pages/couple/calendar/calendar',
        text: '日程',
        iconPath: 'assets/icons/calendar.png',
        selectedIconPath: 'assets/icons/calendar-active.png'
      },
      {
        pagePath: 'pages/profile/profile',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png'
      }
    ]
  },
  style: 'v2',
  sitemapLocation: 'sitemap.json'
}
