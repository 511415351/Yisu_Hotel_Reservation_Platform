import request from "../utils/request";
import type { ILoginParams, IRegisterParams, HotelListParams, HotelParams, HotelRoomParams, ReasonParams, CreateHotelParams,CreateHotelDetailParams, CreateHotelRoomParams, CreateReasonParams } from "../types/api";
import axios from "axios";
const { create, get } = axios;
interface IUploadResponse {
    url: string;
}
export default {
    
    login(params: ILoginParams){
        return request.post('/user/login', params);
    },
    register(params: IRegisterParams){
        return request.post('/user/register', params);
    },
    getHotelList(params:any){
        return request.get<HotelListParams>('/hotels/gethotellist',params);
    },
    getHotel(params:any){
        return request.get<HotelParams>('/hotels/gethotelinfo',params);
    },
    getReason(params:any){
        return request.get<ReasonParams>('/hotels/getreasons',params);
    },
    createReason(params: CreateReasonParams){
        return request.post<CreateReasonParams>('/hotels/createreasons', params);
    },
    createHotelBa(params: CreateHotelParams){
        return request.put<CreateHotelParams>('/hotels/creathotelinfo', params);
    },
    createHotelDetail(params: CreateHotelDetailParams){
        return request.put<CreateHotelDetailParams>('/hotels/creathotelinfo/detail', params);
    },   
    createHotelRoom(params: CreateHotelRoomParams){
        return request.put<CreateHotelRoomParams>('/hotels/createrooms', params);
    },
    uploadImage(file: File) {
        const formData = new FormData();
        formData.append('file', file); // 这里的 'file' 必须对应后端的 upload.single('file')
        return request.post<IUploadResponse>('/upload', formData); 
    }
};