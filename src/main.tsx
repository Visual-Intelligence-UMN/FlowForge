import React from 'react';
import ReactDOM from 'react-dom/client';

import AppTestReactflow from './reactflow-test/AppTestReactflow';
import AppTestDoubleflows from './reactflow-test/AppTestDoubleflows';
import App from './App';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
