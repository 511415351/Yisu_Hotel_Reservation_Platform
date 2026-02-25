import { Breadcrumb, Button, Layout, Menu, theme } from 'antd';
import { GithubOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router';
import styles from './index.module.less'

const { Header, Content, Footer } = Layout;

export default function LayoutCon2() {
  return (
    <div>
        <Layout className={styles.layout}>
                <Header style={{ display: 'flex'}}className={styles.header}>
                    <div className="demo-logo" />
                    <h1>易宿</h1>
                </Header>
                    <div className={styles.content}>
                        <Outlet />
                    </div>
                <Footer className={styles.footer} style={{position: 'fixed', bottom: 0, width: '100%', textAlign: 'center' }}>
                    <GithubOutlined />
                </Footer>       
        </Layout>
    </div>
  );
}