// src/utils.js

export const toWon = (price) => Math.floor(price * 1450).toLocaleString() + '원';

export const getStoreIcon = (storeID) => {
  if (storeID === "1") return "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg";
  if (storeID === "25") return "https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg";
  if (storeID === "3") return "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Green_Man_Gaming_logo_2024.svg/1024px-Green_Man_Gaming_logo_2024.svg.png";
  return null;
};

export const getStoreName = (storeID) => {
  if (storeID === "1") return 'Steam';
  if (storeID === "25") return 'Epic Games';
  if (storeID === "3") return 'GMG';
  return 'Store';
};

// 장르 한글 변환
export const translateGenre = (genre) => {
  const map = {
    'All': '전체보기', 'Action': '액션', 'RPG': 'RPG', 'Strategy': '전략',
    'Adventure': '모험', 'Simulation': '시뮬레이션', 'Indie': '인디',
    'Sports': '스포츠', 'Racing': '레이싱', 'Casual': '캐주얼',
    'Massively Multiplayer': 'MMO', 'Fighting': '격투', 'Horror': '공포',
    'Etc': '기타', 'Unknown': '미분류', 'Akcja' : '전략 시뮬레이션', 'Экшены' : '전략 시뮬레이션',
    'Стратегии' : '전략',
  };
  return map[genre] || genre; // 사전에 없으면 영어 그대로 반환
};