import React from 'react';
import type { FormProps } from 'antd';
import { useNavigate } from 'react-router';
import { Button, Checkbox, Form, Input } from 'antd';
import styles from './index.module.less'
import api from '../../api';
import { message } from 'antd';
import storage from '../../utils/storage';

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

export default function LoginCon(){
    const navigate = useNavigate();
    const onFinish = async (values: any) => {
        try {
        // 2. 调用登录接口
        const res = await api.login(values);
        
            message.success('登录成功！');
            // 使用 storage 存储用户信息
            // 假设后端返回的数据结构是：{ token: 'xxx', userInfo: { role: 'admin', userId: '1' } }
            console.log('登录接口返回:', res);
            storage.set('token', res.token);
            storage.set('username', res.username);
            storage.set('role', res.role);
            storage.set('userId', res.userId);
            console.log("存储后的值：", localStorage.getItem('role'));
            navigate('/hotel');
        } catch (error) {
        console.error('登录失败', error);
        }
    };
    const goRegister = () => {
        navigate('/register');
    }
    return(
        <div className={styles.login}>
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
                <Form.Item<FieldType>
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
                >
                <Input />
                </Form.Item>

                <Form.Item<FieldType>
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
                >
                <Input.Password />
                </Form.Item>

                <Form.Item<FieldType> name="remember" valuePropName="checked" label={null}>
                <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Form.Item label={null}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
                </Form.Item>
                <Button type="link" onClick={goRegister}>
                    没有账号？去注册
                </Button>
            </Form>
        </div>
    )
}