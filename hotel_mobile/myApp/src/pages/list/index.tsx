import {  useEffect, useRef,useState } from 'react'
import Taro from '@tarojs/taro';
import { View, Text ,ScrollView} from '@tarojs/components'
import { Card,VirtualList} from '@nutui/nutui-react-taro'
import  api  from '../../api/index' 
import { HotelListParams } from '../../types/api' 
import './index.scss'
import {useRouter} from '@tarojs/taro'

export default function HotelList() {
    const router = useRouter()
    const params = router.params || {}
    
    // 从路由参数中解析筛选条件
    const searchParams = {
        city: params.city ? decodeURIComponent(params.city) : '',
        hotelName: params.hotelName ? decodeURIComponent(params.hotelName) : '',
        checkInDate: params.checkInDate || '',
        checkInTime: params.checkInTime || '',
        checkOutDate: params.checkOutDate || '',
        checkOutTime: params.checkOutTime || '',
        roomNum: params.roomNum ? parseInt(params.roomNum) : 1,
        adultNum: params.adultNum ? parseInt(params.adultNum) : 1,
        childNum: params.childNum ? parseInt(params.childNum) : 0,
    }
    
    console.log('从首页传递的筛选条件:', searchParams)
    
    const state = {
        src: 'https://tse3.mm.bing.net/th/id/OIP.NwhnQmBYKY7x0pKq6TN69AHaFj?cb=defcache2&defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3',
        title:
        '666酒店',
        price: '388',
        vipPrice: '378',
        shopDescription: '4.9分  |  1000+人评价  |  免费取消',
        delivery: '五星级酒店',
        shopName: '上海店>',
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
                apiParams.city = searchParams.city
            }
            if (searchParams.hotelName) {
                apiParams.hotelName = searchParams.hotelName
            }
            if (searchParams.checkInDate) {
                apiParams.checkInDate = searchParams.checkInDate
                apiParams.checkInTime = searchParams.checkInTime
            }
            if (searchParams.checkOutDate) {
                apiParams.checkOutDate = searchParams.checkOutDate
                apiParams.checkOutTime = searchParams.checkOutTime
            }
            if (searchParams.roomNum) {
                apiParams.roomNum = searchParams.roomNum
            }
            if (searchParams.adultNum) {
                apiParams.adultNum = searchParams.adultNum
            }
            if (searchParams.childNum !== undefined) {
                apiParams.childNum = searchParams.childNum
            }
            
            console.log('API 请求参数:', apiParams)
            const data = await api.getHotelList(apiParams);
            console.log('酒店列表数据:', data);
            setHotelList(data)
        } catch (error) {
            console.error('获取酒店列表失败:', error);
        } finally {
            setLoading(false)
        }
        
    }
    useEffect(() => {
        fetchList()
    }, [])
    const [list, setList] = useState<string[]>([])
    const [pageNo, setPageNo] = useState(1)
    const isLoading = useRef(false)
    const getData = () => {
        const data: string[] = []
        const pageSize = 20
        for (let i = (pageNo - 1) * pageSize; i < pageNo * pageSize; i++) {
        const num = i > 9 ? i : `0${i}`
        data.push(`list${num}`)
        }
        setList((list: string[]) => {
        return [...list, ...data]
        })
        setTimeout(() => {
        isLoading.current = false
        }, 30)
    }
    const itemRender = (data: any) => {
        return <p>{data}</p>
    }
    const onScroll = () => {
        if (pageNo > 25 || isLoading.current) return
        isLoading.current = true
        setPageNo(pageNo + 1)
    }
    useEffect(() => {
        getData()
    }, [pageNo])
    return (
        <View>
            <Text>这是酒店列表页面</Text>
            <ScrollView scrollY className='list-wrapper' style={{ height: '100vh' }}>
                {hotelList.length > 0 ? (
                    hotelList.map((item) => (
                        <Card
                            key={item._id}
                            // 1. 映射图片：如果有真实字段用 item.pic，没有就用你定义的 state.src 占位
                            src={state.src} 
                            // 2. 映射标题
                            title={item.hotelName}
                            // 3. 映射价格：假设后端还没给价格，先写死或根据状态判断
                            price={item.status === 1 ? "388" : "暂无报价"}
                            vipPrice={item.status === 1 ? "350" : ""}
                            // 4. 映射描述（地址）
                            shopDescription={item.address}
                            // 5. 映射标签（星级）
                            delivery={item.status === 1 ? "已开业" : "筹备中"}
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
            
            <VirtualList
            containerHeight={500}
            itemHeight={66}
            list={list}
            itemRender={itemRender}
            onScroll={onScroll}
            />
        </View>
    );
}