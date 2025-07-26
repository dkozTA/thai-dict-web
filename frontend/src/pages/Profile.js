import React, { useState } from 'react';
import PageLayout from '../components/common/Pagelayout';
import styles from '../styles/Profile.module.css';

const Profile = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement authentication logic with Firebase
    console.log('Form submitted:', formData);
    setIsLoggedIn(true); // For demo purposes
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
  };

  if (isLoggedIn) {
    return (
      <PageLayout title="Tài khoản cá nhân" showUserInfo={false}>
        <div className={styles.profileContent}>
          <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>
                <span>👤</span>
              </div>
              <h2>Chào mừng, Người dùng!</h2>
              <p>user@example.com</p>
            </div>

            <div className={styles.profileStats}>
              <div className={styles.statCard}>
                <h3>📚 Từ đã học</h3>
                <span className={styles.statNumber}>45</span>
              </div>
              <div className={styles.statCard}>
                <h3>🎯 Điểm kiểm tra</h3>
                <span className={styles.statNumber}>87%</span>
              </div>
              <div className={styles.statCard}>
                <h3>📖 Bộ sưu tập</h3>
                <span className={styles.statNumber}>3</span>
              </div>
            </div>

            <div className={styles.profileActions}>
              <button className={styles.editButton}>Chỉnh sửa thông tin</button>
              <button className={styles.logoutButton} onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={isLogin ? 'Đăng nhập' : 'Đăng ký'} showUserInfo={false}>
      <div className={styles.profileContent}>
        <div className={styles.authContainer}>
          <div className={styles.authTabs}>
            <button 
              className={`${styles.authTab} ${isLogin ? styles.activeTab : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Đăng nhập
            </button>
            <button 
              className={`${styles.authTab} ${!isLogin ? styles.activeTab : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {!isLogin && (
              <div className={styles.inputGroup}>
                <label>Tên hiển thị:</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Mật khẩu:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label>Xác nhận mật khẩu:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                />
              </div>
            )}

            <button type="submit" className={styles.submitButton}>
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
              <button 
                type="button"
                className={styles.linkButton}
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Đăng ký' : 'Đăng nhập'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;