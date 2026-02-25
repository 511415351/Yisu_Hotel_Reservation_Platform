import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button,message,  Cascader,  Checkbox,  ColorPicker,  DatePicker,  Form,  Input,  InputNumber,  Mentions,  Radio,  Rate,  Select,  Slider,  Switch,  Transfer,  Tree,  TreeSelect, Upload,} from 'antd';
import stylse from './index.module.less';
import storage from '../../utils/storage';
import { useNavigate } from 'react-router';
import api from '../../api';
import type { FormProps } from 'antd';
import type { IRegisterParams } from '~/types/api';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};
export default function RegisterCon(){
    const [componentDisabled, setComponentDisabled] = useState<boolean>(true);
    const navigate = useNavigate();
    const onFinish = async (values: any) => {
        try {
        // 2. 调用注册接口
        const res = await api.register(values);
        console.log('注册接口返回:', res);
        navigate('/login');

            message.success('注册成功！');
            // 4. 跳转到首页或酒店列表页
            
        } catch (error) {
        console.error('注册失败', error);
        }
    };
    const onFinishFailed: FormProps<IRegisterParams>['onFinishFailed'] = (errorInfo) => {
      console.log('Failed:', errorInfo);
    };
    return(
        <div className={stylse.register}>
            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item label="email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item<IRegisterParams>
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input />
                </Form.Item>
            
                <Form.Item<IRegisterParams>
                        label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password />
                </Form.Item>                   
                <Form.Item<IRegisterParams>
                    label="Confirm Password"
                    name="confirmPassword"
                    rules={[{ required: true, message: 'Please confirm your password!' }]}
                >
                    <Input.Password />
                </Form.Item>
                    <Form.Item<IRegisterParams>
                    name="role"
                    label="Role"
                    rules={[{ required: true, message: 'Please select a role!' }]}
                >
                    <Select placeholder="Select a role">
                        <Select.Option value="admin">Admin</Select.Option>
                        <Select.Option value="merchant">Merchant</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}