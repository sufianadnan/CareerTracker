import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';

const StateContext = createContext();

const initialState = {
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState('#03C9D7');
  const [currentMode, setCurrentMode] = useState('Light');
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [nftyEndpoint, setNftyEndpoint] = useState('');
  const [enableDiscord, setEnableDiscord] = useState(false);
  const [enableNfty, setEnableNfty] = useState(false);

  useEffect(() => {
    const savedDiscordWebhook = localStorage.getItem('discordWebhook');
    if (savedDiscordWebhook) {
      setDiscordWebhook(savedDiscordWebhook);
    }

    const savedNftyEndpoint = localStorage.getItem('nftyEndpoint');
    if (savedNftyEndpoint) {
      setNftyEndpoint(savedNftyEndpoint);
    }
  }, []);

  const setMode = (e) => {
    setCurrentMode(e.target.value);
    localStorage.setItem('themeMode', e.target.value);
  };

  const setColor = (color) => {
    setCurrentColor(color);
    localStorage.setItem('colorMode', color);
  };

  const handleSave = async () => {
    try {
      localStorage.setItem('discordWebhook', discordWebhook);
      localStorage.setItem('nftyEndpoint', nftyEndpoint);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const handleClick = (clicked) => setIsClicked({ ...initialState, [clicked]: true });

  const contextValue = useMemo(
    () => ({
      currentColor,
      currentMode,
      activeMenu,
      screenSize,
      setScreenSize,
      handleClick,
      isClicked,
      initialState,
      setIsClicked,
      setActiveMenu,
      setCurrentColor,
      setCurrentMode,
      setMode,
      setColor,
      themeSettings,
      setThemeSettings,
      discordWebhook,
      setDiscordWebhook,
      nftyEndpoint,
      setNftyEndpoint,
      enableDiscord,
      setEnableDiscord,
      enableNfty,
      setEnableNfty,
      handleSave,
    }),
    [
      currentColor,
      currentMode,
      activeMenu,
      screenSize,
      isClicked,
      themeSettings,
      discordWebhook,
      nftyEndpoint,
      enableDiscord,
      enableNfty,
    ],
  );

  return (
    <StateContext.Provider value={contextValue}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
