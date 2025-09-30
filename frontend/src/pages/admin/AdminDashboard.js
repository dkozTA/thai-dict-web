import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/Admin.module.css';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  useUserStats, 
  useDictionaryStats, 
  useSuggestionStats, 
  useRecentWords, 
  useRecentUsers,
  useReports 
} from '../../hooks/useAdminQueries';

// Register Chart.js components
Chart.register(...registerables);

const AdminDashboard = () => {
  const { data: userStats, isLoading: loadingUsers } = useUserStats();
  const { data: dictionaryStats, isLoading: loadingDictionary } = useDictionaryStats();
  const { data: suggestionStats, isLoading: loadingSuggestions } = useSuggestionStats();
  const { data: recentWords, isLoading: loadingRecentWords } = useRecentWords();
  const { data: recentUsers, isLoading: loadingRecentUsers } = useRecentUsers();
  const { data: reportData, isLoading: loadingReports } = useReports('week');

  // Calculate combined loading state
  const isLoading = loadingUsers || loadingDictionary || loadingSuggestions || 
                   loadingRecentWords || loadingRecentUsers || loadingReports;

  // Prepare chart data
  const searchTrends = {
    labels: reportData?.searchStats?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Lượt tìm kiếm',
        data: reportData?.searchStats?.map(item => item.count) || [],
        fill: false,
        backgroundColor: '#4a6fa5',
        borderColor: '#4a6fa5',
      }
    ]
  };

    const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    if (timestamp.toDate) {
      // Handle Firebase Timestamp
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      // Handle Firebase Timestamp in a different format
      date = new Date(timestamp.seconds * 1000);
    } else {
      // Handle regular Date object or timestamp number
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Combine stats into one object for easier use in the template
  const stats = {
    totalUsers: userStats?.totalUsers || 0,
    activeUsers: userStats?.activeUsers || 0,
    newUsersThisMonth: userStats?.newUsers || 0,
    totalWords: dictionaryStats?.totalWords || 0,
    totalCategories: dictionaryStats?.totalCategories || 0,
    pendingSuggestions: suggestionStats?.pending || 0,
    totalSearches: dictionaryStats?.totalSearches || 0
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.adminTitle}>Bảng điều khiển</h1>
      
      {isLoading ? (
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

          {/* Chart Section */}
          <div className={styles.recentSection}>
            <h2 className={styles.sectionTitle}>Xu hướng tìm kiếm (7 ngày qua)</h2>
            <div className={styles.chartContainer} style={{ height: '300px' }}>
              <Line data={searchTrends} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } }
              }} />
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

            <div className={styles.recentSection}>
              <h2 className={styles.sectionTitle}>Xu hướng tìm kiếm (7 ngày qua)</h2>
              <div className={styles.chartContainer} style={{ height: '300px' }}>
                <Line data={searchTrends} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' } }
                }} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;