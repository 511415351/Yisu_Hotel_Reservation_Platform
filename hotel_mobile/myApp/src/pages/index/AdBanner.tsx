import Taro from '@tarojs/taro'
import { View, ScrollView, Image, Text } from '@tarojs/components'
import { HotelParams } from 'src/types/api'

const defaultHotelImages: HotelParams[] = [
  {
    hotelId: '1',
    hotelName: '度假酒店',
    status: 4.5,
    address: '',
    hotelierName: '',
    hotelierPhone: '123',
    hotelImage: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
  },
  {
    hotelId: '2',
    hotelName: '度假酒店',
    status: 4.5,
    address: '',
    hotelierName: '',
    hotelierPhone: '123',
    hotelImage: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
  },
]

import { Swiper } from '@nutui/nutui-react-taro'
import {
  CommonEventFunction,
  SwiperProps as TaroSwiperProps,
} from '@tarojs/components'

const AdBanner = () => {
    const handleHotelClick = (hotel: HotelParams) => {
            console.log(`${hotel.hotelId}`)
            Taro.navigateTo({
              url: `/pages/detail/index?hotelId=${hotel.hotelId}`,
            })
          }
    const onChange: CommonEventFunction<TaroSwiperProps.onChangeEventDetail> = (e) => {
    console.log('当前 index:', e.detail.current)
    }
  return (
    <Swiper
      className='ad-banner-swiper'
      defaultValue={0}
      autoPlay
      indicator
      onChange={onChange}
    >
      {defaultHotelImages.map((hotel: HotelParams, index) => (
        <Swiper.Item key={hotel.hotelId}>
        <Image
            mode="aspectFill"
            style={{ width: '100%', height: '100%' }}
            onClick={() => handleHotelClick(hotel)}
            src={hotel.hotelImage}
        />
        </Swiper.Item>
      ))}
    </Swiper>
  )
}
export default AdBanner
