import { useState, useRef } from 'react'
import Taro from '@tarojs/taro';
import { View, Text, Button as NativeButton} from '@tarojs/components'
import { Button as NutButton ,Form,Input,Cascader, Cell} from '@nutui/nutui-react-taro'
import CalenderCon from './Calendar'
import RoomNumber from './RoomNumber'
import './index.scss'

export default function Index() {
    const [isVisibleDemo5, setIsVisibleDemo5] = useState(false)
    const [value5, setValue5] = useState(['广东省', '广州市'])
    // 日期时间数据
    const [dateTimeData, setDateTimeData] = useState<{
        checkInDate: string;
        checkInTime: string;
        checkOutDate: string;
        checkOutTime: string;
    } | null>(null)
    // 房间人数数据
    const [roomData, setRoomData] = useState<{
        roomNum: number;
        adultNum: number;
        childNum: number;
    }>({ roomNum: 1, adultNum: 1, childNum: 0 })
    // 酒店名称输入框的引用
    const hotelNameRef = useRef<string>('')
    const [optionsDemo5] = useState([
        { value: '北京', text: '北京', id: 1, pidd: null },
        { value: '通州区', text: '通州区', id: 11, pidd: 1 },
        { value: '经海路', text: '经海路', id: 111, pidd: 11 },
        { value: '广东省', text: '广东省', id: 2, pidd: null },
        { value: '广州市', text: '广州市', id: 21, pidd: 2 },
    ])
    const [convertConfigDemo5] = useState({
        topId: null,
        idKey: 'id',
        pidKey: 'pidd',
        sortKey: '',
    })
    const change5 = (value: any, path: any) => {
        console.log('onChange', value, path)
        setValue5(value)
    }
    const handleSearch = () => {
        const city = value5[value5.length - 1];
        const hotelName = hotelNameRef.current || '';

        // 构建查询参数
        const params: Record<string, string> = {
            city: encodeURIComponent(city),
        };

        // 添加酒店名称（如果有）
        if (hotelName) {
            params.hotelName = encodeURIComponent(hotelName);
        }

        // 添加日期时间（如果有）
        if (dateTimeData) {
            params.checkInDate = dateTimeData.checkInDate;
            params.checkInTime = dateTimeData.checkInTime;
            params.checkOutDate = dateTimeData.checkOutDate;
            params.checkOutTime = dateTimeData.checkOutTime;
        }

        // 添加房间人数
        params.roomNum = roomData.roomNum.toString();
        params.adultNum = roomData.adultNum.toString();
        params.childNum = roomData.childNum.toString();

        // 构建 URL 查询字符串
        const queryString = Object.keys(params)
            .map(key => `${key}=${params[key]}`)
            .join('&');

        console.log('查询参数:', params);
        Taro.navigateTo({
            url: `/pages/list/index?${queryString}`
        });
    }
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
                <CalenderCon onChange={(data) => setDateTimeData(data)} /> 
                <RoomNumber onChange={(data) => setRoomData(data)} />
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
                        onChange={(value) => {
                            hotelNameRef.current = value as string;
                        }}
                    />
                    </Form.Item>   
                     <NutButton block type="primary" onClick={handleSearch}>
                        查询
                    </NutButton> 
                    <NativeButton style={{ display: 'none' }} />
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