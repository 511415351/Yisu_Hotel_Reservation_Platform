import React, { useEffect } from 'react'
// import '@nutui/nutui-react-taro/dist/style.css';
// import '@nutui/nutui-react-taro/dist/styles/theme-default.scss' 

import { useDidShow, useDidHide } from '@tarojs/taro'
// 全局样式
import './app.scss'

function App(props) {
  // 可以使用所有的 React Hooks
  useEffect(() => {})

  // 对应 onShow
  useDidShow(() => {})

  // 对应 onHide
  useDidHide(() => {})

  return props.children
}

export default App
