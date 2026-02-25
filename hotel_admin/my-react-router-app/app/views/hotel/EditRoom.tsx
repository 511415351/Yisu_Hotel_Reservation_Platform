import React, { useState, useImperativeHandle, RefObject } from 'react';
import { Button, Form, Input, Select, Modal, InputNumber, Switch, Space, message, Upload } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../../api';

interface IProps {
    // 这里的 Ref 类型要和父组件匹配
    mref: RefObject<{ openModal: (type: string, data: { hotelId: string, roomId: string }) => void }>;
    updateSuccess: () => void; // 成功后的回调，让父组件刷新列表
}

export default function EditRoom(props: IProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);
    const [currentHotelId, setCurrentHotelId] = useState<string>('');
    // 根据酒店ID和房间ID获取数据
    const getRoomDetail = async (hotelId: string, roomId: string) => {
        setLoading(true);
        try {
            // 调用 getHotel 接口
            console.log('Fetching hotel details for ID:', hotelId);
            const response = await api.getHotel({ hotelId });
            
            // 从酒店详情的 hotelRoom 数组中找到那个特定的房间
            const roomList = response.hotelRoom || [];
            const targetRoom = roomList.find((item: any) => String(item.id) === String(roomId));

            if (targetRoom) {
                // 将房间数据和 hotelId 一起填入表单 (hotelId 隐藏)
                form.setFieldsValue({
                    ...targetRoom,
                    hotelId: hotelId,
                    bedType: targetRoom.bedType,
                    bedCount: targetRoom.bedCount,
                });
                // 如果后端返回了图片地址，更新预览列表
                if (targetRoom.roomPicture) {
                    setFileList([{
                        uid: '-1',
                        name: 'cover.png',
                        status: 'done',
                        url: targetRoom.roomPicture,
                    }]);
                };
            } else {
                message.error('未找到房间详情');
            }
        } catch (error) {
            console.error('获取详情失败', error);
        } finally {
            setLoading(false);
        }
    }
    const handleUpload = async (options: any) => {
            const { file, onSuccess, onError } = options;
            try {
                console.log('Uploading file:', file);
                const res: any = await api.uploadImage(file as File);
                const url = res.url; // 这里的 res.data.url 对应后端返回的阿里云地址
                console.log('取得的地址:', url);
                // 上传成功后手动更新表单里的 imageUrl 字段
                form.setFieldsValue({ imageUrl: url });
                
                setFileList([{
                    uid: '-1',
                    name: 'image.png',
                    status: 'done',
                    url: url,
                }]);
                
                onSuccess(url);
                message.success('图片上传成功');
            } catch (error) {
                console.error(error);
                message.error('图片上传失败');
                onError(error);
            }
        };
    const onRemove = () => {
        setFileList([]);
        form.setFieldsValue({ imageUrl: '' });
    };
    const openModal = (type: string, data: { hotelId: string, roomId: string }) => {
        setIsModalOpen(true);
        form.resetFields();
        
        if (type === 'edit') {
            // 编辑模式：去后端查详情并回显
            if (data.hotelId && data.roomId) {
                getRoomDetail(data.hotelId, data.roomId);
            }
        } else {
            console.log('正在设置新增房间的 hotelId:', data.hotelId);
                form.setFieldsValue({ 
                    hotelId: data.hotelId,
                    // 给开关设置默认值，防止提交时为 undefined
                    hasWifi: true,
                    hasTV: true,
                    hasWindow: true,
                    hasBathtub: false
                });
        }
    }

    // 暴露给父组件执行
    useImperativeHandle(props.mref, () => ({ openModal }));

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            console.log('表单验证通过，准备提交:', values);
            const finalHotelId = values.hotelId || currentHotelId;
            const submitData = {
                id: values.id,             // 房间ID 
                hotelId: finalHotelId,   // 酒店ID
                roomName: values.roomName,
                roomPrice: values.roomPrice,
                capacity: values.number,    // 前端 number -> 后端 capacity
                roomPicture: values.imageUrl, // 前端 imageUrl -> 后端 roomPicture
                bedType: values.bedType,
                bedCount: values.bedCount,
                hasTV: values.hasTV,
                hasWifi: values.hasWifi,
                hasWindow: values.hasWindow,
                hasBathtub: values.hasBathtub,
            };
            console.log('提交的房间数据:', submitData);
            const res = await api.createHotelRoom(submitData); 
            console.log('提交的房间数据:', submitData);
            message.success('更新成功');
            setIsModalOpen(false);
            props.updateSuccess(); // 通知父组件刷新
        } 
        // catch (error) {
        //     // 验证失败
        //     console.error('验证失败:', error);
        //     message.error('请检查输入项');
        // } 
        finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="编辑房间信息"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={() => setIsModalOpen(false)}
            confirmLoading={loading}
            destroyOnClose
            width={600}
        >
            <Form form={form} layout="vertical">
                {/* 隐藏域：保存酒店ID和房间ID */}
                <Form.Item name="hotelId" hidden><Input /></Form.Item>
                <Form.Item name="id" hidden><Input /></Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item name="roomName" label="房间名称" rules={[{ required: true }]}>
                        <Input placeholder="如：豪华大床房" />
                    </Form.Item>
                    
                    <Form.Item name="roomPrice" label="价格(元)" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item name="number" label="容纳人数" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>
                    <Form.Item name="bedType" label="床型" rules={[{ required: true }]}>
                        <Select placeholder="请选择床型">
                            <Select.Option value="单人床">单人床</Select.Option>
                            <Select.Option value="双人床">双人床</Select.Option>
                            <Select.Option value="大床">大床</Select.Option>
                            <Select.Option value="沙发床">沙发床</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="bedCount" label="床数量" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>
                    <Form.Item 
                            name="imageUrl" 
                            label="房间封面图" 
                            extra="建议尺寸: 750x450"
                        >
                            <Upload
                                listType="picture-card"
                                fileList={fileList}
                                customRequest={handleUpload}
                                onRemove={onRemove}
                                maxCount={1} // 只允许一张
                            >
                                {fileList.length < 1 && (
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>上传</div>
                                    </div>
                                )}
                            </Upload>
                        </Form.Item>
                        <Form.Item name="imageUrl" hidden><Input /></Form.Item>
                    {/* 设施开关 */}
                    <Form.Item label="设施配置" style={{ gridColumn: 'span 2' }}>
                        <Space size="large">
                            <Form.Item name="hasWifi" label="WiFi" valuePropName="checked" noStyle>
                                <Switch checkedChildren="有" unCheckedChildren="无" />
                            </Form.Item>
                            <span style={{ marginRight: 20 }}>WiFi</span>

                            <Form.Item name="hasTV" label="电视" valuePropName="checked" noStyle>
                                <Switch checkedChildren="有" unCheckedChildren="无" />
                            </Form.Item>
                            <span style={{ marginRight: 20 }}>电视</span>

                            <Form.Item name="hasWindow" label="窗户" valuePropName="checked" noStyle>
                                <Switch checkedChildren="有" unCheckedChildren="无" />
                            </Form.Item>
                            <span style={{ marginRight: 20 }}>窗户</span>

                            <Form.Item name="hasBathtub" label="浴缸" valuePropName="checked" noStyle>
                                <Switch checkedChildren="有" unCheckedChildren="无" />
                            </Form.Item>
                            <span>浴缸</span>
                        </Space>
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
}
