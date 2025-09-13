import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import styles from '../../styles/Admin.module.css';
import { getReports } from '../../services/adminApi';

// Register Chart.js components
Chart.register(...registerables);

const ReportsView = () => {
  const [reportData, setReportData] = useState({
    searchStats: [],
    userStats: [],
    wordStats: [],
    categoryDistribution: {},
    userGrowth: [],
    searchTerms: []
  });
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getReports(timeRange);
      setReportData(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Line chart for search trends
  const searchTrendsChart = {
    labels: reportData.searchStats.map(item => item.date),
    datasets: [
      {
        label: 'Lượt tìm kiếm',
        data: reportData.searchStats.map(item => item.count),
        fill: false,
        backgroundColor: '#4a6fa5',
        borderColor: '#4a6fa5',
        tension: 0.1
      }
    ]
  };

  // Bar chart for user growth
  const userGrowthChart = {
    labels: reportData.userGrowth.map(item => item.date),
    datasets: [
      {
        label: 'Người dùng mới',
        data: reportData.userGrowth.map(item => item.count),
        backgroundColor: '#6ca378',
      }
    ]
  };

  // Pie chart for category distribution
  const categoryChart = {
    labels: Object.keys(reportData.categoryDistribution),
    datasets: [
      {
        label: 'Từ vựng theo danh mục',
        data: Object.values(reportData.categoryDistribution),
        backgroundColor: [
          '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff',
          '#ff9f40', '#c9cbcf', '#7b8894', '#6ca378', '#c45850'
        ],
      }
    ]
  };

  // Common options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    }
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.adminTitle}>Báo cáo &amp; Thống kê</h1>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.adminActions}>
        <div className={styles.filterTabs}>
          <button 
            className={`${styles.filterTab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Tổng quan
          </button>
          <button 
            className={`${styles.filterTab} ${activeTab === 'users' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Người dùng
          </button>
          <button 
            className={`${styles.filterTab} ${activeTab === 'dictionary' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('dictionary')}
          >
            Từ điển
          </button>
          <button 
            className={`${styles.filterTab} ${activeTab === 'search' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Tìm kiếm
          </button>
        </div>

        <div className={styles.timeRangeSelector}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={styles.selectFilter}
          >
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="quarter">3 tháng qua</option>
            <option value="year">1 năm qua</option>
          </select>

            <button 
                onClick={fetchReportData}
                className={styles.refreshBtn}
                title="Refresh data"
            >
                🔄 Refresh
            </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className={styles.reportsGrid}>
              <div className={styles.reportCard}>
                <h3 className={styles.reportCardTitle}>Lượt tìm kiếm</h3>
                <div className={styles.chartContainer}>
                  <Line data={searchTrendsChart} options={chartOptions} />
                </div>
              </div>

              <div className={styles.reportCard}>
                <h3 className={styles.reportCardTitle}>Phân bổ từ vựng theo danh mục</h3>
                <div className={styles.chartContainer}>
                  <Pie data={categoryChart} options={chartOptions} />
                </div>
              </div>

              <div className={styles.reportCard}>
                <h3 className={styles.reportCardTitle}>Người dùng mới</h3>
                <div className={styles.chartContainer}>
                  <Bar data={userGrowthChart} options={chartOptions} />
                </div>
              </div>

              <div className={styles.reportCard}>
                <h3 className={styles.reportCardTitle}>
                    Top từ tìm kiếm nhiều nhất
                    <span className={styles.infoNote}>(Dữ liệu tích lũy toàn thời gian)</span>    
                </h3>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Từ</th>
                        <th>Lượt tìm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.searchTerms.slice(0, 10).map((term, index) => (
                        <tr key={index}>
                          <td className={styles.thaiWord}>{term.word}</td>
                          <td>{term.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className={styles.detailedReportSection}>
              <div className={styles.reportCard} style={{width: '100%'}}>
                <h3 className={styles.reportCardTitle}>Tăng trưởng người dùng</h3>
                <div className={styles.chartContainer}>
                  <Bar data={userGrowthChart} options={chartOptions} />
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>👤</div>
                  <div className={styles.statNumber}>{reportData.userStats.totalUsers || 0}</div>
                  <div className={styles.statLabel}>Tổng người dùng</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>✓</div>
                  <div className={styles.statNumber}>{reportData.userStats.activeUsers || 0}</div>
                  <div className={styles.statLabel}>Người dùng hoạt động</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🆕</div>
                  <div className={styles.statNumber}>{reportData.userStats.newUsers || 0}</div>
                  <div className={styles.statLabel}>Người dùng mới</div>
                </div>
              </div>

              <div className={styles.reportCard}>
                <h3 className={styles.reportCardTitle}>Phân bổ vai trò người dùng</h3>
                <div className={styles.chartContainer} style={{height: '300px'}}>
                  <Pie 
                    data={{
                      labels: ['Người dùng', 'Biên tập viên', 'Quản trị viên'],
                      datasets: [{
                        data: [
                          reportData.userStats.roleDistribution?.user || 0,
                          reportData.userStats.roleDistribution?.editor || 0,
                          reportData.userStats.roleDistribution?.admin || 0
                        ],
                        backgroundColor: ['#36a2eb', '#ffce56', '#ff6384']
                      }]
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dictionary Tab */}
          {activeTab === 'dictionary' && (
            <div className={styles.detailedReportSection}>
              <div className={styles.reportCard} style={{width: '100%'}}>
                <h3 className={styles.reportCardTitle}>Từ mới thêm vào từ điển</h3>
                <div className={styles.chartContainer}>
                  <Line 
                    data={{
                      labels: reportData.wordStats.map(item => item.date),
                      datasets: [{
                        label: 'Từ mới',
                        data: reportData.wordStats.map(item => item.count),
                        backgroundColor: '#ff9f40',
                        borderColor: '#ff9f40'
                      }]
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>

              <div className={styles.reportCard}>
                <h3 className={styles.reportCardTitle}>Phân bổ từ vựng theo danh mục</h3>
                <div className={styles.chartContainer}>
                  <Pie data={categoryChart} options={chartOptions} />
                </div>
              </div>

              <div className={styles.reportCard}>
                <h3 className={styles.reportCardTitle}>Góp ý từ người dùng</h3>
                <div className={styles.chartContainer}>
                  <Bar 
                    data={{
                      labels: ['Đang chờ', 'Đã duyệt', 'Đã từ chối'],
                      datasets: [{
                        label: 'Số lượng góp ý',
                        data: [
                          reportData.suggestionStats?.pending || 0,
                          reportData.suggestionStats?.approved || 0,
                          reportData.suggestionStats?.rejected || 0
                        ],
                        backgroundColor: ['#ffce56', '#4bc0c0', '#ff6384']
                      }]
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className={styles.detailedReportSection}>
              <div className={styles.reportCard} style={{width: '100%'}}>
                <h3 className={styles.reportCardTitle}>Xu hướng tìm kiếm</h3>
                <div className={styles.chartContainer}>
                  <Line data={searchTrendsChart} options={chartOptions} />
                </div>
              </div>

              <div className={styles.reportCard}>
                <h3 className={styles.reportCardTitle}>
                    Top 20 từ tìm kiếm nhiều nhất
                    <span className={styles.infoNote}>(Dữ liệu tích lũy toàn thời gian)</span>
                </h3>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Từ</th>
                        <th>Lượt tìm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.searchTerms.slice(0, 20).map((term, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={styles.thaiWord}>{term.word}</td>
                          <td>{term.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsView;