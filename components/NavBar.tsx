import React from 'react';
import { ViewState } from '../types';

interface NavBarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, setView }) => {
  const getBtnClass = (view: ViewState) => 
    `flex-1 py-3 text-center text-sm font-semibold ${
      currentView === view 
        ? 'text-blue-600 border-t-2 border-blue-600 bg-blue-50' 
        : 'text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg pb-safe z-50 no-print">
      <div className="flex justify-around max-w-md mx-auto">
        <button onClick={() => setView(ViewState.HOME)} className={getBtnClass(ViewState.HOME)}>
          <span className="block text-xl mb-1">📸</span>
          Scanner
        </button>
        <button onClick={() => setView(ViewState.REPORT)} className={getBtnClass(ViewState.REPORT)}>
          <span className="block text-xl mb-1">📋</span>
          Rapport
        </button>
        <button onClick={() => setView(ViewState.CHAT)} className={getBtnClass(ViewState.CHAT)}>
          <span className="block text-xl mb-1">🤖</span>
          Assistant
        </button>
      </div>
    </div>
  );
};

export default NavBar;