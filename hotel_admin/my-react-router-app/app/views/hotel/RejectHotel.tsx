import React, { useState, useImperativeHandle, RefObject } from 'react';
import { Button, Form, Input, Modal, message } from 'antd';
import api from '../../api';
import storage from '../../utils/storage';

interface IProps {
    // 这里的 Ref 类型定义
    mref: RefObject<{ openModal: (hotelId: string) => void }>;
    updateSuccess: () => void; // 操作成功后的回调
}

export default function RejectHotel(props: IProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const userId = storage.get('userId') as any;
    const username = storage.get('username') as any;
    // 暴露给父组件执行
    useImperativeHandle(props.mref, () => ({openModal}));
    const handleOk = async () => {     
        try {
            // 1. 表单验证
            const values = await form.validateFields();
            setLoading(true);
            if (!values.hotelId) {
                return message.error("缺少酒店ID，无法提交");
            }
            // 2. 并行或串行调用接口
            // 修改酒店状态为 2 (已拒绝)
            await api.createHotelBa({ 
                userId: userId,
                hotelId: values.hotelId.parentId, 
                status: 2 
            });

            // 保存拒绝原因
            await api.createReason({
                hotelId: values.hotelId.parentId,
                reason: values.reason
            });

            message.success('操作成功，酒店已被拒绝');
            setIsModalOpen(false);
            props.updateSuccess(); // 刷新父组件列表
        } catch (error) {
            console.error('提交失败:', error);
            // 这里 antd 会自动处理输入框的校验提示，如果是接口报错则抛出提示
            if (error instanceof Error) {
                message.error('提交失败，请重试');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (!loading) { // 正在提交时禁止关闭
            setIsModalOpen(false);
        }
    };
    const openModal = (record: any) => {
        setIsModalOpen(true);
        form.resetFields();

        // 打印一下传进来的到底是什么，看看里面到底哪个字段是 ID
        console.log("收到的原始数据:", record);

        // 兼容多种可能的 ID 字段名 (根据你后端返回的字段改，通常是 _id 或 id)
        const actualId = record?._id || record?.id || record?.hotelId || record;
        
        console.log("解析出的 ID:", actualId);

        form.setFieldsValue({ 
            hotelId: actualId 
        });
    };
    return (
        <Modal
            title="拒绝酒店审核"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
            okText="确 认"
            cancelText="取 消"
            footer={[
                <Button key="back" onClick={handleCancel}>
                    取消
                </Button>,
                <Button 
                    key="submit" 
                    type="primary" 
                    danger // 拒绝操作建议使用红色
                    loading={loading} 
                    onClick={handleOk}
                >
                    确认拒绝
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
            >
                {/* 隐藏域 */}
                <Form.Item name="hotelId" hidden>
                    <Input />
                </Form.Item>

                <Form.Item 
                    name="reason" 
                    label="拒绝理由" 
                    rules={[{ required: true, message: '请输入拒绝理由' }]}
                >
                    <Input.TextArea 
                        rows={4} 
                        placeholder="请详细描述拒绝该酒店审核的原因..." 
                        maxLength={200}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
