import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { MdOutlineCancel, MdOutlineWorkOutline } from 'react-icons/md';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

import { links } from '../data/menu';
import { useStateContext } from '../contexts/ContextProvider';

const Sidebar = () => {
  const { currentColor, activeMenu, setActiveMenu, screenSize } = useStateContext();

  const handleCloseSideBar = () => {
    if (activeMenu !== undefined && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const activeLink = 'flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-white text-md m-2';
  const normalLink = 'flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2';

  return (
    <div className="flex flex-col justify-between h-screen">
      <div className="overflow-y-auto">
        <div className="ml-3">
          {activeMenu && (
            <>
              <div className="flex justify-between items-center">
                <Link to="/overview" onClick={handleCloseSideBar} className="items-center gap-3 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900">
                  <MdOutlineWorkOutline /> <span>CareerTracker</span>
                </Link>
                <TooltipComponent content="Menu" position="BottomCenter">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(!activeMenu)}
                    style={{ color: currentColor }}
                    className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden"
                  >
                    <MdOutlineCancel />
                  </button>
                </TooltipComponent>
              </div>
              <div className="mt-10">
                {links.map((item) => (
                  <div key={item.title}>
                    <p className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase">
                      {item.title}
                    </p>
                    {item.links.map((link) => (
                      <div key={link.name}>
                        {link.name === 'Help' ? (
                          <a
                            href={link.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={normalLink}
                            onClick={handleCloseSideBar}
                          >
                            {link.icon}
                            <span className="capitalize">{link.name}</span>
                          </a>
                        ) : (
                          <NavLink
                            to={link.path}
                            key={link.name}
                            onClick={handleCloseSideBar}
                            style={({ isActive }) => ({
                              backgroundColor: isActive ? currentColor : '',
                            })}
                            className={({ isActive }) => (isActive ? activeLink : normalLink)}
                          >
                            {link.icon}
                            <span className="capitalize">{link.name}</span>
                          </NavLink>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center mb-4">
        <a href="https://www.linkedin.com/in/sufianadnan" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-3">
          <FaLinkedin size={24} />
        </a>
        <a href="https://github.com/sufianadnan" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <FaGithub size={24} />
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
