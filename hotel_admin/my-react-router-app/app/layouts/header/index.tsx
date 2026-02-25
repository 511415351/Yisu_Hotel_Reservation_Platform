import React, { useState } from 'react';
import styles from './index.module.less';
import { AntDesignOutlined, PlayCircleOutlined, DownOutlined,MenuFoldOutlined, MenuUnfoldOutlined,} from '@ant-design/icons';
import type { MenuProps} from 'antd';
import { Dropdown, Space, Button  } from 'antd';
import { useStore} from '../../store'
import storage from '~/utils/storage';
import { useNavigate } from 'react-router';


export default function HeaderCon() {
    const {collapsed, updateCollapsed} = useStore();
    const userName = storage.get('username') as any;
    const navigate = useNavigate();
    const Logout = () => {
        storage.clear();
        navigate('/login');
    }
    const items: MenuProps['items'] = [
        {
            label: userName,
            key: 'user',
        },
        {
            label: 'Logout',
            key: 'logout',
            onClick: () => {    Logout();
            }
        },
    ];
    const onClick: MenuProps['onClick'] = ({ key }) => {
        console.log(key);
    }
    const toggleCollapsed = () => {
        updateCollapsed();
    }
    return (
        <div className={styles.headerCon}>
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={toggleCollapsed}
                style={{
                fontSize: '16px',
                width: 64,
                height: 64,color: '#fff',
                }}
            />
            <div className={styles.left}>
                <div className={styles.nickName}></div>
            </div>
            <div className={styles.right}>
                <Dropdown menu={{ items, onClick }} trigger={['click']}>
                    <span className={styles.nickName}>Admin <DownOutlined /></span>
                </Dropdown>
            </div>
        </div>
    )
}