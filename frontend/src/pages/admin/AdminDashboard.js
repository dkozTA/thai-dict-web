import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/Admin.module.css';
import { getDictionaryStats, getUserStats } from '../../services/adminApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalWords: 0,
    totalCategories: 0,
    pendingSuggestions: 0,
    totalSearches: 0
  });
  
  const [recentWords, setRecentWords] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // For development, we'll use mock data
        // In production, you would fetch this from your API endpoints
        
        // Mock data for statistics
        const mockStats = {
          totalUsers: 120,
          activeUsers: 87,
          newUsersThisMonth: 23,
          totalWords: 4583,
          totalCategories: 15,
          pendingSuggestions: 8,
          totalSearches: 28745
        };
        
        // Mock data for recent words
        const mockRecentWords = Array(5).fill().map((_, index) => ({
          id: `word_${index}`,
          word: `คำศัพท์ ${index + 1}`,
          vietnamese_meaning: `Từ vựng số ${index + 1}`,
          category: index % 2 === 0 ? 'food' : 'general',
          created_at: new Date(Date.now() - index * 86400000).toISOString() // days ago
        }));
        
        // Mock data for recent users
        const mockRecentUsers = Array(5).fill().map((_, index) => ({
          id: `user_${index}`,
          displayName: `User ${index + 1}`,
          email: `user${index + 1}@example.com`,
          role: index === 0 ? 'admin' : 'user',
          created_at: new Date(Date.now() - index * 86400000).toISOString()
        }));
        
        setStats(mockStats);
        setRecentWords(mockRecentWords);
        setRecentUsers(mockRecentUsers);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.adminTitle}>Bảng điều khiển</h1>
      
      {loading ? (
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👤</div>
              <div className={styles.statNumber}>{stats.totalUsers}</div>
              <div className={styles.statLabel}>Người dùng</div>
              <div className={styles.statDetail}>
                <span>{stats.activeUsers} đang hoạt động</span>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📚</div>
              <div className={styles.statNumber}>{stats.totalWords}</div>
              <div className={styles.statLabel}>Từ vựng</div>
              <div className={styles.statDetail}>
                <span>{stats.totalCategories} danh mục</span>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔍</div>
              <div className={styles.statNumber}>{stats.totalSearches}</div>
              <div className={styles.statLabel}>Lượt tìm kiếm</div>
              <div className={styles.statDetail}>
                <span>Tháng này</span>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📝</div>
              <div className={styles.statNumber}>{stats.pendingSuggestions}</div>
              <div className={styles.statLabel}>Góp ý chờ duyệt</div>
              <div className={styles.statDetail}>
                <Link to="/admin/suggestions" className={styles.viewAllLink}>Xem tất cả</Link>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <h2 className={styles.sectionTitle}>Thao tác nhanh</h2>
            <div className={styles.actionButtonsGrid}>
              <Link to="/admin/dictionary" className={styles.actionButton}>
                <span className={styles.actionIcon}>➕</span>
                <span>Thêm từ mới</span>
              </Link>
              <Link to="/admin/users" className={styles.actionButton}>
                <span className={styles.actionIcon}>👥</span>
                <span>Quản lý người dùng</span>
              </Link>
              <Link to="/admin/suggestions" className={styles.actionButton}>
                <span className={styles.actionIcon}>✅</span>
                <span>Duyệt góp ý</span>
              </Link>
              <Link to="/admin/reports" className={styles.actionButton}>
                <span className={styles.actionIcon}>📊</span>
                <span>Xem báo cáo</span>
              </Link>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className={styles.recentActivity}>
            <div className={styles.recentSection}>
              <h2 className={styles.sectionTitle}>Từ vựng mới thêm</h2>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Từ</th>
                      <th>Nghĩa</th>
                      <th>Danh mục</th>
                      <th>Ngày thêm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentWords.map(word => (
                      <tr key={word.id}>
                        <td className={styles.thaiWord}>{word.word}</td>
                        <td>{word.vietnamese_meaning}</td>
                        <td>{word.category}</td>
                        <td>{formatDate(word.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.viewAllRow}>
                  <Link to="/admin/dictionary" className={styles.viewAllLink}>Xem tất cả từ vựng →</Link>
                </div>
              </div>
            </div>
            
            <div className={styles.recentSection}>
              <h2 className={styles.sectionTitle}>Người dùng mới đăng ký</h2>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Ngày đăng ký</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.displayName}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{formatDate(user.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.viewAllRow}>
                  <Link to="/admin/users" className={styles.viewAllLink}>Xem tất cả người dùng →</Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;