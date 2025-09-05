import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import './fonts.css';

// Import pages
import Search from './pages/Search';
import Translation from './pages/Translation';
import Learning from './pages/Learning';
import Profile from './pages/Profile';

// Import components
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import RequireAuth from './components/auth/RequireAuth';
import RequireAdmin from './components/auth/RequireAdmin';

// learning mode
import FlashcardMode from './pages/learning/FlashcardMode';
import MiniTestMode from './pages/learning/MiniTestMode';
import QuizMode from './pages/learning/QuizMode';

// admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DictionaryManagement from './pages/admin/DictionaryManagement';
import SuggestionsManagement from './pages/admin/SuggestionsManagement';
import ReportsView from './pages/admin/ReportsView';

import RequireActiveUser from './components/auth/RequireActiveUser';

// Import User Context Provider
import { UserProvider } from './context/UserContext';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <>
      {!isAdminRoute && <Sidebar />}
      <main className={`main-content ${!isAdminRoute ? '' : 'admin-content'}`}>
        {children}
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Regular routes with sidebar */}
            <Route path="/" element={
              <AppLayout>
                <Navigate to="/search" replace />
              </AppLayout>
            } />
            {/* Protected routes that need active user */}
            <Route path="/search" element={
              <AppLayout>
                <RequireActiveUser>
                  <Search />
                </RequireActiveUser>
              </AppLayout>
            } />
            <Route path="/translation" element={
              <AppLayout>
                <RequireActiveUser>
                  <Translation />
                </RequireActiveUser>
              </AppLayout>
            } />
            <Route path="/learning" element={
              <AppLayout>
                <RequireActiveUser>
                  <Learning />
                </RequireActiveUser>
              </AppLayout>
            } />
            <Route path="/learning/notebook/:notebookId/flashcard" element={
              <AppLayout>
                <FlashcardMode />
              </AppLayout>
            } />
            <Route path="/learning/notebook/:notebookId/quiz" element={
              <AppLayout>
                <QuizMode />
              </AppLayout>
            } />
            <Route path="/profile" element={
              <AppLayout>
                <Profile />
              </AppLayout>
            } />
            
            {/* Admin routes without main sidebar */}
            <Route path="/admin" element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="dictionary" element={<DictionaryManagement />} />
              <Route path="suggestions" element={<SuggestionsManagement />} />
              <Route path="reports" element={<ReportsView />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}


export default App;