import { useState, useRef, useMemo, useCallback, memo, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Text} from '@tarojs/components'
import { Button as NutButton, Input, Cascader, Cell, Picker } from '@nutui/nutui-react-taro'
import CalenderCon from './Calendar'
import RoomNumber from './RoomNumber'
import './index.scss'
import { Image } from '@tarojs/components'
import AdBanner from './AdBanner';
import promoImage from '../../assets/images/ad/1.png';
import { useRouter } from '@tarojs/taro'

interface FilterButtonsProps {
    nearby: string | null;
    hasBreakfast: boolean;
    hasParking: boolean;
    setNearby: (value: string | null) => void;
    setHasBreakfast: (value: boolean) => void;
    setHasParking: (value: boolean) => void;
}
// 定义 Picker 组件的 Props 类型
interface PickerProps {
  visible: boolean;
  onConfirm: (options: any[]) => void;
  onClose: () => void;
  currentValue?: number;
}

// 星级选择器
const StarPicker = memo(({ visible, onConfirm, onClose, currentValue = 0 }: PickerProps) => {
  const starOptions = [
    { text: '不限', value: 0 },
    { text: '1星', value: 1 },
    { text: '2星', value: 2 },
    { text: '3星', value: 3 },
    { text: '4星', value: 4 },
    { text: '5星', value: 5 }
  ]
  
  const handleConfirm = useCallback((options: any[]) => {
    const selected = options[0]
    const selectedIndex = starOptions.findIndex(p => p.value === selected.value)
    onConfirm([{ value: selected.value === 0 ? 0 : selected.value, text: selected.text, index: selectedIndex }])
    onClose()
  }, [onConfirm, onClose, starOptions])
  
  return (
    <Picker
      visible={visible}
      options={starOptions}
      defaultValue={[currentValue]}
      onConfirm={handleConfirm}
      onCancel={onClose}
      onClose={onClose}
    />
  )
})

// 价格选择器
const PricePicker = memo(({ visible, onConfirm, onClose, currentValue = 0 }: PickerProps) => {
  const priceOptions = [
    { text: '不限', value: '' },
    { text: '200元以下', value: '0-200' },
    { text: '201-500元', value: '201-500' },
    { text: '501-800元', value: '501-800' },
    { text: '800元以上', value: '801+' }
  ]
  
  const handleConfirm = useCallback((options: any[]) => {
    const selected = options[0]
    const selectedIndex = priceOptions.findIndex(p => p.value === selected.value)
    onConfirm([{ value: selected.value, text: selected.text, index: selectedIndex }])
    onClose()
  }, [onConfirm, onClose, priceOptions])
  
  return (
    <Picker
      visible={visible}
      options={priceOptions}
      defaultValue={[currentValue]}
      onConfirm={handleConfirm}
      onCancel={onClose}
      onClose={onClose}
    />
  )
})

// 提取子组件 - FilterButtons
const FilterButtons = memo(({ 
  nearby, 
  hasBreakfast, 
  hasParking, 
  setNearby, 
  setHasBreakfast, 
  setHasParking 
}:FilterButtonsProps) => (
  <View className="keyword-options">
    <NutButton
      type={nearby === 'subway' ? 'primary' : 'default'}
      size="small"
      onClick={() => setNearby(nearby === 'subway' ? null : 'subway')}
    >🚇 近地铁</NutButton>
    
    <NutButton
      type={hasBreakfast ? 'primary' : 'default'}
      size="small"
      onClick={() => setHasBreakfast(!hasBreakfast)}
    >🍳 免费早餐</NutButton>
    
    <NutButton
      type={hasParking ? 'primary' : 'default'}
      size="small"
      onClick={() => setHasParking(!hasParking)}
    >🅿️ 含停车</NutButton>
  </View>
))

// 提取城市选择器组件
const CitySelector = memo(({ value5, setIsVisibleDemo5 }: { value5: string[]; setIsVisibleDemo5: (value: boolean) => void }) => (
  <Cell
    title="选择城市"
    description={value5.length ? value5.join(' - ') : '请选择城市'}
    onClick={() => setIsVisibleDemo5(true)}
  />
))

const Index = () => {
    const router = useRouter()
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
    
    // 合并相关状态
    const [filters, setFilters] = useState({
        star: null as number | null,
        priceRange: null as string | null,
        nearby: null as string | null,
        hasBreakfast: false,
        hasParking: false,
        starText: '不限',
        starIndex: 0,
        priceIndex: 0
    })

    const [showStarPicker, setShowStarPicker] = useState(false)
    const [showPricePicker, setShowPricePicker] = useState(false)

    // 处理从列表页返回时的参数
    useEffect(() => {
        if (router.params) {
            const params = router.params
            
            // 处理酒店名称
            if (params.hotelName) {
                try {
                    hotelNameRef.current = decodeURIComponent(params.hotelName)
                } catch (e) {
                    hotelNameRef.current = params.hotelName
                }
            }
            
            // 处理城市选择
            if (params.city) {
                try {
                    const city = decodeURIComponent(params.city)
                    setValue5([city])
                } catch (e) {
                    setValue5([params.city])
                }
            } else {
                // 默认城市
                setValue5(['上海'])
            }
            
            // 处理房间数据
            if (params.roomNum || params.adultNum || params.childNum) {
                setRoomData({
                    roomNum: params.roomNum ? parseInt(params.roomNum) : 1,
                    adultNum: params.adultNum ? parseInt(params.adultNum) : 1,
                    childNum: params.childNum ? parseInt(params.childNum) : 0
                })
            }
            
            // 处理日期数据
            if (params.checkInDate && params.checkOutDate) {
                setDateTimeData({
                    checkInDate: params.checkInDate,
                    checkInTime: params.checkInTime || '',
                    checkOutDate: params.checkOutDate,
                    checkOutTime: params.checkOutTime || ''
                })
            }
            
            // 处理筛选条件
            setFilters(prev => ({
                ...prev,
                star: params.star ? parseInt(params.star) || null : prev.star,
                priceRange: params.priceRange || prev.priceRange,
                nearby: params.nearby || prev.nearby,
                hasBreakfast: params.hasBreakfast === 'true' ,
                hasParking: params.hasParking === 'true' ,
                // 更新显示文本
                starText: params.star ? `${params.star}星` : '不限',
                starIndex: params.star ? parseInt(params.star) : 0,
                priceIndex: 0
            }))
        } else {
            // 默认城市
            setValue5(['上海'])
        }
    }, [router.params])

    // 使用 useMemo 缓存静态数据
    const starOptions = useMemo(() => [
        { value: 0, text: '不限' },
        { value: 1, text: '1星' },
        { value: 2, text: '2星' },
        { value: 3, text: '3星' },
        { value: 4, text: '4星' },
        { value: 5, text: '5星' }
    ], [])

    const priceOptions = useMemo(() => [
        { value: '', text: '不限' },
        { value: '0-200', text: '200元以下' },
        { value: '201-500', text: '201-500元' },
        { value: '501-800', text: '501-800元' },
        { value: '801+', text: '800元以上' }
    ], [])

    const optionsDemo5 = useMemo(() => [
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
    ], [])

    // 使用 useCallback 缓存函数
    const handleStarConfirm = useCallback((options: any) => {
        const selected = options[0]
        setFilters(prev => ({
            ...prev,
            star: selected.value === 0 ? null : selected.value,
            starText: selected.text,
            starIndex: selected.index !== undefined ? selected.index : 0
        }))
        setShowStarPicker(false)
    }, [])

    const handlePriceConfirm = useCallback((options: any) => {
        const selected = options[0]
        setFilters(prev => ({
            ...prev,
            priceRange: selected.value,
            priceIndex: selected.index !== undefined ? selected.index : 0
        }))
        setShowPricePicker(false)
    }, [])

    const change5 = useCallback((value: any, path: any) => {
        console.log('onChange', value, path)
        setValue5(value)
        setIsVisibleDemo5(false)
    }, [])

    const handleSearch = useCallback(() => {
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

        if (filters.star) params.star = filters.star.toString();
        if (filters.priceRange) params.priceRange = filters.priceRange;
        if (filters.nearby) params.nearby = filters.nearby;
        if (filters.hasBreakfast) params.hasBreakfast = filters.hasBreakfast.toString();
        if (filters.hasParking) params.hasParking = filters.hasParking.toString();

        const queryString = Object.keys(params)
            .map(key => `${key}=${params[key]}`)
            .join('&');

        console.log('查询参数:', params);
        Taro.navigateTo({
            url: `/pages/list/index?${queryString}`
        });
    }, [value5, roomData, dateTimeData, filters])

    // 更新单个 filter 的辅助函数
    const updateFilter = useCallback((key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }, [])

    return (
        <View className="index">
            <View className='ad-banner'>
                <AdBanner/>
            </View>

            <View className="section">
                {/* 地址选择 - 使用提取的组件 */}
                <CitySelector 
                    value5={value5} 
                    setIsVisibleDemo5={setIsVisibleDemo5} 
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
                        <Text>{filters.starText}</Text>
                        <Text className="arrow">▼</Text>
                    </View>
                    {showStarPicker && (
                        <StarPicker
                        visible={showStarPicker}
                        onConfirm={handleStarConfirm}
                        onClose={() => setShowStarPicker(false)}
                        currentValue={filters.starIndex}
                        />
                    )}
                    </View>

                    {/* 价格选择 - 下拉 */}
                    <View className="filter-item">
                    <Text className="filter-label">价格</Text>
                    <View 
                        className="filter-select"
                        onClick={() => setShowPricePicker(true)}
                    >
                        <Text>
                        {filters.priceRange 
                            ? priceOptions.find(p => p.value === filters.priceRange)?.text || '不限' 
                            : '不限'}
                        </Text>
                        <Text className="arrow">▼</Text>
                    </View>
                    {showPricePicker && (
                        <PricePicker
                        visible={showPricePicker}
                        onConfirm={handlePriceConfirm}
                        onClose={() => setShowPricePicker(false)}
                        currentValue={filters.priceIndex}
                        />
                    )}
                    </View>
                </View>

                {/* 关键词选择 - 使用提取的 FilterButtons 组件 */}
                <View className="filter-section">
                    <Text className="filter-label">筛选条件:</Text>
                    <FilterButtons
                        nearby={filters.nearby}
                        hasBreakfast={filters.hasBreakfast}
                        hasParking={filters.hasParking}
                        setNearby={(value) => updateFilter('nearby', value)}
                        setHasBreakfast={(value) => updateFilter('hasBreakfast', value)}
                        setHasParking={(value) => updateFilter('hasParking', value)}
                    />
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
                    <button className="search-btn" onClick={handleSearch}>查询酒店</button>
                </View>
            </View>

        </View>
    )
}

// 使用 memo 包装整个组件
export default memo(Index)
//
            // {/* 限时特惠广告 */}
            // <View className="promo" onClick={() => {
            //     Taro.navigateTo({
            //         url: '/pages/promotion/index'
            //     })
            // }}>
            //     <Image className="promo-img" src={promoImage} mode="aspectFill"/>
            //     <View className="promo-text">
            //         <Text className="promo-title">限时特惠</Text>
            //         <Text className="promo-subtitle">精选酒店低至5折</Text>
            //     </View>
            // </View>