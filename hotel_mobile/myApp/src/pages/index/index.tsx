import { useState, useRef } from 'react'
import Taro from '@tarojs/taro';
import { View, Text, Button as NativeButton } from '@tarojs/components'
import { Button as NutButton, Form, Input, Cascader, Cell } from '@nutui/nutui-react-taro'
import CalenderCon from './Calendar'
import RoomNumber from './RoomNumber'
import './index.scss'
import { Image } from '@tarojs/components'
import AdBanner from './AdBanner';
import promoImage from '../../assets/images/ad/1.png';
import { Picker } from '@nutui/nutui-react-taro'


export default function Index() {
    const [isVisibleDemo5, setIsVisibleDemo5] = useState(false)
    const [value5, setValue5] = useState<string[]>([])
    const [dateTimeData, setDateTimeData] = useState<{
        checkInDate: string;
        checkInTime: string;
        checkOutDate: string;
        checkOutTime: string;
    } | null>(null)
    const [roomData, setRoomData] = useState<{ roomNum: number; adultNum: number; childNum: number }>({ roomNum: 1, adultNum: 1, childNum: 0 })
    const hotelNameRef = useRef<string>('')
    
    // 新增状态：星级、价格、关键词
    const [star, setStar] = useState<number | null>(null)
    const [priceRange, setPriceRange] = useState<string | null>(null)
    const [keywords, setKeywords] = useState<string[]>([])

    const [showStarPicker, setShowStarPicker] = useState(false)
    const [showPricePicker, setShowPricePicker] = useState(false)
    const [starText, setStarText] = useState('不限')
    // 修复级联选择器数据格式
    const [optionsDemo5] = useState([
        { value: '北京', text: '北京', children: [
            { value: '朝阳区', text: '朝阳区', children: [
                { value: 'CBD', text: 'CBD' }
            ]}
        ]},
        { value: '上海', text: '上海', children: [
            { value: '浦东新区', text: '浦东新区', children: [
                { value: '陆家嘴', text: '陆家嘴' }
            ]}
        ]},
        { value: '广州', text: '广州', children: [
            { value: '天河区', text: '天河区', children: [
                { value: '珠江新城', text: '珠江新城' }
            ]}
        ]}
    ])
        // 星级选项
    const starOptions = [
        { value: 0, text: '不限' },
        { value: 1, text: '1星' },
        { value: 2, text: '2星' },
        { value: 3, text: '3星' },
        { value: 4, text: '4星' },
        { value: 5, text: '5星' }
    ]
    
    // 价格选项
    const priceOptions = [
        { value: '', text: '不限' },
        { value: '0-200', text: '200元以下' },
        { value: '201-500', text: '201-500元' },
        { value: '501-800', text: '501-800元' },
        { value: '801+', text: '800元以上' }
    ]
    
    // 处理星级选择
    const handleStarConfirm = (options: any) => {
        const selected = options[0]
        setStar(selected.value === 0 ? null : selected.value)
        setStarText(selected.text)
        setShowStarPicker(false)
    }
    
    // 处理价格选择
    const handlePriceConfirm = (options: any) => {
        const selected = options[0]
        setPriceRange(selected.value)
        setShowPricePicker(false)
    }

    const change5 = (value: any, path: any) => {
        console.log('onChange', value, path)
        setValue5(value)
        setIsVisibleDemo5(false) // 选择后自动关闭
    }

    const handleSearch = () => {
        const city = value5[0] || '上海';
        const hotelName = hotelNameRef.current || '';

        const params: Record<string, string> = {
            city: encodeURIComponent(city),
            roomNum: roomData.roomNum.toString(),
            adultNum: roomData.adultNum.toString(),
            childNum: roomData.childNum.toString(),
        };

        if (hotelName) params.hotelName = encodeURIComponent(hotelName);
        if (dateTimeData) {
            params.checkInDate = dateTimeData.checkInDate;
            params.checkInTime = dateTimeData.checkInTime;
            params.checkOutDate = dateTimeData.checkOutDate;
            params.checkOutTime = dateTimeData.checkOutTime;
        }

        // 新增参数
        if (star) params.star = star.toString();
        if (priceRange) params.priceRange = priceRange;
        if (keywords.length) params.keywords = keywords.map(k => encodeURIComponent(k)).join(',');

        const queryString = Object.keys(params)
            .map(key => `${key}=${params[key]}`)
            .join('&');

        console.log('查询参数:', params);
        Taro.navigateTo({
            url: `/pages/list/index?${queryString}`
        });
    }

    const toggleKeyword = (keyword: string) => {
        setKeywords(prev => 
            prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]
        )
    }

    // 处理星级选择
    const handleStarSelect = (s: number) => {
        setStar(star === s ? null : s)
    }

    // 处理价格选择
    const handlePriceSelect = (p: string) => {
        setPriceRange(priceRange === p ? null : p)
    }

    return (
        <View className="index">
            <View className='ad-banner'>
                <AdBanner/>
            </View>

            <View className="section">
                {/* 地址选择 */}
                <Cell
                    title="选择城市"
                    description={value5.length ? value5.join(' - ') : '请选择城市'}
                    onClick={() => setIsVisibleDemo5(true)}
                />
                
                {/* 级联选择器 */}
                {isVisibleDemo5 && (
                    <Cascader
                        visible={isVisibleDemo5}
                        value={value5}
                        title="选择城市"
                        options={optionsDemo5}
                        closeable
                        onClose={() => setIsVisibleDemo5(false)}
                        onChange={change5}
                    />
                )}
                
                {/* 日期选择 */}
                <CalenderCon onChange={(data) => setDateTimeData(data)} /> 
                
                {/* 房间人数选择 */}
                <RoomNumber onChange={(data) => setRoomData(data)} />

                <View className="filter-row">
                {/* 星级选择 - 下拉 */}
                <View className="filter-item">
                    <Text className="filter-label">星级</Text>
                    <View 
                    className="filter-select"
                    onClick={() => setShowStarPicker(true)}
                    >
                    <Text>{starText}</Text>
                    <Text className="arrow">▼</Text>
                    </View>
                    <Picker
                    visible={showStarPicker}
                    title="选择酒店星级"
                    options={[starOptions]}
                    onConfirm={handleStarConfirm}
                    onClose={() => setShowStarPicker(false)}
                    />
                </View>

                {/* 价格选择 - 下拉 */}
                <View className="filter-item">
                    <Text className="filter-label">价格</Text>
                    <View 
                    className="filter-select"
                    onClick={() => setShowPricePicker(true)}
                    >
                    <Text>{priceRange ? priceOptions.find(p => p.value === priceRange)?.text || '不限' : '不限'}</Text>
                    <Text className="arrow">▼</Text>
                    </View>
                    <Picker
                    visible={showPricePicker}
                    title="选择价格区间"
                    options={[priceOptions]}
                    onConfirm={handlePriceConfirm}
                    onClose={() => setShowPricePicker(false)}
                    />
                </View>
                </View>

                {/* 关键词选择 */}
                <View className="filter-section">
                    <Text className="filter-label">关键词:</Text>
                    <View className="keyword-options">
                        {['免费早餐','含停车','近地铁'].map(k => (
                            <NutButton
                                key={k}
                                type={keywords.includes(k) ? 'primary' : 'default'}
                                size="small"
                                onClick={() => toggleKeyword(k)}
                            >{k}</NutButton>
                        ))}
                    </View>
                </View>

                {/* 酒店名称输入 */}
                <View className="form-section">
                    <Input
                        className="hotel-name-input"
                        placeholder="请输入酒店名称/关键字"
                        type="text"
                        onChange={(value) => { hotelNameRef.current = value as string }}
                    />
                </View>

                {/* 查询按钮 */}
                <View className="search-btn">
                    <NutButton block type="primary" onClick={handleSearch}>查询酒店</NutButton>
                </View>
            </View>

            {/* 限时特惠广告 */}
            <View className="promo" onClick={() => {
                Taro.navigateTo({
                    url: '/pages/promotion/index'
                })
            }}>
                <Image className="promo-img" src={promoImage} mode="aspectFill"/>
                <View className="promo-text">
                    <Text className="promo-title">限时特惠</Text>
                    <Text className="promo-subtitle">精选酒店低至5折</Text>
                </View>
            </View>
        </View>
    )
}