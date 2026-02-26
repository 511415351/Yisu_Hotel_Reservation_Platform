export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/list/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  permission: {
    'scope.userLocation': {
      'desc': '获取您的位置信息，以便为您推荐附近的酒店'
    }
  }
})
