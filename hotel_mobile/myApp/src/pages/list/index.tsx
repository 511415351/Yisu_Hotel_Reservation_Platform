import React, { useState } from 'react'
import Taro from '@tarojs/taro';
import { View, Text, Button as NativeButton } from '@tarojs/components'
import { Button as NutButton ,Form,Input,Cascader, Cell,Space} from '@nutui/nutui-react-taro'
import CalenderCon from './Calendar'
import RoomNumber from './RoomNumber'
import './index.scss'

export default function HotelList() {
    return (
        <View>
            <Text>这是酒店列表页面</Text>
        </View>
    );
}