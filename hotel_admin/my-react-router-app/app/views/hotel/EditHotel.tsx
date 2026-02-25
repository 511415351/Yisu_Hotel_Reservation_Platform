import React, { useState, useImperativeHandle } from 'react';
import { Button, Form, Input, Table, Tag, Space, Card, Select , Upload} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import dayjs from 'dayjs';
import api from '../../api';
import type { HotelParams } from '~/types/api';
import storage from '../../utils/storage';
import { message } from 'antd';

interface IProps {
    mref: RefObject<{ openModal: (type: string,data?:any,parentId?: string) => void }>;
}

export default function EditHotel(props: IProps){
    const userInfo = storage.get('role') as any;
    const isAdmin = userInfo === 'admin';
    const userId = storage.get('userId') as any;
    const username = storage.get('username') as any;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);
    const [form] = Form.useForm();
    let modelTitle = '编辑酒店';
    const getHotelDetail = async (hotelId: string) => {
        console.log('Fetching hotel details for ID:', hotelId);
        try {
            const response = await api.getHotel({hotelId: hotelId});
            console.log('API response for hotel details:', response);
            console.log('Formatted hotel details:', response);
            form.setFieldsValue(response);
            // 如果后端返回了图片地址，更新预览列表
            if (response.imageUrl) {
                setFileList([{
                    uid: '-1',
                    name: 'cover.png',
                    status: 'done',
                    url: response.imageUrl,
                }]);
            } else {
                setFileList([]);
            }
        } catch (error) {
            console.error('Failed to fetch hotel details:', error);
                message.error('Failed to fetch hotel details');
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
    const showModal = () => {
        setOpen(true);
    };

    const handleOk = async () => {
        setLoading(true);
        setTimeout(() => {
        setLoading(false);
        setIsModalOpen(false); 
        }, 1000);
        const res=await api.createHotelBa({...form.getFieldsValue(),userId:userId,username:username});
        const hotelId = res.hotelId;
        console.log('提交酒店基本信息成功，返回的 hotelId:', hotelId);
        if (modelTitle == '编辑酒店') {
            message.success('酒店信息更新成功');
            // await api.createHotelDetail({...form.getFieldsValue(),hotelId:form.getFieldValue('hotelId')});
        }
        else{
            //await api.createHotelDetail({...form.getFieldsValue(),hotelId:hotelId});
        }
        
    };

    const handleCancel = () => {
        setIsModalOpen(false); 
    };

    const openModal = (type: string, data?: any, parentId?: string) => {
        setIsModalOpen(true);
        form.resetFields();
        setFileList([]);
        if (type === 'edit' && data && data.parentId) {
            modelTitle = '编辑酒店';
            getHotelDetail(data.parentId);
        } else if (type === 'create' && parentId) {
            getHotelDetail(parentId);
            modelTitle = '新增房间';
        } else {
            form.resetFields();
        }
        if (data.parentId!== undefined) {
            getHotelDetail(data.parentId);
        } else {
            form.resetFields();
        }
    }
    useImperativeHandle(props.mref, () => ({openModal}));
    return (
        <div>
            <Modal
                title="Title"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                <Button key="back" onClick={handleCancel}>
                    Return
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                    Submit
                </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ status: 0 }} // 默认值
                >
                <Form.Item name="hotelId" hidden><Input /></Form.Item>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item name="hotelName" label="酒店名称" rules={[{ required: true }]}>
                            <Input placeholder="请输入酒店名" />
                        </Form.Item>
                        {isAdmin && (
                            <Form.Item name="status" label="审核状态">
                                <Select options={[
                                    { value: 0, label: '待审核' },
                                    { value: 1, label: '已发布' },
                                    { value: 2, label: '未通过' },
                                    { value: 3, label: '已下线' },
                                ]} />
                            </Form.Item>)
                        }
                        <Form.Item name="hotelierName" label="负责人姓名">
                            <Input placeholder="输入负责人姓名" />
                        </Form.Item>
                        <Form.Item name="hotelierEmail" label="负责人邮箱">
                            <Input placeholder="example@mail.com" />
                        </Form.Item>
                        <Form.Item name="hotelierPhone" label="联系电话">
                            <Input placeholder="输入电话号码" />
                        </Form.Item>
                        <Form.Item name="address" label="酒店地址" style={{ gridColumn: 'span 2' }}>
                            <Input.TextArea rows={2} placeholder="详细地址" />
                        </Form.Item>
                        <Form.Item name="nearby" label="周边环境" style={{ gridColumn: 'span 2' }}>
                            <Input.TextArea rows={2} placeholder="如：靠近地铁站、商场等" />
                        </Form.Item>
                        <Form.Item name="openingTime" label="开业时间">
                            <Input placeholder="例如：2023-01-01" />
                            {/* 如果用真正的日期控件: <DatePicker style={{ width: '100%' }} /> */}
                        </Form.Item>
                        <Form.Item 
                            name="imageUrl" 
                            label="酒店封面图" 
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
                        <Form.Item name="stars" label="星级">
                            <Input placeholder="请输入1-5之间的数字" />
                        </Form.Item>
                        <Form.Item name="hasBreakfast" label="是否含早餐" valuePropName="checked">
                            <Select options={[
                                { value: true, label: '是' },
                                { value: false, label: '否' },
                            ]} />
                        </Form.Item>
                        <Form.Item name="hasParking" label="是否有停车位" valuePropName="checked">
                            <Select options={[
                                { value: true, label: '是' },
                                { value: false, label: '否' },
                            ]} />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};