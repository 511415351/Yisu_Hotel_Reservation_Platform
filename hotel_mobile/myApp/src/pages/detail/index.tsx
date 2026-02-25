import React, { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Image, ScrollView, Text } from '@tarojs/components'
import { Swiper, SwiperItem, Cell, Button, Divider, Rate, Tag, Empty } from '@nutui/nutui-react-taro'
import './index.scss'
import { HotelParams,RoomParams} from '../../types/api'
import  api  from '../../api/index' 
export default function Index() {
    const router = useRouter()
    const params = router.params || {}
    const hotelId = params.hotelId?decodeURIComponent(params.hotelId):''
    console.log(`酒店ID:${hotelId}`)


    // 硬编码酒店数据
    const [hotelDetail, setHotelDetail] = useState<HotelParams>({
        hotelId: '1',
        hotelName: '希尔顿酒店',
        openingTime: '2026-01-01',
        hotelierEmail: '1234567890@qq.com',
        hotelierName: '张三',
        hotelierPhone: '010-12345678',
        address: '北京市朝阳区建国路100号',
        star: 5,
        score: 4,
        hasBreakfast: true,
        hasParking: true,
        hotelRooms: [
            {
                id: '1',
                roomName: '大床房',
                roomPrice: '600',
                roomPicture: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
                number: '2',
                hasTV: true,
                hasWifi: true,
                hasWindow: true,
                hasBathtub: true
            }
        ],
        imageUrl: [
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500',
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500'
        ]
     
    })
    useEffect(() => {
        fetchHotelDetail()
    }, [hotelId])
    
    const [rooms, setRooms] = useState<RoomParams[]>([
        {
            id: '1',
                roomName: '大床房',
                roomPrice: '600',
                roomPicture: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
                number: '2',
                hasTV: true,
                hasWifi: true,
                hasWindow: true,
                hasBathtub: true
        },
        {
            id: '2',
                roomName: '大床房',
                roomPrice: '600',
                roomPicture: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
                number: '2',
                hasTV: true,
                hasWifi: true,
                hasWindow: true,
                hasBathtub: true
        },
        {
            id: '3',
            roomName: '大床房',
            roomPrice: '600',
            roomPicture: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
            number: '2',
            hasTV: true,
            hasWifi: true,
            hasWindow: true,
            hasBathtub: true
        },
        {
            id: '4',
                roomName: '大床房',
                roomPrice: '600',
                roomPicture: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
                number: '2',
                hasTV: true,
                hasWifi: true,
                hasWindow: true,
                hasBathtub: true
        },
        {
            id: '5',
                roomName: '大床房',
                roomPrice: '600',
                roomPicture: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
                number: '2',
                hasTV: true,
                hasWifi: true,
                hasWindow: true,
                hasBathtub: true
        },
        {
            id: '6',
            roomName: '大床房',
            roomPrice: '600',
            roomPicture: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
            number: '2',
            hasTV: true,
            hasWifi: true,
            hasWindow: true,
            hasBathtub: true
        }
    ])

    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(2)
    const [refreshing, setRefreshing] = useState(false)
 // 获取酒店详情
    const fetchHotelDetail = async () => {
        if (!hotelId) return
        
        // 重置分页状态
        setCurrentPage(1)
        setHasMore(true)
        setLoading(true)
        
        try {
            // 调用接口获取酒店详情
            const res = await api.getHotelDetail(hotelId)
            
            if (res) {
                setHotelDetail(res)
                setRooms(res.hotelRooms || [])
            }
        } catch (error) {
            console.error('获取酒店详情失败', error)
            Taro.showToast({
                title: '加载酒店信息失败',
                icon: 'none'
            })
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    // 处理下拉刷新
    const handleRefresh = () => {
        setRefreshing(true)
        fetchHotelDetail()
    }

    // 加载更多房间数据
    const loadMoreRooms = () => {
        if (loading || !hasMore) return
        
        setLoading(true)
        
        // 模拟异步加载
        setTimeout(() => {
            const nextPage = currentPage + 1
            const totalRooms = rooms.length
            const maxPage = Math.ceil(totalRooms / pageSize)
            
            if (nextPage > maxPage) {
                setHasMore(false) // 没有更多数据
            } else {
                setCurrentPage(nextPage) // 增加页码
            }
            
            setLoading(false)
        }, 1000)
    }

    // 处理预订
    const handleBooking = (room) => {
        Taro.showToast({
            title: `预订${room.roomName}`,
            icon: 'none'
        })}
    // 拨打酒店电话
    const handleCall = () => {
        Taro.makePhoneCall({
            phoneNumber: hotelDetail.hotelierPhone
        })
    }

    // 查看地图
    const handleMap = () => {
        Taro.openLocation({
            latitude: 39.9087, // 示例坐标
            longitude: 116.3975,
            name: hotelDetail.hotelName,
            address: hotelDetail.address
        })
    }

    return (
        <ScrollView
            className='hotel-detail'
            scrollY
            enhanced
            showScrollbar={false}
            lowerThreshold={50}
            onScrollToLower={loadMoreRooms}
            refresherEnabled={true}
            refresherTriggered={refreshing}
            onRefresherRefresh={handleRefresh}
        >
            {/* 顶部轮播图 */}
            <Swiper
                className='detail-swiper'
                height='250px'
                autoPlay
                loop
            >
                {hotelDetail.imageUrl.map((img, index) => (
                    <SwiperItem key={index}>
                        <Image
                            className='swiper-image'
                            src={img}
                            mode='aspectFill'
                            lazyLoad
                        />
                    </SwiperItem>
                ))}
            </Swiper>

            {/* 酒店基本信息 */}
            <View className='hotel-info-section'>
                <View className='hotel-header'>
                    <View className='hotel-title'>
                        <Text className='name'>{hotelDetail.hotelName}</Text>
                        <Rate  allowHalf value={hotelDetail.star} readOnly />
                    </View>
                </View>

                <View className='hotel-address'>
                    <View className='address-icon'>📍</View>
                    <Text className='address-text'>{hotelDetail.address}</Text>
                    <Button 
                        size='small' 
                        fill='outline'
                        onClick={handleMap}
                    >
                        查看地图
                    </Button>
                </View>

                <View className='hotel-tags'>
                   {hotelDetail.hasBreakfast && (
                    <Tag type='info' round>
                        含早餐
                    </Tag>
                   )}
                   {hotelDetail.hasParking && (
                    <Tag type='info' round>
                        含停车
                    </Tag>
                   )}
                </View>

                <Divider />

                <Cell
                    title='📞 联系电话'
                    description={hotelDetail.hotelierPhone}
                    extra={
                        <Button size='small' type='primary' onClick={handleCall}>
                            拨打
                        </Button>
                    }
                />
            </View>

            {/* 房间列表标题 */}
            <View className='room-section-title'>
                <Text className='title'>🏨 客房选择</Text>
                <Text className='count'>共{rooms.length}种房型</Text>
            </View>

            {/* 房间列表 */}
            <View className='room-list'>
                {rooms.slice(0, currentPage * pageSize).map((room) => (
                    <View key={room.id} className='room-item'>
                        <Image
                            className='room-image'
                                src={room.roomPicture || ''}
                            mode='aspectFill'
                            lazyLoad
                        />
                        <View className='room-info'>
                            <View className='room-name'>
                                <Text className='name'>{room.roomName}</Text>
                            </View>
                            
                            <View className='room-desc'>
                                <Text>剩🛏️ {room.number}间</Text>
                            </View>
                            <View className='room-footer'>
                                <View className='price'>
                                    <Text className='currency'>¥</Text>
                                    <Text className='value'>{room.roomPrice}</Text>
                                    <Text className='unit'>/晚</Text>
                                </View>
                                <Button
                                    type='primary'
                                    size='small'
                                    onClick={() => handleBooking(room)}
                                >
                                    立即预订
                                </Button>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* 加载更多状态 */}
            {loading && (
                <View className='loading-more'>
                    <Text>加载更多房型中...</Text>
                </View>
            )}

            {/* 没有更多数据 */}
            {!hasMore && (
                <View className='no-more'>
                    <Text>—— 没有更多房型了 ——</Text>
                </View>
            )}
        </ScrollView>
    )
}