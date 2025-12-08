import React from 'react';
import { toWon, getStoreName, translateGenre } from '../utils';

const GameModal = ({ game, onClose }) => {
  if (!game) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
         <button className="close-btn" onClick={onClose}>✖</button>

         <img src={game.thumb} alt="game thumb" className="modal-thumb" />

         <h2>{game.title}</h2>
         
         {/* ⭐ 모달에서는 모든 장르 다 보여주기 */}
         <div className="modal-genre-list" style={{marginBottom: '20px', display:'flex', justifyContent:'center', gap:'5px', flexWrap:'wrap'}}>
             {Array.isArray(game.genre) ? game.genre.map((g, idx) => (
                 <span key={idx} style={{background:'#f1f2f6', padding:'5px 10px', borderRadius:'15px', fontSize:'0.9rem', color:'#666'}}>
                     {translateGenre(g)}
                 </span>
             )) : (
                 // 혹시 옛날 데이터일 경우 대비
                 <span style={{background:'#f1f2f6', padding:'5px 10px', borderRadius:'15px', fontSize:'0.9rem', color:'#666'}}>
                     {translateGenre(game.genre)}
                 </span>
             )}
         </div>

         <div className="modal-price-box">
            <p>정가: <span className="normal-price">{toWon(game.normalPrice)}</span></p>
            <h1 className="modal-final-price">{toWon(game.salePrice)}</h1>
            <p className="modal-savings">⚡ {Math.round(game.savings)}% 할인 중!</p>
         </div>

         <a
           href={`https://www.cheapshark.com/redirect?dealID=${game.dealID}`}
           target="_blank"
           rel="noreferrer"
           className={`buy-btn store-${game.storeID}`}
         >
           {getStoreName(game.storeID)} 바로가기 🚀
         </a>
      </div>
    </div>
  );
};

export default GameModal;