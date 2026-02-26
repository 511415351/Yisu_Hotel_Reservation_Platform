import Taro from '@tarojs/taro'
import { View, ScrollView, Image, Text } from '@tarojs/components'
import { HotelListParams, HotelParams } from 'src/types/api'

const defaultHotelImages: HotelListParams[] = [
  {
    _id: '1',
    hotelName: '度假酒店',
    status: 4.5,
    address: '',
    score:4.5,
    lowestPrice:'100',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
  },
  {
     _id: '1',
    hotelName: '度假酒店',
    status: 4.5,
    address: '',
    score:4.5,
    lowestPrice:'100',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
  },
]

import { Swiper } from '@nutui/nutui-react-taro'
import {
  CommonEventFunction,
  SwiperProps as TaroSwiperProps,
} from '@tarojs/components'

const AdBanner = () => {
    const handleHotelClick = (hotel: HotelListParams) => {
            console.log(`${hotel._id}`)
            Taro.navigateTo({
              url: `/pages/detail/index?hotelId=${hotel._id}`,      
            })
          }
    const onChange: CommonEventFunction<TaroSwiperProps.onChangeEventDetail> = (e) => {
    console.log('当前 index:', e.detail.current)
    }
  return (
    <Swiper
      className='ad-banner-swiper'
      defaultValue={0}
      autoPlay={false}
      indicator
      onChange={onChange}
    >
      {defaultHotelImages.map((hotel: HotelListParams, index) => (
        <Swiper.Item key={hotel._id}>
        <Image
            mode="aspectFill"
            style={{ width: '100%', height: '100%' }}
            onClick={() => handleHotelClick(hotel)}
            src={hotel.imageUrl}
        />
        </Swiper.Item>
      ))}
    </Swiper>
  )
}
export default AdBanner
