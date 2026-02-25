import { Breadcrumb, Button, Layout, Menu, theme } from 'antd';
import { GithubOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useStore } from '../../store';
import LoginCon from '../login/index';
import styles from './index.module.less'

const { Header, Content, Footer } = Layout;



export function Welcome() {
    const navigate = useNavigate();
    const { setCurrentMenu } = useStore();
    const handleGoTo = (path: string) => {
        setCurrentMenu(path); // 更新你的 store 状态
        navigate(path);       // 执行跳转
    };
  return (
    <div>
        <Layout className={styles.layout}>
            <Layout>
                <Header style={{ display: 'flex'}}>
                    <div className="demo-logo" />
                </Header>
                    <div className={styles.content}>
                        <div className={styles.welcome}>
                            <h1 className={styles.title}>Welcome to the Application!</h1>                
                        </div>
                        <div className={styles.choose}>
                                <Button type="primary" className={styles.button} onClick={() => handleGoTo('/login')} icon={<LoginOutlined />}>
                                    Login
                                </Button>
                                <Button type="primary" className={styles.button} onClick={() => handleGoTo('/register')}icon={<UserAddOutlined />}>
                                    Register
                                </Button>           
                        </div>
                    </div>
                <Footer className={styles.footer} style={{ textAlign: 'center' }}>
                    <GithubOutlined />
                </Footer>
            </Layout>
            
        </Layout>
    </div>
  );
}