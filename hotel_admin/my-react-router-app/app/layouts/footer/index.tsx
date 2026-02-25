import styles from './index.module.less';
import { GithubOutlined } from '@ant-design/icons';

export default function FooterCon() {
    return (
        <div className={styles.footer}>
            <div className={styles.center}>
                <GithubOutlined /><a href="https://github.com/511415351">GitHub</a> |
                <a href="https://yourwebsite.com">Website</a> |
                <a href="https://yourwebsite.com/privacy">Privacy Policy</a>
            </div>
        </div>
    )
}