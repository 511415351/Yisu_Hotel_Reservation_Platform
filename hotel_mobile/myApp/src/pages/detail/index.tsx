import React, { useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Image, ScrollView, Text } from '@tarojs/components'
import { Swiper, SwiperItem, Cell, Button, Divider, Rate, Tag, Empty } from '@nutui/nutui-react-taro'
import './index.scss'

export default function Index() {
    const router = useRouter()
    const params = router.params || {}
    const hotelId = params.hotelId?decodeURIComponent(params.hotelId):''
    console.log(`酒店ID:${hotelId}`)


    // 硬编码酒店数据
    const hotelDetail = {
        id: '1',
        hotelName: '希尔顿酒店',
        address: '北京市朝阳区建国路100号',
        hotelierPhone: '010-12345678',
        star: 5,
        distance: 2.5,
        features: ['免费停车', '健身房', '游泳池', '餐厅', '会议室', '接机服务'],
        images: [
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500',
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500'
        ]
     
    }

    // 硬编码房间数据
    const [rooms, setRooms] = useState([
        {
            id: '1',
            roomName: '豪华大床房',
            image: 'https://tse3.mm.bing.net/th/id/OIP.NwhnQmBYKY7x0pKq6TN69AHaFj?cb=defcache2&defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3',
            area: 45,
            bedType: '大床 (1.8米)',
            floor: '5-12层',
            price: 888,
            facilities: ['WiFi', '空调', '电视', '吹风机', '24小时热水', '洗漱用品'],
            available: true
        },
        {
            id: '2',
            roomName: '商务双床房',
            image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500',
            area: 38,
            bedType: '双床 (1.2米)',
            floor: '8-15层',
            price: 688,
            facilities: ['WiFi', '空调', '电视', '吹风机', '办公桌'],
            available: true
        },
        {
            id: '3',
            roomName: '行政套房',
            image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500',
            area: 80,
            bedType: '特大床 (2米)',
            floor: '20-25层',
            price: 1888,
            facilities: ['WiFi', '空调', '电视', '浴缸', '客厅', '迷你吧', '行政酒廊'],
            available: true
        },
        {
            id: '4',
            roomName: '家庭套房',
            image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=500',
            area: 65,
            bedType: '大床 + 单人床',
            floor: '10-18层',
            price: 1288,
            facilities: ['WiFi', '空调', '电视', '儿童用品', '厨房'],
            available: true
        },
        {
            id: '5',
            roomName: '标准大床房',
            image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500',
            area: 30,
            bedType: '大床 (1.5米)',
            floor: '3-8层',
            price: 488,
            facilities: ['WiFi', '空调', '电视', '吹风机'],
            available: true
        },
        {
            id: '6',
            roomName: '豪华套房',
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500',
            area: 95,
            bedType: '特大床 (2米)',
            floor: '26-30层',
            price: 2288,
            facilities: ['WiFi', '空调', '电视', '浴缸', '客厅', '迷你吧', '景观阳台'],
            available: true
        }
    ])

    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)

    // 模拟加载更多数据
    const loadMoreRooms = () => {
        if (loading || !hasMore) return
        
        setLoading(true)
        
        // 模拟异步加载
        setTimeout(() => {
            const moreRooms = [
                {
                    id: '7',
                    roomName: '总统套房',
                    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500',
                    area: 200,
                    bedType: '特大床 (2.2米)',
                    floor: '30层',
                    price: 8888,
                    facilities: ['WiFi', '空调', '电视', '浴缸', '客厅', '餐厅', '书房', '健身房', '桑拿'],
                    available: true
                },
                {
                    id: '8',
                    roomName: '无障碍房',
                    image: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=500',
                    area: 42,
                    bedType: '大床 (1.8米)',
                    floor: '2层',
                    price: 588,
                    facilities: ['WiFi', '空调', '电视', '无障碍设施', '紧急呼叫'],
                    available: true
                }
            ]
            
            setRooms(prevRooms => [...prevRooms, ...moreRooms])
            setHasMore(false) // 加载完后没有更多数据
            setLoading(false)
        }, 1000)
    }

    // 处理预订
    const handleBooking = (room) => {
        Taro.showToast({
            title: `预订${room.roomName}`,
            icon: 'none'
        })
        // 实际开发中可以跳转到预订页面
        // Taro.navigateTo({
        //     url: `/pages/booking/index?roomId=${room.id}`
        // })
    }

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
        >
            {/* 顶部轮播图 */}
            <Swiper
                className='detail-swiper'
                height='250px'
                autoPlay
                loop
            >
                {hotelDetail.images.map((img, index) => (
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
                        <Rate value={hotelDetail.star} readOnly />
                    </View>
                    {hotelDetail.distance && (
                        <Tag type='danger' round>
                            {hotelDetail.distance}km
                        </Tag>
                    )}
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
                    {hotelDetail.features.map((tag, index) => (
                        <Tag key={index} type='info' round>
                            {tag}
                        </Tag>
                    ))}
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
                {rooms.map((room) => (
                    <View key={room.id} className='room-item'>
                        <Image
                            className='room-image'
                            src={room.image}
                            mode='aspectFill'
                            lazyLoad
                        />
                        <View className='room-info'>
                            <View className='room-name'>
                                <Text className='name'>{room.roomName}</Text>
                                <Tag type='success' round>
                                    {room.area}㎡
                                </Tag>
                            </View>
                            
                            <View className='room-desc'>
                                <Text>🛏️ {room.bedType}</Text>
                                <Text>📌 {room.floor}</Text>
                            </View>
                            
                            <View className='room-facilities'>
                                {room.facilities.slice(0, 4).map((facility, index) => (
                                    <Tag key={index} type='default' round>
                                        {facility}
                                    </Tag>
                                ))}
                                {room.facilities.length > 4 && (
                                    <Tag type='default' round>
                                        +{room.facilities.length - 4}
                                    </Tag>
                                )}
                            </View>
                            
                            <View className='room-footer'>
                                <View className='price'>
                                    <Text className='currency'>¥</Text>
                                    <Text className='value'>{room.price}</Text>
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