import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import styles from '../../styles/AdminLayout.module.css';

const AdminLayout = () => {
  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <div className={styles.adminContent}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;