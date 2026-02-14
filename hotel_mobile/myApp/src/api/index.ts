import request from "../utils/request";
import type {  HotelListParams,HotelParams } from "../types/api";
export default {
    
    getHotelList(params:any){
        return request.get<HotelListParams[]>('/api/hotels/gethotellist',params);
    },
    getHotelDetail(hotelId:string){
        return request.get<HotelParams>('/api/hotels/gethotelinfo', { hotelId });
    }
    
};