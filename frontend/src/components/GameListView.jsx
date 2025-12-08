// src/components/GameListView.jsx

import React from 'react';
import GameCard from './GameCard';
import { translateGenre } from '../utils';

const GameListView = ({
  games, totalCount, title, onBack, onGameClick,
  genres, selectedGenre, onSelectGenre,
  currentPage, totalPages, onPageChange,
  sortOption, onSortChange,
  allGames // 모달용 데이터지만 리스트에선 안 씀
}) => {

  const renderPagination = () => {
    let pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination">
        <button
          className="page-btn nav-btn"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          이전
        </button>
        {pages.map(num => (
          <button
            key={num}
            className={`page-btn ${currentPage === num ? 'active' : ''}`}
            onClick={() => onPageChange(num)}
          >
            {num}
          </button>
        ))}
        <button
          className="page-btn nav-btn"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      </div>
    );
  };

  return (
    <div className="list-container">
      <div className="list-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="back-btn" onClick={onBack}>← 뒤로가기</button>
          <h2>{title} <span style={{fontSize:'0.6em', color:'var(--text-sub)'}}>({totalCount}개)</span></h2>
        </div>

        <select className="sort-select" value={sortOption} onChange={onSortChange}>
          <option value="metacritic">🏆 메타점수 높은순</option>
          <option value="savings">⚡ 할인율 높은순</option>
          <option value="price_asc">💸 가격 낮은순</option>
        </select>
      </div>

      <div className="main-layout">
        <aside className="sidebar">
          <h3>장르 필터</h3>
          <div className="genre-list">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => onSelectGenre(genre)}
                className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
              >
                {translateGenre(genre)}
              </button>
            ))}
          </div>
        </aside>

        <main className="content-area">
          {games.length === 0 ? (
            <div className="no-result">해당 장르의 게임이 없습니다 😢</div>
          ) : (
            /* ⭐ [핵심 수정] 여기 클래스 이름을 'game-grid'로 복구했습니다! */
            <div className="game-grid">
              {games.map((game, index) => (
                <GameCard
                  key={index}
                  game={game}
                  onClick={onGameClick}
                />
              ))}
            </div>
          )}
          {totalPages > 1 && renderPagination()}
        </main>
      </div>
    </div>
  );
};

export default GameListView;