import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../../styles/AdminSidebar.module.css';
import { useUser } from '../../context/UserContext';

const AdminSidebar = () => {
  const { userDetails } = useUser();

  return (
    <div className={styles.adminSidebar}>
      <div className={styles.adminInfo}>
        <div className={styles.adminAvatar}>👨‍💼</div>
        <div className={styles.adminName}>{userDetails?.displayName || 'Admin'}</div>
        <div className={styles.adminEmail}>{userDetails?.email}</div>
      </div>
      
      <nav className={styles.adminNav}>
        <NavLink to="/admin" end className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/users" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>
          Quản lý người dùng
        </NavLink>
        <NavLink to="/admin/dictionary" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>
          Quản lý từ điển
        </NavLink>
        <NavLink to="/admin/suggestions" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>
          Góp ý từ người dùng
        </NavLink>
        <NavLink to="/admin/reports" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>
          Báo cáo & Thống kê
        </NavLink>
      </nav>
      
      <div className={styles.adminFooter}>
        <NavLink to="/" className={styles.backToSite}>
          ← Về trang chính
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;