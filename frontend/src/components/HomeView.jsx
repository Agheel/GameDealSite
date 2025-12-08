import React from 'react';

const HomeView = ({ onStoreClick }) => {
  return (
    <div className="home-container">
      <h2 className="home-title">어떤 플랫폼의 할인을 찾으세요?</h2>
      <div className="platform-list">
        
        {/* Steam */}
        <div className="platform-card steam" onClick={() => onStoreClick("1", "Steam")}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" alt="Steam" />
          <h3>Steam</h3>
          <p>압도적인 게임 수</p>
        </div>

        {/* Epic Games */}
        <div className="platform-card epic" onClick={() => onStoreClick("25", "Epic Games")}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg" alt="Epic" />
          <h3>Epic Games</h3>
          <p>매주 무료 배포 & 할인</p>
        </div>

        {/* GMG */}
        <div className="platform-card gmg" onClick={() => onStoreClick("3", "GMG")}>
          <img src="https://www.cheapshark.com/img/stores/banners/3.png" alt="GMG" />
          <h3>GMG</h3>
          <p>공식 키 할인 판매</p>
        </div>

      </div>
    </div>
  );
};

export default HomeView;