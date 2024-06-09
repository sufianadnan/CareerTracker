import React from 'react';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { MdDashboard, MdManageAccounts } from 'react-icons/md';
import { FaListAlt, FaChartBar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { BsArchive } from 'react-icons/bs';

import { FiHelpCircle } from 'react-icons/fi';

export const links = [
  {
    id: 1,
    title: 'Applications',
    links: [
      {
        name: 'overview',
        icon: <MdDashboard />,
        path: '/overview',
      },
      {
        name: 'Add Credentials',
        icon: <AiOutlinePlusCircle />,
        path: '/add-credentials',
      },
      {
        name: 'Check Active Applications',
        icon: <FaListAlt />,
        path: '/check-active-applications',
      },
      {
        name: 'Check Closed Applications',
        icon: <BsArchive />,
        path: '/check-closed-applications',
      },
      {
        name: 'Edit All Logins',
        icon: <MdManageAccounts />,
        path: '/edit-all-logins',
      },
    ],
  },
  {
    id: 2,
    title: 'Getting Started',
    links: [
      {
        name: 'Help',
        icon: <FiHelpCircle />,
        path: 'https://careertracker.gitbook.io/careertracker', // Change the path to URL
        target: '_blank', // Open link in new tab
      },
    ],
  },
];

export const statsMenu = [
  {
    icon: <FaChartBar />,
    title: 'Total Applications',
    iconColor: '#27AE60',
    iconBg: '#D1F2EB',
    pcColor: 'green-600',
  },
  {
    icon: <FaCheckCircle />,
    title: 'Total Active Applications',
    iconColor: '#4CAF50',
    iconBg: '#E8F5E9',
    pcColor: 'green-600',
  },
  {
    icon: <FaTimesCircle />,
    title: 'Total Inactive Applications',
    iconColor: '#CC0000',
    iconBg: '#ffcdcd',
    pcColor: 'green-600',
  },
  {
    icon: <MdManageAccounts />,
    title: 'Total Logins',
    iconColor: 'black',
    iconBg: '#F5F5DC',
    pcColor: 'green-600',
  },
];
export const themeColors = [
  {
    color: '#FB9678',
    name: 'orange-theme',
  },
  {
    color: '#958f8c',
    name: 'grey-hat',
  },
  {
    color: '#009656',
    name: 'green-hat',
  },
  {
    color: '#000000',
    name: 'black-hat',
  },
  {
    color: '#ffffff',
    name: 'white-hat',
  },
  {
    color: '#00cfe3',
    name: 'blue-hat',
  },
  {
    color: '#EE0000',
    name: 'red-hat',
  },
  {
    name: 'blue-theme',
    color: '#1A97F5',
  },
  {
    name: 'green-theme',
    color: '#03C9D7',
  },
  {
    name: 'purple-theme',
    color: '#7352FF',
  },
  {
    name: 'red-theme',
    color: '#FF5C8E',
  },
  {
    name: 'indigo-theme',
    color: '#1E4DB7',
  },
];
export const editGrid = [
  { type: 'checkbox', width: '50' },
  {
    field: 'Email',
    headerText: 'Email',
    width: '150',
    textAlign: 'Center',
  },
  {
    field: 'Password',
    headerText: 'Password',
    width: '150',
    textAlign: 'Center',
  },
  {
    field: 'Website',
    headerText: 'Website',
    width: '150',
    textAlign: 'Center',
  },
  {
    field: 'DatabaseID',
    headerText: 'Database ID',
    width: '120',
    textAlign: 'Center',
    isPrimaryKey: true,
  },
];
