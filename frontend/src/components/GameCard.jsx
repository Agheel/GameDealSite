import React from 'react';
import { toWon, getStoreIcon, translateGenre } from '../utils';

const GameCard = ({ game, onClick }) => {
  // 임시 설명 문구 (데이터가 없으므로)
  const placeholderDesc = "이 게임은 흥미진진한 모험과 액션을 제공합니다. 자세한 내용은 클릭해서 확인하세요!";

  return (
    <div className="game-card" onClick={() => onClick(game)}>
      
      {/* 👈 왼쪽: 이미지 및 배지 영역 */}
      <div className="card-image-wrapper">
        {game.metacriticScore > 0 && (
          <div className="score-badge">🏆 {game.metacriticScore}</div>
        )}
        <img src={getStoreIcon(game.storeID)} alt="store" className="store-icon" />
        <img src={game.thumb} alt={game.title} className="card-thumb" />
      </div>

      {/* 👉 오른쪽: 정보 및 설명 영역 */}
      <div className="card-content-right">
        {/* 제목 */}
        <h3 className="card-title">{game.title}</h3>
        
        {/* 장르 태그 */}
        <div className="genre-tags">
          {Array.isArray(game.genre) && game.genre.slice(0, 3).map((g, idx) => (
              <span key={idx} className="card-genre-tag">{translateGenre(g)}</span>
          ))}
          {Array.isArray(game.genre) && game.genre.length > 3 && (
              <span className="card-genre-tag">+</span>
          )}
        </div>

        {/* ⭐ 간단한 설명 (추가됨) */}
        <p className="card-description">
          {game.description || placeholderDesc}
        </p>
        
        {/* 가격 정보 (오른쪽 하단 고정) */}
        <div className="price-container">
          <div className="price-top">
            <span className="normal-price">{toWon(game.normalPrice)}</span>
            <span className="discount-rate">↓ {Math.round(game.savings)}%</span>
          </div>
          <div className="sale-price">{toWon(game.salePrice)}</div>
        </div>
      </div>

    </div>
  );
};

export default GameCard;