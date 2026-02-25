import React, { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Image, ScrollView,Text } from '@tarojs/components'
import { Swiper, SwiperItem, Cell, Button, Divider, Skeleton } from '@nutui/nutui-react-taro'
import api from '../../api/index'
import { HotelParams } from '../../types/api'
import './index.scss'

export default function Index() {
    const router = useRouter()
    const { hotelId } = router.params
    const [hotelDetail, setHotelDetail] = useState<HotelParams | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const getDetail = async () => {
        if (!hotelId) return
        setLoading(true)
        try {
        const res = await api.getHotelDetail(hotelId as string) 
        console.log('酒店详情数据:', res)
        setHotelDetail(res)
        } catch (error) {
        Taro.showToast({ title: '加载详情失败', icon: 'none' })
        } finally {
        setLoading(false)
        }
    }
     useEffect(() => {
        getDetail()
    }, [hotelId])

    if (loading) {
        return <Skeleton rows={10} title animated />
    }
    return (
        <View>
            <Text>这是酒店详情页面</Text>
            {hotelDetail && (
                <View>
                    <Text>{hotelDetail.hotelName}</Text>
                    <Text>{hotelDetail.address}</Text>
                    <Text>{hotelDetail.hotelierName}</Text>
                    <Text>{hotelDetail.hotelierPhone}</Text>
                </View>
            )}
        </View>
    );
}