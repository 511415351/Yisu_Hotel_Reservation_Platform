import React, { useState } from 'react'
import Taro from '@tarojs/taro';
import { View, Text, Button as NativeButton} from '@tarojs/components'
import { Button as NutButton ,Form,Input,Cascader, Cell,Space} from '@nutui/nutui-react-taro'
import CalenderCon from './Calendar'
import RoomNumber from './RoomNumber'
import './index.scss'

export default function Index() {
    const [isVisibleDemo5, setIsVisibleDemo5] = useState(false)
    const [value5, setValue5] = useState(['广东省', '广州市'])
    const [optionsDemo5] = useState([
        { value: '北京', text: '北京', id: 1, pidd: null },
        { value: '通州区', text: '通州区', id: 11, pidd: 1 },
        { value: '经海路', text: '经海路', id: 111, pidd: 11 },
        { value: '广东省', text: '广东省', id: 2, pidd: null },
        { value: '广州市', text: '广州市', id: 21, pidd: 2 },
    ])
    const [convertConfigDemo5, setConvertConfigDemo5] = useState({
        topId: null,
        idKey: 'id',
        pidKey: 'pidd',
        sortKey: '',
    })
    const change5 = (value: any, path: any) => {
        console.log('onChange', value, path)
        setValue5(value)
    }
    const onFinish = (values) => {
        console.log('表单数据:', values);
        Taro.navigateTo({
            url: '/pages/list/index' 
        });
    };
    return (
        <View className="index">
            <View className="section">
                <Cell
                    title="选择地址"
                    description={value5.length ? value5 : '请选择地址'}
                    onClick={() => {
                    setIsVisibleDemo5(true)
                    }}
                />
                <Cascader
                    visible={isVisibleDemo5}
                    defaultValue={value5}
                    title="选择地址"
                    options={optionsDemo5}
                    format={convertConfigDemo5}
                    closeable
                    onClose={() => {
                    setIsVisibleDemo5(false)
                    }}
                    onChange={change5}
                />
                <CalenderCon /> 
                <RoomNumber />
                <Form> 
                    <Form.Item
                    align="center"
                    label="酒店名称"
                    name="hotelName"
                    >
                    <Input
                        className="nut-input-text"
                        placeholder="请输入酒店名称"
                        type="text"
                    />
                    </Form.Item>   
                     <NutButton nativeType="submit" block type="primary" onClick={onFinish}>
                        查询
                    </NutButton> 
                </Form>
                <View>
                    
                </View>
            </View>
            <View className='advertising'>
                <Text>广告位招租中......</Text>
            </View>
        </View>
  )
}