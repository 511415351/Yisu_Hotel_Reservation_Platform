import {  useEffect, useState ,useCallback,useReducer} from 'react'
import Taro from '@tarojs/taro';
import { View, Text ,ScrollView} from '@tarojs/components'
import { Card,Tag} from '@nutui/nutui-react-taro'
import  api  from '../../api/index' 
import { HotelListParams } from '../../types/api' 
import './index.scss'
import {useRouter} from '@tarojs/taro'
import {ListMenu,CalendarCon} from '../../components'
import { SearchBar } from '@nutui/nutui-react-taro'



//星级标题样式--常量
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

//定义酒店列表查询参数
interface HotelListSearchParams {
    city: string
    hotelName: string
    checkInDate: string
    checkInTime: string
    checkOutDate: string
    checkOutTime: string
    roomNum: number
    adultNum: number
    childNum: number
    star: number
    priceRange: string
    nearby: string
    hasBreakfast: boolean
    hasParking: boolean
}
interface QueryState extends HotelListSearchParams {
  pageNo: number;
}
type QueryAction =
|{type:'SET_FILTERS';payload:Partial<HotelListSearchParams>}
|{type:'NEXT_PAGE'}
|{type:'RESET_PAGE'}

const initialState:QueryState = {
  pageNo: 1,
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
}
function queryReducer(state:QueryState,action:QueryAction):QueryState{
  switch(action.type){
    case 'SET_FILTERS':
      return {...state,...action.payload,pageNo:1}
    case 'NEXT_PAGE':
      return {...state,pageNo:state.pageNo+1}
    case 'RESET_PAGE':
      return {...state,pageNo:1}
    default:
      return state
  }
}

export default function HotelList() {
    const router = useRouter()
    // const [searchParams, setSearchParams] = useState<HotelListSearchParams>({
    //     city:'',
    //     hotelName: '',
    //     checkInDate:  '',
    //     checkInTime:  '',
    //     checkOutDate:  '',
    //     checkOutTime:   '',
    //     roomNum:  1,
    //     adultNum:   1,
    //     childNum:  0,
    //     star:  0,
    //     priceRange: '',
    //     nearby:  '',
    //     hasBreakfast: false,
    //     hasParking: false,
    // })
    // const [pageNo, setPageNo] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [pageSize, setPageSize] = useState(5)
    const [searchKey, setSearchKey] = useState('')
    const [calendarVisible, setCalendarVisible] = useState(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [hotelList, setHotelList] = useState<HotelListParams[]>([])
    const [query,dispatch] = useReducer(queryReducer,initialState)
    //解析路由参数并填充searchParams
    useEffect(() => {
        if (router.params) {
            const params:Partial<HotelListSearchParams> = {}
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
            }) ;
             dispatch({type:'SET_FILTERS',payload:params});      
        }
    }, [router.params])
    console.log('筛选条件:', query)
    //构造api请求参数
    const buildParams = function (currentQuery:QueryState){
        const apiParams: any = {
                pageNo: currentQuery.pageNo,
                pageSize: pageSize,
            }
            
            // 添加筛选条件（如果有值）
            if (currentQuery.city) {
                apiParams.location = currentQuery.city
            }
            if (currentQuery.hotelName) {
                apiParams.keyword = currentQuery.hotelName
            }
            if (currentQuery.checkInDate&&currentQuery.checkOutDate) {
                apiParams.date = currentQuery.checkInDate+'~'+currentQuery.checkOutDate
            }
            
            if(currentQuery.star) {
                apiParams.stars = currentQuery.star     
            }
            if(currentQuery.priceRange) {
                apiParams.priceRange = currentQuery.priceRange
            }
            if(currentQuery.nearby) {
                apiParams.nearby = currentQuery.nearby
            }
            if(currentQuery.hasBreakfast) {
                apiParams.hasBreakfast = currentQuery.hasBreakfast
            }
            if(currentQuery.hasParking) {
                apiParams.hasParking = currentQuery.hasParking
            }
            console.log('API 请求参数:', apiParams)
            return apiParams
    }
   
   
    // 调用API获取酒店列表
    const fetchList = async (currentQuery:QueryState) =>  {
        setLoading(true)
        try {
            // 构建 API 请求参数，包含筛选条件
            const apiParams = buildParams(currentQuery)
            const  data = await api.getHotelList(apiParams);
            if(!data) setHotelList([]);
            // 处理分页逻辑
            if(currentQuery.pageNo === 1){
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

     // 当筛选参数变化或页面刷新时时请求
    useEffect(() => {
        fetchList(query)
    }, [query])
   
    
    // 处理快捷筛选标签点击
    const handleQuickFilter = useCallback((type: string) => {
        dispatch({
            type:'SET_FILTERS',
            payload:{[type]:type === 'nearby'?(query.nearby === 'subway'?'':'subway'):!query[type]}
        })
    },[query])
    // 加载更多酒店列表
    const handleLoadMore = () => {
         console.log('触底了');
        if(loading || !hasMore) return
        dispatch({
            type:'NEXT_PAGE'
        })
    }
    // 处理搜索栏输入，添加防抖效果
    useEffect(() => {
        const timer = setTimeout(() =>{
           dispatch({
            type:'SET_FILTERS',
            payload:{hotelName:searchKey}
           })
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
                value={{ checkInDate: query.checkInDate, checkOutDate: query.checkOutDate }}
                visible={calendarVisible}
                onValueChange={(value)=>{
                    dispatch({
                        type:'SET_FILTERS',
                        payload:{checkInDate: value.checkInDate, checkOutDate: value.checkOutDate}
                    })
                }}
                onVisibleChange={setCalendarVisible}
                />

            <SearchBar onChange={(val: string) =>setSearchKey(val)} maxLength={10} />
            </View>
        
            
            {/**筛选条件菜单 */}
            {/* 只有当query.city存在时才渲染ListMenu，确保拿到路由参数 */}
            {query.city && (
            <ListMenu
                initialValues={{
                address: query.city,
                stars: query.star,
                priceRange: query.priceRange
                }}
                onChange={(data) => {
                if (data.stars !== query.star || data.priceRange !== query.priceRange || data.address !== query.city) {
                    dispatch({ type: 'SET_FILTERS', payload: { star: data.stars, priceRange: data.priceRange, city: data.address } });
                }
                }
                }
            />
            )}
            {/* 快捷筛选标签 */}
            <View className='quick-filters'>
            <Tag 
                type={query.hasBreakfast ? 'info' : 'success'}
                onClick={() => handleQuickFilter('hasBreakfast')}
                style={{
                    fontSize: '28rpx',
                    height: '36rpx'
                }}
            >含早餐</Tag>
            <Tag 
                type={query.hasParking ? 'info' : 'success'}
                onClick={() => handleQuickFilter('hasParking')}
                style={{
                    fontSize: '28rpx',
                    height: '36rpx'
                }}
            >免费停车</Tag>
            <Tag 
                type={query.nearby === 'subway' ? 'info' : 'success'}
                onClick={() => handleQuickFilter('nearby')}
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
        {/** 酒店列表，滚动展示，上滑自动加载*/}
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
                                url: `/pages/detail/index?hotelId=${hotelId}&checkInDate=${encodeURIComponent(query.checkInDate)}&checkOutDate=${encodeURIComponent(query.checkOutDate)}` // 传递酒店 ID 到详情页
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
                {(!hasMore && hotelList.length > 0) && (
                    <View className='no-more'>
                        <Text>—— 没有更多酒店了 ——</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}