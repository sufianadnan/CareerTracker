import React from 'react';
import { useStateContext } from '../contexts/ContextProvider';

const Footer = () => {
  const { currentColor } = useStateContext();
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-24">
      <p className="dark:text-gray-200 text-gray-700 text-center m-20">© {currentYear} All rights reserved.  | Built by <a href="https://sufianadnan.com" style={{ color: currentColor }} className="hover:underline" target="_blank" rel="noreferrer">Sufian Adnan</a></p>
    </div>
  );
};

export default Footer;
