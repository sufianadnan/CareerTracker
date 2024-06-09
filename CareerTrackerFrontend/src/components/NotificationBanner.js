import React, { useEffect } from 'react';

const NotificationBanner = ({ notifications, clearNotifications }) => {
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        clearNotifications();
      }, 2500);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [notifications, clearNotifications]);

  const bannerStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'inherit',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  };

  return (
    <>
      {notifications.map((notification, index) => (
        <div
          key={index}
          style={{
            ...bannerStyle,
            backgroundColor: notification.color,
            bottom: `${20 + index * 60}px`,
          }}
        >
          {notification.message}
        </div>
      ))}
    </>
  );
};

export default NotificationBanner;
