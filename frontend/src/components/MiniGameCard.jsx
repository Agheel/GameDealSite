// src/components/MiniGameCard.jsx 생성
import React from 'react';

const MiniGameCard = ({ game, onClick }) => {
  return (
    <div className="mini-game-card" onClick={() => onClick(game)}>
      {game.metacriticScore > 0 && (
        <div className="mini-score-badge">{game.metacriticScore}</div>
      )}
      <img src={game.thumb} alt={game.title} className="mini-card-thumb" />
      <div className="mini-card-info">
        <h4 className="mini-card-title">{game.title}</h4>
      </div>
    </div>
  );
};

export default MiniGameCard;