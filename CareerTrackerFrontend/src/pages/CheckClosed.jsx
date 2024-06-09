import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircleLoader from 'react-spinners/CircleLoader';
import { useStateContext } from '../contexts/ContextProvider';
import { sendPayloadToDiscordWebhook } from '../components/DiscordWebhookUtils';
import { sendPayloadToNtfyEndpoint } from '../components/NtfyWebhookUtils';
import NotificationBanner from '../components/NotificationBanner';

const ClosedApplications = () => {
  const { currentColor } = useStateContext();
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);

  const sendWebhookPayload = async (data) => {
    const enableDiscord = localStorage.getItem('enableDiscord') === 'true';
    const enableNfty = localStorage.getItem('enableNfty') === 'true';

    const webhookPromises = [];

    if (enableDiscord) {
      const discordWebhook = localStorage.getItem('discordWebhook');
      if (discordWebhook) {
        webhookPromises.push(
          sendPayloadToDiscordWebhook(data, discordWebhook, 'ACTIVE')
            .then((responses) => responses.map((response) => ({
              ...response,
              platform: 'Discord',
              color: response.success ? '#23C552' : '#FF6347',
              message: response.success ? 'Discord notification sent successfully' : 'Error sending Discord notification',
            }))),
        );
      }
    }

    if (enableNfty) {
      const nftyWebhook = localStorage.getItem('nftyEndpoint');
      if (nftyWebhook) {
        webhookPromises.push(
          sendPayloadToNtfyEndpoint(data, nftyWebhook, 'ACTIVE', 'white_check_mark')
            .then((responses) => responses.map((response) => ({
              ...response,
              platform: 'Ntfy',
              color: response.success ? '#23C552' : '#FF6347',
              message: response.success ? 'Ntfy notification sent successfully' : 'Error sending Ntfy notification',
            }))),
        );
      }
    }

    const allResponses = (await Promise.all(webhookPromises)).flat();

    const uniqueNotifications = [];
    const platforms = new Set();
    allResponses.forEach((response) => {
      if (!platforms.has(response.platform)) {
        uniqueNotifications.push(response);
        platforms.add(response.platform);
      }
    });

    setNotifications(uniqueNotifications);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/inactive_applications');
        const flattenedResults = response.data.flat();
        setResults(flattenedResults);
        setFilteredResults(flattenedResults);
        setLoading(false);
        await sendWebhookPayload(flattenedResults);
      } catch (err) {
        setFetchError('Error fetching data');
        // eslint-disable-next-line no-console
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = results.filter((result) => result.company.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredResults(filtered);
  }, [searchTerm, results]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const parseDate = (dateString) => {
    const cleanDate = dateString.replace('Created on ', '');
    const date = new Date(cleanDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const mobileStyle = {
    overflowX: 'auto',
    width: '100%',
    marginTop: '20px',
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  };

  const tableStyle = {
    width: '100%',
    borderTop: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    borderRight: '1px solid #ccc',
  };

  const headerStyle = {
    flex: '1 0 0%',
    minWidth: '120px',
    padding: '8px',
    textAlign: 'center',
    backgroundColor: currentColor,
    color: 'black',
  };

  const rowStyle = {
    flex: '1 0 0%',
    minWidth: '120px',
    padding: '8px',
    textAlign: 'center',
    color: 'black',
    backgroundColor: 'white',
    borderBottom: '1px solid #ccc',
    fontWeight: 'semibold',
  };

  const searchStyle = {
    marginBottom: '20px',
    marginTop: '20px',
    width: '98%',
    padding: '10px',
    fontSize: '16px',
  };
  return (
    <div className="flex flex-col m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-2xl">
      <h1 style={{ color: currentColor, fontSize: '2rem', marginBottom: '10px' }} className="font-bold">Check All Closed Applications</h1>
      <div style={containerStyle}>
        <h1 style={{ textAlign: 'left', alignSelf: 'flex-start' }}>Last Updated: {new Date().toLocaleString()}</h1>
        <input
          className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-2 focus:ring-${currentColor} focus:border-${currentColor} sm:text-sm`}
          type="text"
          placeholder="Search by company..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={searchStyle}
        />
        {loading && (
          <div className="flex justify-center items-center" style={{ minHeight: '100px' }}>
            <CircleLoader size={50} color={currentColor} loading={loading} />
          </div>
        )}
        {!loading && fetchError && <div>Error: {fetchError}</div>}
        {!loading && !fetchError && (
          <div style={window.innerWidth < 600 ? mobileStyle : tableStyle}>
            <div className="flex text-gray-800 bg-gray-300 font-bold" style={{ width: '100%' }}>
              <div style={headerStyle}>Company</div>
              <div style={headerStyle}>Job Title</div>
              <div style={headerStyle}>Status</div>
              <div style={headerStyle}>Date Applied</div>
            </div>
            {filteredResults.map((item, index) => (
              <div key={index} className="flex text-gray-800 bg-gray-100 border-b" style={{ width: '100%' }}>
                <div style={rowStyle}>{item.company}</div>
                <div style={rowStyle}>{item.postingTitle}</div>
                <div style={rowStyle}>{item.status}</div>
                <div style={rowStyle}>{parseDate(item.dateApplied)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <NotificationBanner notifications={notifications} clearNotifications={clearNotifications} />
    </div>
  );
};

export default ClosedApplications;
