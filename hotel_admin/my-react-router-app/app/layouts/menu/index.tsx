import styles from './index.module.less';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { MailOutlined, UserOutlined, ProductOutlined, LaptopOutlined, HomeOutlined, UsergroupDeleteOutlined } from '@ant-design/icons';
import { useStore } from '../../store';
import { useNavigate } from 'react-router';

type MenuItem = Required<MenuProps>['items'][number];
const items: MenuItem[] = [
    {key: '/dashboard', label: 'Dashboard', icon: <HomeOutlined />},
    {
        key: '/user',
        label: 'USER',
        icon: <UsergroupDeleteOutlined />,
        children: [
        {
            key: '/userList',
            label: 'User List',
            icon: <UserOutlined />,
        },
        {
            key: '/hotel',
            label: 'Hotel List',
            icon: <ProductOutlined />,
        },
        ],
    },
  
];

const SiberMenu = () => {
    const navgiate = useNavigate();
    const { collapsed, currentMenu, setCurrentMenu } = useStore();
    const menuClick = ({key}: {key: string}) => {
        setCurrentMenu(key);
        navgiate(key);
    }
    return (
        <div className={styles.siberMenu}>
            <div className={styles.logo}>
                <img src="" className={styles.img} alt="https://tse1.mm.bing.net/th/id/OIP.cmJ27uOi3_KBYV3sjOG4sgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" />
                {collapsed ? '': <span >易宿</span>}
            </div>
            <Menu
                defaultSelectedKeys={[currentMenu]}
                defaultOpenKeys={['sub1']}
                onClick={ menuClick}
                mode="inline"
                theme="dark"
                inlineCollapsed={collapsed}
                items={items}
            />
        </div>
    )
}
export default SiberMenu;