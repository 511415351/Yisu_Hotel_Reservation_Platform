// 登录模块
export interface ILoginParams {
    userName: string;
    userPwd: string;
}
export interface IRegisterParams {
    userName: string;
    userPwd: string;
    email: string;
    userType: string;
}

//酒店模块
export interface HotelListParams {
    hotelId: string;
    hotelName: string;
    status: number;
    score: number;
    address: string;
    openingTime: string;
    imageUrl: string;
}

export interface HotelParams {
    hotelId: string;
    hotelName: string;
    status: number;
    address: string;
    hotelierEmail: string;
    hotelierPhone: string;
    openingTime: string;
    imageUrl: string;
    hotelRoomList: HotelRoomParams[];
}

export interface HotelRoomParams {
    id: string;
    hotelId: string;
    roomType: string;
    roomPrice: number;
    number: number;
    bedType: string;
    bedCount: number;
    hasTV: boolean;
    hasWifi: boolean;
    hasWindow: boolean;
    hasBathtub: boolean;
}

export interface ReasonParams {
    id: string;
    reason: string;
}

export interface CreateHotelParams {
    userId: number;
    hotelId: string;
    hotelName: string;
    hotelierName: string;
    hotelierEmail: string;
    hotelierPhone: string;
    address: string;
    stars: number;
    status: number;
}

export interface CreateHotelDetailParams {
    hotelId: string;
    hasBreakfast: boolean;
    hasParking: boolean;
    address: string;
    nearby: string;
    openingTime: string;
    picture: string;
    stars: number;
}
export interface CreateHotelRoomParams {
    id: string;
    hotelId: string;
    roomName: string;
    roomPrice: number;
    capacity: number;
    roomPicture: string;
    bedType: string;
    bedCount: number;
    hasTV: boolean;
    hasWifi: boolean;
    hasWindow: boolean;
    hasBathtub: boolean
}
export interface CreateReasonParams {
    hotelId: string;
    reason: string;
}

