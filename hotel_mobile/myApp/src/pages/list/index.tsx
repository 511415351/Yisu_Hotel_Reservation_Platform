import React, {  useEffect, useRef,useState } from 'react'
import Taro from '@tarojs/taro';
import { View, Text, Button as NativeButton } from '@tarojs/components'
import { Button as NutButton ,Form,Input,Cascader, Cell,Space ,Card,VirtualList} from '@nutui/nutui-react-taro'
import CalenderCon from './Calendar'
import RoomNumber from './RoomNumber'
import './index.scss'

export default function HotelList() {
    const state = {
        src: '//img10.360buyimg.com/n2/s240x240_jfs/t1/210890/22/4728/163829/6163a590Eb7c6f4b5/6390526d49791cb9.jpg!q70.jpg',
        title:
        '666酒店',
        price: '388',
        vipPrice: '378',
        shopDescription: '自营',
        delivery: '厂商配送',
        shopName: '阳澄湖大闸蟹自营店>',
    }
    const goToDetail = (values) => {
            console.log('表单数据:', values);
            Taro.navigateTo({
                url: '/pages/detail/index' 
            });
        };
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
            <Card
            src={state.src}
            title={state.title}
            price={state.price}
            vipPrice={state.vipPrice}
            shopDescription={state.shopDescription}
            delivery={state.delivery}
            shopName={state.shopName}
            onClick={goToDetail}
            />
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