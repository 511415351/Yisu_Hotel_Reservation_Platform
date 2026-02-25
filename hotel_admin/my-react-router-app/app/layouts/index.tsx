import React, { useState } from 'react';
import { Flex, Layout } from 'antd';
import { Outlet } from 'react-router';
import style from './index.module.less';
import HeaderCon from './header';
import FooterCon from './footer';
import {useStore} from '../store'
import SiberMenu from './menu';

const { Header, Footer, Sider, Content } = Layout;

export default function LayoutCon(){
    const { collapsed } = useStore();
    return (
        <Layout className={style.layout}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
            <   SiberMenu />
        </Sider>
        <Layout>
            <HeaderCon />
            <div className={style.content}>
                <div className="wrapper">
                    <Outlet />
                </div>
                
            </div>
            <FooterCon />
        </Layout>
    </Layout>
    );
}