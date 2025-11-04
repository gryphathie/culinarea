// Admin Helper Component - For making users admin programmatically
// This is a utility component you can temporarily add to your app for testing
import React, { useState } from 'react';
import { useAuth } from '../firebase/auth';
import { userService } from '../firebase/services';

const AdminHelper = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('admin');

  const makeCurrentUserAdmin = async () => {
    if (!user) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      await userService.createUserProfile(user.uid, { role });
      setMessage(`✅ Success! You are now ${role}. Refresh the page and check the menu.`);
    } catch (error) {
      console.error('Error creating admin profile:', error);
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    if (!user) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const isAdmin = await userService.isAdmin(user.uid);
      const role = await userService.getUserRole(user.uid);
      
      if (isAdmin) {
        setMessage(`✅ You have admin access! Role: ${role || 'unknown'}`);
      } else {
        setMessage(`❌ You do NOT have admin access. Your role: ${role || 'none'}`);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', background: '#fff3cd', margin: '20px', borderRadius: '8px' }}>
        <h3>Admin Helper</h3>
        <p>Please log in to use this tool.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f8f9fa', 
      margin: '20px', 
      borderRadius: '8px',
      border: '1px solid #50B8B8'
    }}>
      <h3>🧑‍💼 Admin Helper Tool</h3>
      <p><strong>Current User:</strong> {user.email}</p>
      <p><strong>UID:</strong> {user.uid}</p>
      
      <div style={{ marginTop: '20px' }}>
        <label>
          Role: 
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="admin">Admin</option>
            <option value="propietary">Propietary</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={makeCurrentUserAdmin}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#50B8B8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Make Me ' + role.charAt(0).toUpperCase() + role.slice(1)}
        </button>
        
        <button 
          onClick={checkAdminStatus}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Check Status
        </button>
      </div>

      {message && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: message.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px'
        }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
        <p><strong>⚠️ Note:</strong> This is a development tool. Remove this component from production!</p>
      </div>
    </div>
  );
};

export default AdminHelper;

