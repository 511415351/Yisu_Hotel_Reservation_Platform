import { useState, useRef, useMemo, useCallback, memo, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Text} from '@tarojs/components'
import { Button as NutButton, Input, Cascader, Cell, Picker } from '@nutui/nutui-react-taro'
import { CalendarCon, RoomNumber } from '../../components'
import './index.scss'
import AdBanner from '../../components/business/AdBanner';
import { useRouter } from '@tarojs/taro'


// 提取快捷标签组件FilterButtons的Props类型
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

    //常量数据
    const PRICE_OPTIONS = [
        { value: '', text: '不限' },
        { value: '0-200', text: '200元以下' },
        { value: '201-500', text: '201-500元' },
        { value: '501-800', text: '501-800元' },
        { value: '801+', text: '800元以上' }
    ]
    const STAR_OPTIONS = [
        { value: 0, text: '不限' },
        { value: 1, text: '1星' },
        { value: 2, text: '2星' },
        { value: 3, text: '3星' },
        { value: 4, text: '4星' },
        { value: 5, text: '5星' }
    ]
    const OPTIONS_DEMO5 = [
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
    ]
// 提取星级选择器组件
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

// 提取价格选择器组件
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

// 提取快捷标签组件 - FilterButtons
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

//设置默认日期的辅助函数——格式转化
const padZero = (num: number | string, targetLength = 2) => {
  let str = `${num}`
  while (str.length < targetLength) {
    str = `0${str}`
  }
  return str
}

const Index = () => {

    const router = useRouter()
    const [isVisibleDemo5, setIsVisibleDemo5] = useState(false)
    const [value5, setValue5] = useState<string[]>([])
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
    })

    const [showStarPicker, setShowStarPicker] = useState(false)
    const [showPricePicker, setShowPricePicker] = useState(false)

     //获取默认日期
    const getDefaultDates = () => {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const formatDate = (date: Date) => {
            const year = date.getFullYear()
            const month = padZero(date.getMonth() + 1)
            const day = padZero(date.getDate())
            return `${year}-${month}-${day}`
        }
        return [formatDate(today), formatDate(tomorrow)]
    }

    const [dateTimeData, setDateTimeData] = useState<{ checkInDate: string; checkOutDate: string }>({
        checkInDate: getDefaultDates()[0],
        checkOutDate: getDefaultDates()[1]
    })
    const [calendarVisible, setCalendarVisible] = useState(false)

    const STORAGE_KEY = 'hotel_search_params'

    // 处理从列表页返回时的参数,更新当前页面参数
    useEffect(() => {
        // 先尝试从 Storage 读取保存的筛选条件
        const savedParams = Taro.getStorageSync(STORAGE_KEY)
        console.log('从Storage读取筛选条件:', savedParams)
        
        // 如果有保存的筛选条件，优先使用
        if (savedParams && Object.keys(savedParams).length > 0) {
            // 处理城市选择
            if (savedParams.city) {
                setValue5([savedParams.city])
            } else {
                setValue5(['上海'])
            }
            
            // 处理酒店名称
            if (savedParams.hotelName) {
                hotelNameRef.current = savedParams.hotelName
            }
            
            // 处理日期数据
            if (savedParams.checkInDate && savedParams.checkOutDate) {
                setDateTimeData({
                    checkInDate: savedParams.checkInDate,
                    checkOutDate: savedParams.checkOutDate,
                })
            }
            
            // 处理筛选条件
            setFilters(prev => ({
                ...prev,
                star: savedParams.star || null,
                priceRange: savedParams.priceRange || '',
                nearby: savedParams.nearby || '',
                hasBreakfast: savedParams.hasBreakfast || false,
                hasParking: savedParams.hasParking || false,
                starText: savedParams.star ? `${savedParams.star}星` : '不限',
                starIndex: savedParams.star ? savedParams.star : 0,
                priceIndex: 0
            }))
            
            // 清除 Storage，避免重复使用
            Taro.removeStorageSync(STORAGE_KEY)
            console.log('已清除Storage中的筛选条件')
            return
        }
        
        // 如果没有保存的筛选条件，处理 URL 参数
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
                    checkOutDate: params.checkOutDate,
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
            setValue5([])
        }
    }, [router.params])
  
  
    

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
            params.checkOutDate = dateTimeData.checkOutDate;
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
                    options={OPTIONS_DEMO5}
                    closeable
                    onClose={() => setIsVisibleDemo5(false)}
                    onChange={change5}
                />
            )}
                
            {/* 日期选择 */}
            <CalendarCon
            value={dateTimeData}
            visible={calendarVisible}
            onValueChange={setDateTimeData}
            onVisibleChange={setCalendarVisible}
            />
                
            {/* 房间人数选择 */}
            <RoomNumber onChange={(data) => setRoomData(data)} />
            {/**星级选择和价格选择 */}
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
                    currentValue={STAR_OPTIONS.findIndex(s => s.value === filters.star) >= 0
                        ? STAR_OPTIONS.findIndex(s => s.value === filters.star)
                        : 0}
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
                        ? PRICE_OPTIONS.find(p => p.value === filters.priceRange)?.text || '不限' 
                        : '不限'}
                    </Text>
                    <Text className="arrow">▼</Text>
                </View>
                {showPricePicker && (
                    <PricePicker
                    visible={showPricePicker}
                    onConfirm={handlePriceConfirm}
                    onClose={() => setShowPricePicker(false)}
                    currentValue={PRICE_OPTIONS.findIndex(p => p.value === filters.priceRange) >= 0
                        ? PRICE_OPTIONS.findIndex(p => p.value === filters.priceRange)
                        : 0}
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
