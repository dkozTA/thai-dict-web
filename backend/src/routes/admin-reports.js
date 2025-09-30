const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase-admin');
const { verifyAdmin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/admin/reports
 * @desc    Get comprehensive analytics data for admin dashboard
 * @access  Admin
 */
router.get('/reports', async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    
    // Calculate the start date based on timeRange
    const startDate = new Date();
    switch (timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'quarter':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'year':
        startDate.setDate(startDate.getDate() - 365);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30); // Default to month
    }
    
    // Prepare response object
    const reportData = {
      searchStats: [],
      userStats: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        roleDistribution: {
          user: 0,
          editor: 0,
          admin: 0
        }
      },
      wordStats: [],
      categoryDistribution: {},
      userGrowth: [],
      searchTerms: [],
      suggestionStats: {
        pending: 0,
        approved: 0,
        rejected: 0
      }
    };
    
    // Get user statistics
    const usersSnapshot = await db.collection('user').get();
    let totalUsers = 0;
    let activeUsers = 0;
    const roleCount = { user: 0, editor: 0, admin: 0 };
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      totalUsers++;
      
      // Count active users
      if (userData.isActive !== false) {
        activeUsers++;
      }
      
      // Count user roles
      const role = userData.role || 'user';
      roleCount[role] = (roleCount[role] || 0) + 1;
    });
    
    reportData.userStats.totalUsers = totalUsers;
    reportData.userStats.activeUsers = activeUsers;
    reportData.userStats.roleDistribution = roleCount;
    
    // Get new users in the selected time period
    const newUsersSnapshot = await db.collection('user')
      .where('created_at', '>=', startDate)
      .get();
    
    reportData.userStats.newUsers = newUsersSnapshot.size;
    
    // Generate user growth data (grouped by day)
    const userGrowthMap = {};
    const dateFormat = { year: 'numeric', month: 'short', day: 'numeric' };
    
    newUsersSnapshot.forEach(doc => {
      const userData = doc.data();
      const createdAt = userData.created_at?.toDate() || new Date();
      const dateStr = createdAt.toLocaleDateString('vi-VN', dateFormat);
      
      userGrowthMap[dateStr] = (userGrowthMap[dateStr] || 0) + 1;
    });
    
    // Convert user growth map to array and sort by date
    for (const [date, count] of Object.entries(userGrowthMap)) {
      reportData.userGrowth.push({ date, count });
    }
    reportData.userGrowth.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get dictionary statistics
    const wordsSnapshot = await db.collection('dictionary').get();
    const categoryCount = {};
    
    wordsSnapshot.forEach(doc => {
      const wordData = doc.data();
      const category = wordData.category || 'general';
      
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    reportData.categoryDistribution = categoryCount;
    
    // Get new words added in the selected time period
    const newWordsSnapshot = await db.collection('dictionary')
      .where('created_at', '>=', startDate)
      .get();
    
    const wordGrowthMap = {};
    newWordsSnapshot.forEach(doc => {
      const wordData = doc.data();
      const createdAt = wordData.created_at?.toDate() || new Date();
      const dateStr = createdAt.toLocaleDateString('vi-VN', dateFormat);
      
      wordGrowthMap[dateStr] = (wordGrowthMap[dateStr] || 0) + 1;
    });
    
    // Convert word growth map to array and sort by date
    for (const [date, count] of Object.entries(wordGrowthMap)) {
      reportData.wordStats.push({ date, count });
    }
    reportData.wordStats.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get top search terms
    const topWordsSnapshot = await db.collection('dictionary')
      .orderBy('search_count', 'desc')
      .limit(50)
      .get();
    
    reportData.searchTerms = [];
    topWordsSnapshot.forEach(doc => {
      const wordData = doc.data();
      if (wordData.search_count > 0) {
        reportData.searchTerms.push({
          word: wordData.word,
          count: wordData.search_count || 0
        });
      }
    });
    
    // Get search statistics over time from search_logs collection
    const searchEndDate = new Date();

    // Get all search logs in the time period
    const searchLogsSnapshot = await db.collection('search_logs')
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', searchEndDate)
      .get();

    // Group by date
    const searchesByDate = {};

    searchLogsSnapshot.forEach(doc => {
      const data = doc.data();
      const timestamp = data.timestamp.toDate();
      const dateStr = timestamp.toLocaleDateString('vi-VN', dateFormat);
      
      searchesByDate[dateStr] = (searchesByDate[dateStr] || 0) + 1;
    });

    // Create array with all days in range (including days with zero searches)
    const daysToGenerate = timeRange === 'week' ? 7 :
                          timeRange === 'month' ? 30 :
                          timeRange === 'quarter' ? 90 : 365;

    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (daysToGenerate - i - 1));
      const dateStr = date.toLocaleDateString('vi-VN', dateFormat);
      
      reportData.searchStats.push({
        date: dateStr,
        count: searchesByDate[dateStr] || 0
      });
    }
    
    // Get suggestion statistics
    const suggestionCounts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };
    
    const suggestionsSnapshot = await db.collection('suggestions').get();
    suggestionsSnapshot.forEach(doc => {
      const suggestionData = doc.data();
      const status = suggestionData.status || 'pending';
      if (suggestionCounts[status] !== undefined) {
        suggestionCounts[status]++;
      }
    });
    
    reportData.suggestionStats = suggestionCounts;
    
    return res.json({
      success: true,
      data: reportData
    });
    
  } catch (error) {
    console.error('Error generating report data:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;