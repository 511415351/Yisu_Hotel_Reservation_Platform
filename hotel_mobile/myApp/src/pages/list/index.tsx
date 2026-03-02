import {  useEffect, useState } from 'react'
import Taro from '@tarojs/taro';
import { View, Text ,ScrollView} from '@tarojs/components'
import { Card,Button,Tag} from '@nutui/nutui-react-taro'
import  api  from '../../api/index' 
import { HotelListParams } from '../../types/api' 
import './index.scss'
import {useRouter} from '@tarojs/taro'
import {ListMenu,CalendarCon} from '../../components'
import { SearchBar } from '@nutui/nutui-react-taro'

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
    const [pageNo, setPageNo] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [pageSize, setPageSize] = useState(5)
    const [searchKey, setSearchKey] = useState('')
 
    const [calendarVisible, setCalendarVisible] = useState(false)
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
    //构造api请求参数
   const buildParams = function (){
        const apiParams: any = {
                pageNo: pageNo,
                pageSize: pageSize,
            }
            
            // 添加筛选条件（如果有值）
            if (searchParams.city) {
                apiParams.location = searchParams.city
            }
            if (searchParams.hotelName) {
                apiParams.keyword = searchParams.hotelName
            }
            if (searchParams.checkInDate&&searchParams.checkOutDate) {
                apiParams.date = searchParams.checkInDate+'~'+searchParams.checkOutDate
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
            return apiParams
   }
    console.log('筛选条件:', searchParams)
    // 当筛选参数变化或页面刷新时时请求
    useEffect(() => {
        fetchList()
    }, [searchParams,pageNo])

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
            const apiParams = buildParams()
            const  data = await api.getHotelList(apiParams);
            if(pageNo === 1){
                setHotelList(data)
            }else{
                setHotelList(prev => [...prev,...data])
            }
            setHasMore(data.length >= pageSize )
            console.log('请求完成', { hasMore: data.length >= pageSize });
        } catch (error) {
            console.error('获取酒店列表失败:', error);
        } finally {
            setLoading(false)
        }
        
    }
    
    // 处理快捷筛选标签点击
    const handleQuickFilter = (type: string, value: any) => {
        setPageNo(1)
        setHotelList([])
        setSearchParams(prev => {
            const newParams = { ...prev }
            switch (type) {
                case 'hasBreakfast':
                    newParams.hasBreakfast = !newParams.hasBreakfast
                    break
                case 'hasParking':
                    newParams.hasParking = !newParams.hasParking
                    break
                case 'nearby':
                    newParams.nearby = newParams.nearby === 'subway' ? '' : 'subway'
                    break
            }
            return newParams
        })
    }
    const handleLoadMore = () => {
         console.log('触底了', { loading, hasMore, pageNo });
        if(loading || !hasMore) return
        if(!hasMore) return
        setPageNo(prev => prev + 1)
    }
   
   


useEffect(() => {
    const timer = setTimeout(() =>{
        setSearchParams(prev =>({...prev,hotelName:searchKey}))
        setPageNo(1)
        setHasMore(true)
        setHotelList([])
    },500)
    return () => clearTimeout(timer)
}, [searchKey])
    return (
        <View className='hotel-list-page'>
        <View className='filter'>
            {/* 搜索栏 */}
        <View className='search-row'>
            {/* 日期选择 */}
         <CalendarCon
                value={{ checkInDate: searchParams.checkInDate, checkOutDate: searchParams.checkOutDate }}
                visible={calendarVisible}
                onValueChange={(value)=>{setSearchParams((prev) => ({
                    ...prev,
                    checkInDate: value.checkInDate,
                    checkOutDate: value.checkOutDate
                }))}}
                onVisibleChange={setCalendarVisible}
                />

         <SearchBar onChange={(val: string) =>setSearchKey(val)} maxLength={10} />
        </View>
      
        
        {/**筛选条件菜单 */}
        {/* 只有当searchParams.city存在时才渲染ListMenu，确保拿到路由参数 */}
        {searchParams.city && (
          <ListMenu
            initialValues={{
              address: searchParams.city,
              stars: searchParams.star,
              priceRange: searchParams.priceRange
            }}
            onChange={(data)=>setSearchParams({...searchParams,star:data.stars,priceRange:data.priceRange,city:data.address})}
          />
        )}
        {/* 快捷筛选标签 */}
        <View className='quick-filters'>
          <Tag 
            type={searchParams.hasBreakfast ? 'info' : 'success'}
            onClick={() => handleQuickFilter('hasBreakfast', null)}
            style={{
                fontSize: '28rpx',
                height: '36rpx'
            }}
          >含早餐</Tag>
          <Tag 
            type={searchParams.hasParking ? 'info' : 'success'}
            onClick={() => handleQuickFilter('hasParking', null)}
            style={{
                fontSize: '28rpx',
                height: '36rpx'
            }}
          >免费停车</Tag>
          <Tag 
            type={searchParams.nearby === 'subway' ? 'info' : 'success'}
            onClick={() => handleQuickFilter('nearby', 'subway')}
            style={{
                fontSize: '28rpx',
                height: '36rpx'
            }}
          >近地铁</Tag>
        </View>
            {/* 列表标题/统计 */}
        <View className='list-header'>
            <Text className='count'>共 {hotelList.length} 家酒店</Text>
            <Text className='sort'>默认排序 ▼</Text>
        </View>
        </View>
            <ScrollView 
                scrollY 
                className='list-wrapper' 
                enhanced
                showScrollbar={false}
                lowerThreshold={50}
                onScrollToLower={handleLoadMore}
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
                                    url: `/pages/detail/index?hotelId=${hotelId}&checkInDate=${encodeURIComponent(searchParams.checkInDate)}&checkOutDate=${encodeURIComponent(searchParams.checkOutDate)}` // 传递酒店 ID 到详情页
                                });
                            }}
                        />
                    ))
                ) : (
                    // 加载中或无数据的处理
                    !loading ? <View className='empty'>暂无数据</View> : <View>加载中...</View>
                )}
                 {/* 加载更多状态 */}
                    {loading && (
                        <View className='loading-more'>
                            <Text>正在为您寻找更多酒店...</Text>
                        </View>
                    )}
        
                    {/* 没有更多数据 */}
                    {!hasMore && (
                        <View className='no-more'>
                            <Text>—— 没有更多酒店了 ——</Text>
                        </View>
                    )}
            </ScrollView>
        </View>
    );
}