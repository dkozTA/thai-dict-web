import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/common/Pagelayout';
import styles from '../styles/Profile.module.css';
import { upsertUser, getUser, createNotebook } from '../services/userApi';
import { registerUser, loginUser, logoutUser, onAuthStateChange } from '../services/userService'; // ensure updateUserDisplayName exported

const Profile = () => {
  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [error, setError] = useState('');

  // Central loader
const loadUserDoc = useCallback(async (uid, email, displayName) => {
    try {
      await upsertUser(uid, email || '', displayName || '');
      const doc = await getUser(uid);
      if (doc && doc.password) delete doc.password;
      setUserData(doc);

      let stored = localStorage.getItem('defaultNotebookId');
      if (!stored) {
        const existingKeys = Object.keys(doc?.notebooks || {});
        if (existingKeys.length) {
          stored = existingKeys[0];
          localStorage.setItem('defaultNotebookId', stored);
        } else {
          const nb = await createNotebook(uid, 'Lớp học').catch(()=>null);
          if (nb?.id) {
            stored = nb.id;
            localStorage.setItem('defaultNotebookId', stored);
            const doc2 = await getUser(uid);
            if (doc2 && doc2.password) delete doc2.password;
            setUserData(doc2);
          }
        }
      }
    } catch (e) {
      console.error('Load user doc failed', e);
    }
  }, []);

  // Listen to Firebase auth state
useEffect(() => {
    const unsub = onAuthStateChange(async (u) => {
      setAuthUser(u || null);
      if (u) {
        localStorage.setItem('userId', u.uid);
        await loadUserDoc(u.uid, u.email, u.displayName);
      } else {
        localStorage.removeItem('userId');
        setUserData(null);
      }
    });
    return () => unsub();
  }, [loadUserDoc]);

  const handleInputChange = (e) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email.trim()) return setError('Email bắt buộc');
    if (formData.password.length < 6) return setError('Mật khẩu >= 6 ký tự');
    if (!isLogin && formData.password !== formData.confirmPassword) return setError('Mật khẩu không khớp');
    if (!isLogin && formData.displayName.trim().length < 2) return setError('Tên hiển thị quá ngắn');

    setLoading(true);
    try {
      if (isLogin) {
        await loginUser(formData.email.trim(), formData.password);
      } else {
        await registerUser(formData.email.trim(), formData.password, formData.displayName.trim());
      }
      setFormData(f => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err) {
      let msg = err.message || 'Lỗi xác thực';
      if (err.code === 'auth/configuration-not-found') {
        msg = 'Cấu hình Firebase chưa đúng. Kiểm tra .env và bật Email/Password trên Firebase Console.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password chưa được bật trong Firebase Console.';
      }
      setError(msg);
      // eslint-disable-next-line no-console
      console.error('[Auth]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser().catch(()=>{});
  };

  // Support both history.searches (old) and history.search (new)
  const searchHistoryArr = userData?.history?.searches || userData?.history?.search || [];
  const wordCount = Object.values(userData?.notebooks || {})
    .reduce((sum, nb) => sum + Object.keys(nb.words || {}).length, 0);
  const notebookCount = Object.keys(userData?.notebooks || {}).length;
  const historyCount = searchHistoryArr.length;

  if (authUser) {
    return (
      <PageLayout title="Tài khoản cá nhân" showUserInfo={false}>
        <div className={styles.profileContent}>
          <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}><span>👤</span></div>
              <h2>Chào mừng, {authUser.displayName || authUser.email}</h2>
              <p>{authUser.email}</p>
            </div>

            <div className={styles.profileStats}>
              <div className={styles.statCard}>
                <h3>📚 Từ đã lưu</h3>
                <span className={styles.statNumber}>{wordCount}</span>
              </div>
              <div className={styles.statCard}>
                <h3>📖 Sổ tay</h3>
                <span className={styles.statNumber}>{notebookCount}</span>
              </div>
              <div className={styles.statCard}>
                <h3>🔍 Lịch sử</h3>
                <span className={styles.statNumber}>{historyCount}</span>
              </div>
            </div>

            <div className={styles.profileActions}>
              <button className={styles.logoutButton} onClick={handleLogout} disabled={loading}>Đăng xuất</button>
            </div>

            <div className={styles.profileExtra}>
              <h3>Lịch sử gần đây</h3>
              <ul className={styles.simpleList}>
                {searchHistoryArr.slice(0,10).map(t=> <li key={t}>{t}</li>)}
                {!searchHistoryArr.length && <li>(trống)</li>}
              </ul>

              {/* <h3>Từ trong sổ tay đầu tiên</h3>
              {notebookCount ? (
                <ul className={styles.simpleList}>
                  {Object
                    .values(Object.values(userData.notebooks)[0].words || {})
                    .slice(0,10)
                    .map(w => <li key={w.id}>{w.word} – {w.vietnamese_meaning?.slice(0,40)}</li>)}
                  {!Object.values(Object.values(userData.notebooks)[0].words || {}).length && <li>(chưa có từ)</li>}
                </ul>
              ) : <p>(Chưa có sổ tay)</p>} */}
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
              type="button"
              disabled={loading}
            >Đăng nhập</button>
            <button
              className={`${styles.authTab} ${!isLogin ? styles.activeTab : ''}`}
              onClick={() => setIsLogin(false)}
              type="button"
              disabled={loading}
            >Đăng ký</button>
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
                  disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                  disabled={loading}
                  className={styles.input}
                />
              </div>
            )}

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => { if (!loading) { setIsLogin(!isLogin); setError(''); } }}
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