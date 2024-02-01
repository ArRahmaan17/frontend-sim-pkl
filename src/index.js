import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
const { io } = require("socket.io-client");
const socket = io("http://127.0.0.1:3001");
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App dataSocket={socket} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
