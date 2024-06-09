import React from 'react';
import { Link } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';

const NotFoundPage = () => {
  const { currentColor } = useStateContext();

  const customStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100%',
    backgroundColor: 'black',
    color: 'white',
    fontFamily: 'Segoe UI, sans-serif',
  };

  const errorStyle = {
    lineHeight: '48px',
  };

  const errorHTML = `
    <style>
      body { color: #000; background: #fff; margin: 0; }
      .next-error-h1 { border-right: 1px solid rgba(0,0,0,.3); }
      @media (prefers-color-scheme: dark) {
        body { color: #fff; background: #000; }
        .next-error-h1 { border-right: 1px solid rgba(255,255,255,.3); }
      }
    </style>
    <h1 class="next-error-h1" style="display: inline-block; margin: 0 20px 0 0; padding-right: 23px; font-size: 24px; font-weight: 500; vertical-align: top">404</h1>
    <div style="display: inline-block">
      <h2 style="font-size: 14px; font-weight: 400; line-height: 28px">This page could not be found.</h2>
    </div>
  `;

  const linkStyle = {
    display: 'inline-block',
    marginTop: '50px',
    backgroundColor: currentColor,
    color: 'white',
    padding: '8px 16px',
    borderRadius: '5px',
    textDecoration: 'none',
    fontSize: '16px',
  };

  return (
    <div style={customStyle}>
      <div style={errorStyle} dangerouslySetInnerHTML={{ __html: errorHTML }} />
      <Link to="/" style={linkStyle}>Return Home</Link>
    </div>
  );
};

export default NotFoundPage;
