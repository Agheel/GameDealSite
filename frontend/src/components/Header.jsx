import React from 'react';

const Header = ({ searchQuery, onSearch, onGoHome, isDarkMode, toggleTheme }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="logo" onClick={onGoHome}>🎮 Game Deals</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="게임 제목을 검색해보세요..."
            value={searchQuery}
            onChange={onSearch}
          />
          
          <button 
            className="theme-btn" 
            onClick={toggleTheme}
            title={isDarkMode ? "라이트 모드로 변경" : "다크 모드로 변경"}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;