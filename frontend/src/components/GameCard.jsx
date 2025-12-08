// src/components/GameCard.jsx - 전체 덮어쓰기

import React from 'react';
import { toWon, getStoreIcon, translateGenre } from '../utils';

const GameCard = ({ game, onClick }) => {
  return (
    <div className="game-card" onClick={() => onClick(game)}>
      
      {/* 1. 이미지 영역 (상단) */}
      <div className="card-image-wrapper">
        {game.metacriticScore > 0 && (
          <div className="score-badge">🏆 {game.metacriticScore}</div>
        )}
        <img src={getStoreIcon(game.storeID)} alt="store" className="store-icon" />
        <img src={game.thumb} alt={game.title} className="card-thumb" />
      </div>

      {/* 2. 내용 영역 (하단) */}
      <div className="card-content-right">
        <h3 className="card-title">{game.title}</h3>
        
        <div className="genre-tags">
          {Array.isArray(game.genre) && game.genre.slice(0, 3).map((g, idx) => (
              <span key={idx} className="card-genre-tag">{translateGenre(g)}</span>
          ))}
          {Array.isArray(game.genre) && game.genre.length > 3 && (
              <span className="card-genre-tag">+</span>
          )}
        </div>

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