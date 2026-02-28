import React, { useState, useEffect } from 'react'
import { Menu } from '@nutui/nutui-react-taro'

interface ListMenuProps {
  onChange?: (data: {
    address: string;
    stars: number;
    priceRange: string;
  }) => void;
  // 添加初始值参数
  initialValues?: {
    address: string;
    stars: number;
    priceRange: string;
  };
}

const listMenu = ({ onChange, initialValues }: ListMenuProps) => {
  // 初始化状态，使用initialValues
  // 注意：这里只在组件首次渲染时使用initialValues
  // 之后不再响应initialValues的变化，避免无限循环
  console.log('initialValues:', initialValues)
  const [selected, setSelected] = useState({
    address: initialValues?.address || 'a',
    stars: initialValues?.stars || 0,
    priceRange: initialValues?.priceRange || '',
  })

  const [star] = useState([
    { text: '不限星级', value: 0 },
    { text: '1星', value: 1 },
    { text: '2星', value: 2 },
    { text: '3星', value: 3 },
    { text: '4星', value: 4 },
    { text: '5星', value: 5 },
  ])

  const [priceRange] = useState([
    { text: '不限价格', value: '' },
    { text: '0-200', value: '0-200' },
    { text: '201-500', value: '201-500' },
    { text: '501-800', value: '501-800' },
    { text: '800+', value: '800+' }
  ])

  const [address] = useState([
    { text: '北京', value: '北京' },
    { text: '上海', value: '上海' },
    { text: '广州', value: '广州' },
  ])

  // 当selected变化时通知父组件
  useEffect(() => {
    if (onChange) {
      onChange({ ...selected });
    }
  }, [selected]);

  return (
    <Menu
      onClose={(i: number) => console.log('onClose', i)}
      onOpen={(i: number) => console.log('onOpen', i)}
    >
      <Menu.Item
        options={star}
        defaultValue={selected.stars}
        onChange={(val) => {
          console.log('星级选择:', val)
          setSelected(prev => ({ ...prev, stars: val }))
        }}
      />
      <Menu.Item 
        options={priceRange} 
        defaultValue={selected.priceRange}
        onChange={(val) => {
          console.log('价格选择:', val)
          setSelected(prev => ({ ...prev, priceRange: val }))
        }}
      />
      <Menu.Item 
        options={address} 
        defaultValue={selected.address}
        onChange={(val) => {
          console.log('城市选择:', val)
          setSelected(prev => ({ ...prev, address: val }))
        }}
      />
    </Menu>
  )
}

export default listMenu