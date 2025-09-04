import React, { useState, useEffect } from 'react';
import styles from '../../styles/Admin.module.css';
import { getAllUsers, updateUserRole, toggleUserActive, deleteUser } from '../../services/adminApi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? {...user, role: newRole} : user
      ));
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update role. Please try again.');
    }
  };
  
  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await toggleUserActive(userId);
      setUsers(users.map(user => 
        user.id === userId ? {...user, isActive: !currentStatus} : user
      ));
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };
  
  // Filter and search functionality
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (user.displayName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className={styles.adminPage}>
      <h1>User Management</h1>
      
      <div className={styles.filters}>
        <input 
          type="text"
          placeholder="Search by email or name"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        
        <select 
          value={roleFilter} 
          onChange={e => setRoleFilter(e.target.value)}
          className={styles.selectFilter}
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="moderator">Moderators</option>
          <option value="editor">Editors</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      
      {loading ? (
        <div className={styles.loading}>Loading users...</div>
      ) : (
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Last Login</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.displayName || '(No name)'}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role || 'user'}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    className={styles.roleSelect}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{new Date(user.created_at?.seconds * 1000).toLocaleDateString()}</td>
                <td>{user.last_login ? new Date(user.last_login?.seconds * 1000).toLocaleDateString() : 'Never'}</td>
                <td>
                  <span className={user.isActive !== false ? styles.activeStatus : styles.inactiveStatus}>
                    {user.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button 
                    className={user.isActive !== false ? styles.deactivateBtn : styles.activateBtn}
                    onClick={() => handleToggleActive(user.id, user.isActive !== false)}
                  >
                    {user.isActive !== false ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="7" className={styles.noResults}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;