import React, { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Image, ScrollView, Text } from '@tarojs/components'
import { Swiper, SwiperItem, Cell, Button, Divider, Rate, Tag, Empty, Space } from '@nutui/nutui-react-taro'
import './index.scss'
import { HotelParams,RoomParams} from '../../types/api'
import  api  from '../../api/index' 
import {CalendarCon} from '../../components'
export default function Index() {
    const router = useRouter()
    const params = router.params || {}
    const hotelId = params.hotelId?decodeURIComponent(params.hotelId):''
    console.log(`酒店ID:${hotelId}`)


    // 酒店详情数据
    const [hotelDetail, setHotelDetail] = useState<HotelParams>({
        hotelId: '',
        hotelName: '',
        openingTime: '',
        hotelierEmail: '',
        hotelierName: '',
        hotelierPhone: '',
        address: '',
        stars: 0,
        score: 0,
        hasBreakfast: false,
        hasParking: false,
        hotelRooms: [],
        imageUrl: []
    })
    useEffect(() => {
        fetchHotelDetail()
    }, [hotelId])

     const getInitialDate = (paramName:string)=>{
        if(router.params[paramName]){
            return decodeURIComponent(router.params[paramName])
        }
        return ''
    }
    const [rooms, setRooms] = useState<RoomParams[]>([])

    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(2)
    const [refreshing, setRefreshing] = useState(false)
    const [checkInDate, setCheckInDate] = useState(getInitialDate('checkInDate'))
    const [checkOutDate, setCheckOutDate] = useState(getInitialDate('checkOutDate'))
    const [calendarVisible, setCalendarVisible] = useState(false)
    
   
 // 获取酒店详情
    const fetchHotelDetail = async () => {
        if (!hotelId) return
        
        // 重置分页状态
        setCurrentPage(1)
        setHasMore(true)
        setLoading(true)
        
        try {
            // 调用接口获取酒店详情
            console.log(`获取酒店详情:hotelId:${hotelId}`)
            const res = await api.getHotelDetail(hotelId)
           
            if (res) {
                console.log('获取酒店详情成功', res)
                setHotelDetail(res)
                setRooms(res.hotelRooms || [])
            } else {
                console.log('获取酒店详情成功，但返回数据为空')
                // 如果返回数据为空，使用硬编码数据
                useHardcodedData()
            }
        } catch (error) {
            console.error('获取酒店详情失败', error)
            if(error.data){
                console.log('酒店详情获取失败，但是返回了数据，使用返回数据')
                setHotelDetail(error.data)
                setRooms(error.data.hotelRoom || [])
            }else{
            Taro.showToast({
                title: '加载酒店信息失败，使用默认数据',
                icon: 'none'
                
            }) // 请求失败时使用硬编码数据
            useHardcodedData()
            }
           
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }
    
    // 使用硬编码数据作为备用
    const useHardcodedData = () => {
        console.log('使用硬编码数据作为备用')
        // 硬编码酒店数据
        const hardcodedHotel: HotelParams = {
            hotelId: hotelId || '1',
            hotelName: '希尔顿酒店',
            openingTime: '2026-01-01',
            hotelierEmail: '1234567890@qq.com',
            hotelierName: '张三',
            hotelierPhone: '010-12345678',
            address: '北京市朝阳区建国路100号',
            stars: 5,
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
                },
                {
                    id: '2',
                    roomName: '双床房',
                    roomPrice: '550',
                    roomPicture: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
                    number: '3',
                    hasTV: true,
                    hasWifi: true,
                    hasWindow: true,
                    hasBathtub: true
                },
                {
                    id: '3',
                    roomName: '豪华套房',
                    roomPrice: '1200',
                    roomPicture: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
                    number: '1',
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
        }
        
        setHotelDetail(hardcodedHotel)
        setRooms(hardcodedHotel.hotelRooms || [])
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
            icon: 'success'
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
            {hotelDetail.imageUrl && hotelDetail.imageUrl.length > 0 ? (
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
            ) : (
                <View className='no-images'>
                    <Text>暂无图片</Text>
                </View>
            )}

            {/* 酒店基本信息 */}
            <View className='hotel-info-section'>
                <View className='hotel-header'>
                    <View className='hotel-title'>
                        <Text className='name'>{hotelDetail.hotelName}</Text>
                        <Rate  allowHalf value={hotelDetail.stars} readOnly />
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
                        可停车
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
                    style={{
                        backgroundColor: '#dfeffaff',
                        padding: '16rpx 12rpx',
                        margin: '0',
                    }}
                />
            </View>
            <View className='select-data'>
                   {/* 日期选择 */}
                <CalendarCon
                value={{ checkInDate: checkInDate, checkOutDate: checkOutDate }}
                visible={calendarVisible}
                onValueChange={(value)=>{
                    setCheckInDate(value.checkInDate)
                    setCheckOutDate(value.checkOutDate)
                }}
                onVisibleChange={setCalendarVisible}
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

                            <View className='room-tags'>
                            <Space>
                            {room.hasTV && (
                                <Tag type='info' >
                                    含电视
                                </Tag>
                            )}
                             {room.hasWifi && (
                                <Tag type='info' >
                                    含Wifi
                                </Tag>
                            )}
                            {room.hasBathtub && (
                                <Tag type='info' >
                                    含浴缸
                                </Tag>
                            )}
                            {room.hasWindow && (
                                <Tag type='info' >
                                    含窗户
                                </Tag>
                            )}
                            </Space>
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