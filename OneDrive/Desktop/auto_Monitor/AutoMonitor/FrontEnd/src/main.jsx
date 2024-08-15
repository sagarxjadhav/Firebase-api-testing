import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import Login from './screens/Login.jsx';
import Register from './screens/Register.jsx';

// Create a root element for React 18+
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="login" element={<Login />} />
        <Route path="Register" element={<Register />} />
        
        
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
