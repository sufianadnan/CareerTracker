import React, { useState } from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { BsCheck } from 'react-icons/bs';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';

import { themeColors } from '../data/menu';
import { useStateContext } from '../contexts/ContextProvider';

const ThemeSettings = () => {
  const {
    setColor,
    setMode,
    currentMode,
    currentColor,
    setThemeSettings,
    discordWebhook,
    setDiscordWebhook,
    nftyEndpoint,
    setNftyEndpoint,
    enableDiscord,
    setEnableDiscord,
    enableNfty,
    setEnableNfty,
  } = useStateContext();

  const [localDiscordWebhook, setLocalDiscordWebhook] = useState(localStorage.getItem('discordWebhook') || discordWebhook);
  const [localNftyEndpoint, setLocalNftyEndpoint] = useState(localStorage.getItem('nftyEndpoint') || nftyEndpoint);
  const [localEnableDiscord, setLocalEnableDiscord] = useState(JSON.parse(localStorage.getItem('enableDiscord')) || enableDiscord);
  const [localEnableNfty, setLocalEnableNfty] = useState(JSON.parse(localStorage.getItem('enableNfty')) || enableNfty);

  const handleSave = () => {
    if (localEnableDiscord && !localDiscordWebhook.trim()) {
      alert('Please enter a Discord Webhook URL.');
      return;
    }
    if (localEnableNfty && !localNftyEndpoint.trim()) {
      alert('Please enter a Nfty Endpoint.');
      return;
    }
    setDiscordWebhook(localDiscordWebhook);
    setNftyEndpoint(localNftyEndpoint);
    setEnableDiscord(localEnableDiscord);
    setEnableNfty(localEnableNfty);
    localStorage.setItem('discordWebhook', localDiscordWebhook);
    localStorage.setItem('nftyEndpoint', localNftyEndpoint);
    localStorage.setItem('enableDiscord', JSON.stringify(localEnableDiscord));
    localStorage.setItem('enableNfty', JSON.stringify(localEnableNfty));
    alert('Settings saved successfully!');
  };

  return (
    <div className="bg-half-transparent w-screen fixed nav-item top-0 right-0">
      <div className="float-right h-screen dark:text-gray-200 bg-white dark:bg-[#181818] w-400">
        <div className="flex justify-between items-center p-4 ml-4">
          <p className="font-semibold text-lg">Settings</p>
          <button
            type="button"
            onClick={() => setThemeSettings(false)}
            style={{ color: 'rgb(153, 171, 180)', borderRadius: '50%' }}
            className="text-2xl p-3 hover:drop-shadow-xl hover:bg-light-gray"
          >
            <MdOutlineCancel />
          </button>
        </div>
        <div className="flex-col border-t-1 border-color p-4 ml-4">
          <p className="font-semibold text-xl">Theme Options</p>
          <div className="mt-4">
            <input
              type="radio"
              id="light"
              name="theme"
              value="Light"
              className="cursor-pointer"
              onChange={setMode}
              checked={currentMode === 'Light'}
            />
            <span className="ml-2 text-md cursor-pointer" onClick={() => document.getElementById('light').click()}>
              Light
            </span>
          </div>
          <div className="mt-2">
            <input
              type="radio"
              id="dark"
              name="theme"
              value="Dark"
              onChange={setMode}
              checked={currentMode === 'Dark'}
            />
            <span className="ml-2 text-md cursor-pointer" onClick={() => document.getElementById('dark').click()}>
              Dark
            </span>
          </div>
        </div>
        <div className="p-4 border-t-1 border-color ml-4">
          <p className="font-semibold text-xl">Theme Colors</p>
          <div className="flex gap-3 flex-wrap">
            {themeColors.map((item, index) => (
              <TooltipComponent key={index} content={item.name} position="TopCenter">
                <div
                  className="relative mt-2 cursor-pointer flex gap-5 items-center"
                  key={item.name}
                >
                  <button
                    type="button"
                    className="h-10 w-10 rounded-full cursor-pointer"
                    style={{ backgroundColor: item.color }}
                    onClick={() => setColor(item.color)}
                  >
                    <BsCheck className={`ml-2 text-2xl text-white ${item.color === currentColor ? 'block' : 'hidden'}`} />
                  </button>
                </div>
              </TooltipComponent>
            ))}
          </div>
        </div>
        <div className="p-4 border-t-1 border-color ml-4">
          <p className="font-semibold text-xl">Integration Settings</p>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="enableDiscord"
              checked={localEnableDiscord}
              onChange={() => setLocalEnableDiscord(!localEnableDiscord)}
              className="mr-2"
            />
            <div className="font-light text-m cursor-pointer" onClick={() => document.getElementById('enableDiscord').click()}>
              Enable Discord Integration
            </div>
          </div>
          {localEnableDiscord && (
            <input
              type="text"
              placeholder="Discord Webhook URL"
              value={localDiscordWebhook}
              onChange={(e) => setLocalDiscordWebhook(e.target.value)}
              className="mb-4 p-2 w-full dark:text-black border border-gray-300 focus:outline-none focus:border-blue-500"
            />
          )}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="enableNfty"
              checked={localEnableNfty}
              onChange={() => setLocalEnableNfty(!localEnableNfty)}
              className="mr-2"
            />
            <div className="font-light text-m cursor-pointer" onClick={() => document.getElementById('enableNfty').click()}>
              Enable NFTY Service
            </div>
          </div>
          {localEnableNfty && (
            <input
              type="text"
              placeholder="NFTY Endpoint"
              value={localNftyEndpoint}
              onChange={(e) => setLocalNftyEndpoint(e.target.value)}
              className="mb-4 p-2 w-full dark:text-black border border-gray-300 focus:outline-none focus:border-blue-500"
            />
          )}
          <button
            type="button"
            onClick={handleSave}
            style={{ backgroundColor: currentColor }}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
