import {  useEffect, useState } from 'react'
import Taro from '@tarojs/taro';
import { View, Text ,ScrollView} from '@tarojs/components'
import { Card,Button,Tag} from '@nutui/nutui-react-taro'
import  api  from '../../api/index' 
import { HotelListParams } from '../../types/api' 
import './index.scss'
import {useRouter} from '@tarojs/taro'

export default function HotelList() {
    const router = useRouter()
    const [searchParams, setSearchParams] = useState<any>({
        city:'',
        hotelName: '',
        checkInDate:  '',
        checkInTime:  '',
        checkOutDate:  '',
        checkOutTime:   '',
        roomNum:  1,
        adultNum:   1,
        childNum:  0,
        star:  0,
        priceRange: '',
        nearby:  '',
        hasBreakfast: false,
        hasParking: false,
    })
    useEffect(() => {
        if (router.params) {
            const params = { ...searchParams }
            Object.keys(router.params).forEach(key => {
                try {
                    const value = router.params[key] || ''
                    const decodedValue = typeof value === 'string' ? decodeURIComponent(value) : value
                    
                    // 根据字段名进行类型转换
                    switch (key) {
                        case 'star':
                            params[key] = parseInt(decodedValue) || 0
                            break
                        case 'hasBreakfast':
                        case 'hasParking':
                            params[key] = decodedValue === 'true' 
                            break
                        case 'roomNum':
                        case 'adultNum':
                        case 'childNum':
                            params[key] = parseInt(decodedValue) || 0
                            break
                        default:
                            params[key] = decodedValue
                    }
                } catch (e) {
                    const value = router.params[key] || ''
                    // 错误处理时也进行类型转换
                    switch (key) {
                        case 'star':
                        case 'roomNum':
                        case 'adultNum':
                        case 'childNum':
                            params[key] = parseInt(value) || 0
                            break
                        case 'hasBreakfast':
                        case 'hasParking':
                            params[key] = value === 'true' 
                            break
                        default:
                            params[key] = value
                    }
                }
            })
            setSearchParams(params)
        }
    }, [router.params])
    // // 从路由参数中解析筛选条件
    // const setSearchParams = {
    //     city: params.city ? decodeURIComponent(params.city) : '',
    //     hotelName: params.hotelName ? decodeURIComponent(params.hotelName) : '',
    //     checkInDate: params.checkInDate || '',
    //     checkInTime: params.checkInTime || '',
    //     checkOutDate: params.checkOutDate || '',
    //     checkOutTime: params.checkOutTime || '',
    //     roomNum: params.roomNum ? parseInt(params.roomNum) : 1,
    //     adultNum: params.adultNum ? parseInt(params.adultNum) : 1,
    //     childNum: params.childNum ? parseInt(params.childNum) : 0,
    //     star: params.star ? parseInt(params.star) : 0,
    //     priceRange: params.priceRange ? decodeURIComponent(params.priceRange) : '',
    //     nearby: params.nearby? decodeURIComponent(params.nearby) : '',
    //     hasBreakfast: params.hasBreakfast ? parseBoolean(params.hasBreakfast) : false,
    //     hasParking: params.hasParking ? parseBoolean(params.hasParking) : false,
    // }
   
    console.log('从首页传递的筛选条件:', searchParams)
    // 当筛选参数变化时重新请求
        useEffect(() => {
            fetchList()
        }, [searchParams])

    const wordStyles = {
        padding: '0 5px',
        borderRadius: '1px',
        fontSize: '10px',
        height: '15px',
        lineHeight: '15px',
        color: '#999',
        backgroundColor: '#f2f2f7',
        marginRight: '5px',
    }
    const [loading, setLoading] = useState<boolean>(false)
    const [hotelList, setHotelList] = useState<HotelListParams[]>([])
    const fetchList = async () =>  {
        setLoading(true)
        try {
            // 构建 API 请求参数，包含筛选条件
            const apiParams: any = {
                pageNo: 1,
                pageSize: 20,
            }
            
            // 添加筛选条件（如果有值）
            if (searchParams.city) {
                apiParams.location = searchParams.city
            }
            if (searchParams.hotelName) {
                apiParams.keyword = searchParams.hotelName
            }
            if (searchParams.checkInDate&&searchParams.checkOutDate) {
                apiParams.date = searchParams.checkInDate+'/'+searchParams.checkOutDate
            }
            
            if(searchParams.star) {
                apiParams.stars = searchParams.star
            }
            if(searchParams.priceRange) {
                apiParams.priceRange = searchParams.priceRange
            }
            if(searchParams.nearby) {
                apiParams.nearby = searchParams.nearby
            }
            if(searchParams.hasBreakfast) {
                apiParams.hasBreakfast = searchParams.hasBreakfast
            }
            if(searchParams.hasParking) {
                apiParams.hasParking = searchParams.hasParking
            }
            console.log('API 请求参数:', apiParams)
            let data = await api.getHotelList(apiParams);
            console.log('酒店列表数据:', data);
            data = data.filter((item: any) => item.address.includes(searchParams.city));
            setHotelList(data)
        } catch (error) {
            console.error('获取酒店列表失败:', error);
        } finally {
            setLoading(false)
        }
        
    }
    // 酒店每一个列表项中的信息维度(酒店名/评分/地址/价格等)如有更好的用户体验可以自行定义
     // 跳转到搜索页修改条件
  const goToSearch = () => {
    // 把当前参数传回首页，让首页回填
    const params = { ...searchParams }
    const queryString = Object.keys(params)
      .map(key => {
          let value = params[key]
          // 对于布尔值和数字类型，确保正确转换为字符串
          if (typeof value === 'boolean' || typeof value === 'number') {
              return `${key}=${encodeURIComponent(value.toString())}`
          }
          return `${key}=${encodeURIComponent(value || '')}`
      })
      .join('&')
    
    Taro.navigateTo({
      url: `/pages/index/index?${queryString}`
    })
  }

//   // 跳转到详情页
//   const goToDetail = (hotelId) => {
//     Taro.navigateTo({
//       url: `/pages/detail/index?hotelId=${hotelId}`
//     })
//   }

  // 格式化显示筛选条件
  const formatParams = () => {
    const { city, checkInDate, checkOutDate, roomNum, adultNum, childNum, star, priceRange } = searchParams
    const parts: string[] = []
    
    if (city) parts.push(city)
    if (checkInDate) parts.push(`${checkInDate}入住`)
    if (checkOutDate) parts.push(`${checkOutDate}离店`)
    if (roomNum) parts.push(`${roomNum}间`)
    if (adultNum) parts.push(`${adultNum}成人`)
    if (childNum && childNum !== '0') parts.push(`${childNum}儿童`)
    if (star) parts.push(`${star}星`)
    if (priceRange) {
      const priceMap = {
        '0-200': '¥200以下',
        '201-500': '¥201-500',
        '501-800': '¥501-800',
        '801+': '¥800以上'
      }
      parts.push(priceMap[priceRange] || priceRange)
    }
    
    return parts.join(' · ') || '请选择筛选条件'
  }
    return (
        <View className='hotel-list-page'>
        {/* 顶部筛选条件条 */}
        <View className='filter-bar' onClick={goToSearch}>
          <View className='filter-content'>
            <Text className='filter-icon'>🔍</Text>
            <Text className='filter-text'>{formatParams()}</Text>
          </View>
          <Button size='small' type='primary' className='filter-btn'>修改</Button>
        </View>
  
        {/* 快捷筛选标签 */}
        <View className='quick-filters'>
          <Tag 
            type={searchParams.priceRange === '0-200' ? 'primary' : 'default'}
            onClick={() => {/* 快速筛选逻辑 */}}
          >¥200以下</Tag>
          <Tag 
            type={searchParams.hasBreakfast === '1' ? 'primary' : 'default'}
            onClick={() => {/* 快速筛选逻辑 */}}
          >含早餐</Tag>
          <Tag 
            type={searchParams.hasParking === '1' ? 'primary' : 'default'}
            onClick={() => {/* 快速筛选逻辑 */}}
          >免费停车</Tag>
          <Tag 
            type={searchParams.nearby === 'subway' ? 'primary' : 'default'}
            onClick={() => {/* 快速筛选逻辑 */}}
          >近地铁</Tag>
        </View>
            {/* 列表标题/统计 */}
        <View className='list-header'>
            <Text className='count'>共 {hotelList.length} 家酒店</Text>
            <Text className='sort'>默认排序 ▼</Text>
        </View>
            <ScrollView 
                scrollY 
                className='list-wrapper' 
                style={{ height: 'calc(100vh - 200px)' }}
                enhanced
                showScrollbar={false}
            >
                {hotelList.length > 0 ? (
                    hotelList.map((item) => (
                        <Card
                            key={item._id}
                            // 1. 映射图片：如果有真实字段用 item.pic，没有就用你定义的 state.src 占位
                            src={item.imageUrl} 
                            // 2. 映射标题
                            title={item.hotelName}
                            // 3. 映射价格：假设后端还没给价格，先写死或根据状态判断
                            price={item.lowestPrice ? item.lowestPrice : "暂无报价"}
                            // 4. 映射描述（地址）
                            shopDescription={item.address}
                            // 5. 映射标签（星级）
                            description={
                                <div
                                  className="search_prolist_attr"
                                  style={{
                                    display: 'inline-flex',
                                    margin: '3px 0 1px',
                                    height: '15px',
                                  }}
                                >
                                <span style={wordStyles} className="word" >
                                {item.score}
                                </span>
                                </div>
                              }
                            shopName="查看详情 >"
                            // 6. 【关键】点击事件，通过箭头函数传递当前酒店 ID
                            onClick={() => {
                                const hotelId = item._id; // 假设后端返回的酒店 ID 字段是 _id
                                console.log('点击了酒店:', hotelId);
                                Taro.navigateTo({
                                    url: `/pages/detail/index?hotelId=${hotelId}` // 传递酒店 ID 到详情页
                                });
                            }}
                        />
                    ))
                ) : (
                    // 加载中或无数据的处理
                    !loading ? <View className='empty'>暂无数据</View> : <View>加载中...</View>
                )}
            </ScrollView>
        </View>
    );
}