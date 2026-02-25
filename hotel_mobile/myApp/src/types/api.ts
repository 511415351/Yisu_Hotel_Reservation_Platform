//酒店模块
export interface HotelListParams {
    _id: string;
    hotelName: string;
    status: number;
    score: number;
    lowestPrice: string;
    address: string;
    imageUrl: string;
}

export interface HotelParams {
    hotelId: string;
    hotelName: string;
    openingTime: string;
    hotelierEmail: string;
    hotelierName: string;
    hotelierPhone: string;
    imageUrl: string[];
    hotelRooms: RoomParams[];
    address: string;
    star: number;
    score: number;
    hasBreakfast: boolean;
    hasParking: boolean;

}
export interface RoomParams {
    id: string
    roomName: string
    roomPicture?: string
    roomPrice: string
    number:string
    hasTV: boolean,
    hasWifi: boolean,
    hasWindow: boolean,
    hasBathtub: boolean
  }
