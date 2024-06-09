import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { statsMenu } from '../data/menu';
import { useStateContext } from '../contexts/ContextProvider';
import { LineChart } from '../components';

const Overview = () => {
  const { currentMode } = useStateContext();
  const [credentialsCount, setCredentialsCount] = useState(0);
  const [TotalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  useEffect(() => {
    const fetchCredentialsCount = async () => {
      try {
        const response = await axios.get('/api/stats');
        console.log('API response:', response.data);
        setCredentialsCount(response.data.credentials_count);
        setTotalCount(response.data.total);
        setActiveCount(response.data.active);
        setInactiveCount(response.data.inactive);
        console.log('Credentials count:', credentialsCount);
        console.log('Total count:', TotalCount);
        console.log('Active count:', activeCount);
        console.log('Inactive count:', inactiveCount);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchCredentialsCount();
  }, []);

  const statsMenuWithValues = statsMenu.map((item) => {
    let value;
    switch (item.title) {
      case 'Total Applications':
        value = TotalCount;
        break;
      case 'Total Active Applications':
        value = activeCount;
        break;
      case 'Total Inactive Applications':
        value = inactiveCount;
        break;
      case 'Total Logins':
        value = credentialsCount;
        break;
      default:
        value = 0;
    }
    return {
      ...item,
      value,
    };
  });
  return (
    <div className="mt-24">
      <div className="flex flex-wrap lg:flex-nowrap justify-center ">
        <div className="flex m-3 flex-wrap justify-center gap-1 items-center">
          {statsMenuWithValues.map((item) => (
            <div key={item.title} className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56  p-4 pt-9 rounded-2xl ">
              <button
                type="button"
                style={{ color: item.iconColor, backgroundColor: item.iconBg }}
                className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
              >
                {item.icon}
              </button>
              <p className="mt-3">
                <span className="text-lg font-semibold">{item.value}</span>
                <span className={`text-sm ${currentMode === 'Dark' ? 'text-gray-500' : `text-${item.pcColor}`} ml-2`}>
                  {item.percentage}
                </span>
              </p>
              <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : ''} mt-1`}>{item.title}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-10 m-4 flex-wrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl w-96 md:w-760">
          <div className="flex justify-between items-center gap-2 mb-10">
            <p className="text-xl font-semibold">Applications Over Time</p>
          </div>
          <div className="md:w-full overflow-auto">
            <LineChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
