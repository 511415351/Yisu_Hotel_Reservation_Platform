//酒店模块
export interface HotelListParams {
    _id: string;
    hotelName: string;
    status: number;
    address: string;
}

export interface HotelParams {
    hotelId: string;
    hotelName: string;
    status: number;
    address: string;
    hotelierName: string;
    hotelierPhone: string;
}