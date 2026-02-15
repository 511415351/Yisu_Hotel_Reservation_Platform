# Yisu_Hotel_Reservation_Platform
## hotel_admin文件夹放的web端，用的react
## hotel_mobile放的移动端，是小程序
## hotel_service放的服务端，用的express，数据库是mysql+prisma
## -hotel_admin
需要开发的地方在./app下，界面在view/下
```
├── api/ #调用的api均写在该文件夹下
├── layout/ #布局1
├── layout2/ #布局2
├── routes/ #没啥用
├── store/ #没啥用
├── styles/ #没啥用
├── types/ #里面的api.ts用来写api返回的数据结构
├── utils/ #里面request.tsx用来拦截api请求
├── views/ #写界面的地方
    ├── login/
    └── register/ 
├── app.css 全局样式
├── root.tsx #没啥用
├── routes.ts #写路由的，需要的界面都要写这
```
## -hotel_mobile
开发在./src下，界面在pages下
```
├── api/ #调用的api均写在该文件夹下
├── pages/ #写界面的地方
    ├── list/
    └── detail/ 
├── types/ #里面的api.ts用来写api返回的数据结构
├── utils/ #里面request.tsx用来拦截api请求
├── app.scss 全局样式
├── app.config.ts #写路由的，需要的界面都要写这
├── app.ts #入口，没啥用
```
## hotel_service
开发在./routes和./controllers还有schema.prisma
```
├── config/ #设置
├── controllers/ #写api的一些处理
├── prisma/ 
    └── schema.prisma #写数据库的
├── routes/ #写api的
├── test.http #测试文件
├── app.js #入口
```