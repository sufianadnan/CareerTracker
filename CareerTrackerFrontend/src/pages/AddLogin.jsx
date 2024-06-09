import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useStateContext } from '../contexts/ContextProvider';

const AddLogin = () => {
  const { currentColor } = useStateContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let timeoutId;

    if (message) {
      timeoutId = setTimeout(() => {
        setMessage('');
      }, 4000);
    }
    return () => clearTimeout(timeoutId);
  }, [message]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/save_entries', { email, password, url });
      if (response.status === 200) {
        setMessage('Data saved successfully!');
        setEmail('');
        setPassword('');
        setUrl('');
      } else {
        setMessage(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setMessage('Failed to save data. Please try again.');
      console.error('Error posting data', error);
    }
  };
  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <h1 style={{ color: currentColor, fontSize: '2rem', marginBottom: '10px' }} className="font-bold">Add Your Credentials</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        { message && (
          <div className="text-sm text-center font-medium p-4 mb-4 rounded-md" style={{ backgroundColor: message.includes('success') ? '#D4EDDA' : '#f8d7da', color: message.includes('success') ? '#155724' : '#721c24' }}>
            {message}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Login Email Address
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-2 focus:ring-${currentColor} focus:border-${currentColor} sm:text-sm`}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Login Password
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-2 focus:ring-${currentColor} focus:border-${currentColor} sm:text-sm`}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">Workday Login URL
            <input
              id="url"
              name="url"
              type="url"
              required
              value={url}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-2 focus:ring-${currentColor} focus:border-${currentColor} sm:text-sm`}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            style={{ backgroundColor: currentColor }}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${currentColor}`}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLogin;
