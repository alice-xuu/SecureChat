import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

window.$hostUrl = 'https://localhost:8081'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
