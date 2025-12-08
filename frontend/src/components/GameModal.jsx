// src/components/GameModal.jsx (확장형 버전)
import React, { useEffect, useRef } from 'react';
import { toWon, getStoreName, translateGenre, getStoreIcon } from '../utils';

const GameModal = ({ game, onClose, allGames, onGameClick }) => {
  const modalRef = useRef();

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (game && modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [game]);

  if (!game) return null;

  // 추천 로직
  const getRecommendations = () => {
    if (!allGames) return [];
    let candidates = allGames.filter(g => g.dealID !== game.dealID);
    const myGenres = new Set(Array.isArray(game.genre) ? game.genre.map(g => translateGenre(g)) : []);
    candidates = candidates.filter(g => 
      Array.isArray(g.genre) && g.genre.some(genre => myGenres.has(translateGenre(genre)))
    );
    candidates.sort((a, b) => b.metacriticScore - a.metacriticScore);
    return candidates.slice(0, 3);
  };

  const recommendations = getRecommendations();
  const placeholderDesc = "이 게임은 흥미진진한 모험과 액션을 제공합니다. 스팀 페이지에서 더 자세한 내용을 확인해보세요!";

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content-wide" ref={modalRef}>
         <button className="close-btn" onClick={onClose}>✖</button>

         {/* 상단: 상세 정보 */}
         <div className="modal-top-section">
            <div className="modal-left-col">
              {game.metacriticScore > 0 && <div className="modal-score-badge">🏆 {game.metacriticScore}</div>}
              <img src={game.thumb} alt={game.title} className="modal-main-thumb" />
            </div>

            <div className="modal-right-col">
               <div className="modal-header-info">
                 <img src={getStoreIcon(game.storeID)} alt="store" className="modal-store-icon" />
                 <span className="modal-store-name">{getStoreName(game.storeID)}</span>
               </div>
               
               <h2 className="modal-title">{game.title}</h2>
               
               <div className="modal-genre-tags">
                  {Array.isArray(game.genre) && game.genre.map((g, idx) => (
                      <span key={idx} className="modal-tag">{translateGenre(g)}</span>
                  ))}
               </div>

               <p className="modal-description">
                 {game.description || placeholderDesc}
               </p>

               <div className="modal-price-area">
                  <div className="price-row">
                    <span className="modal-normal-price">{toWon(game.normalPrice)}</span>
                    <span className="modal-discount-tag">{Math.round(game.savings)}% OFF</span>
                  </div>
                  <h1 className="modal-sale-price">{toWon(game.salePrice)}</h1>
                  
                  <a
                    href={`https://www.cheapshark.com/redirect?dealID=${game.dealID}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`buy-btn-modal store-${game.storeID}`}
                  >
                    {getStoreName(game.storeID)} 바로가기 🚀
                  </a>
               </div>
            </div>
         </div>

         {/* 하단: 추천 게임 */}
         {recommendations.length > 0 && (
           <div className="modal-bottom-section">
             <h4 className="rec-title">👍 메타점수 높은 비슷한 게임</h4>
             <div className="rec-grid">
               {recommendations.map(recGame => (
                 <div key={recGame.dealID} className="rec-card" onClick={() => onGameClick(recGame)}>
                   <img src={recGame.thumb} alt={recGame.title} />
                   <div className="rec-info">
                     <div className="rec-title">{recGame.title}</div>
                     <div className="rec-price">{toWon(recGame.salePrice)}</div>
                   </div>
                   {recGame.metacriticScore > 0 && <span className="rec-score">{recGame.metacriticScore}</span>}
                 </div>
               ))}
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default GameModal;