import React, { useEffect, useState } from 'react';
import { auth } from '../firebase/config';

const FirebaseTest = () => {
  const [configStatus, setConfigStatus] = useState('Checking...');

  useEffect(() => {
    try {
      // Test if Firebase is properly configured
      if (auth.app.options.apiKey && auth.app.options.projectId) {
        setConfigStatus('✅ Firebase configured correctly');
      } else {
        setConfigStatus('❌ Firebase configuration missing');
      }
    } catch (error) {
      setConfigStatus(`❌ Firebase error: ${error.message}`);
    }
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h3>Firebase Configuration Test</h3>
      <p>{configStatus}</p>
      <p><strong>API Key:</strong> {auth.app.options.apiKey ? '✅ Set' : '❌ Missing'}</p>
      <p><strong>Project ID:</strong> {auth.app.options.projectId ? '✅ Set' : '❌ Missing'}</p>
    </div>
  );
};

export default FirebaseTest;
