import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from "firebase/firestore";
import './App.css';

import Header from './components/Header';
import HomeView from './components/HomeView';
import GameListView from './components/GameListView';
import GameModal from './components/GameModal';
import { translateGenre } from './utils';

function App() {
  const [allGames, setAllGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);

  const [viewMode, setViewMode] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStoreTitle, setCurrentStoreTitle] = useState('');

  // ⭐ 기본값: '전체보기' (한글로 통일)
  const [selectedGenre, setSelectedGenre] = useState('전체보기');
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 12;

  // 다크 모드
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "game_deals"));
        const dataList = querySnapshot.docs.map(doc => doc.data());
        
        const validGames = dataList.filter(game => game.savings > 0).map(game => ({
            ...game,
            genre: Array.isArray(game.genre) ? game.genre : [game.genre || 'Etc']
        }));

        validGames.sort((a, b) => b.metacriticScore - a.metacriticScore);
        setAllGames(validGames);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };
    fetchGames();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);

    if (query.length > 0) {
      setViewMode('list');
      setCurrentStoreTitle(`'${query}' 검색 결과`);
      setSelectedGenre('전체보기'); // 초기화
      const searchResults = allGames.filter(game =>
        game.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredGames(searchResults);
    } else {
      setViewMode('home');
    }
  };

  const handleStoreClick = (storeID, storeName) => {
    setSearchQuery('');
    setViewMode('list');
    setCurrentPage(1);
    setCurrentStoreTitle(`${storeName} 독점 핫딜`);
    setSelectedGenre('전체보기'); // 초기화
    const storeGames = allGames.filter(game => game.storeID === storeID);
    setFilteredGames(storeGames);
  };

  const goHome = () => {
    setSearchQuery('');
    setViewMode('home');
  };

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
  };

  // ⭐ [핵심 수정 1] 필터링 로직 업그레이드
  // 게임의 장르들(영어/한글 섞임)을 하나씩 한글로 변환해보고, 
  // 그 중에 '사용자가 선택한 한글 장르'와 일치하는 게 있는지 확인
  const genreFilteredGames = filteredGames.filter(game => {
    if (selectedGenre === '전체보기' || selectedGenre === 'All') return true;
    
    // game.genre 안에는 ['Strategy', 'Indie']가 들어있을 수 있음
    // 하나라도 번역했을 때 selectedGenre('전략')와 같으면 통과!
    return game.genre.some(g => translateGenre(g) === selectedGenre);
  });

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = genreFilteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(genreFilteredGames.length / gamesPerPage);

  // ⭐ [핵심 수정 2] 사이드바 목록 만들기 (중복 제거의 핵심)
  // 1. 모든 게임의 장르를 꺼낸다. (영어, 한글 섞여있음)
  const allRawGenres = filteredGames.flatMap(game => game.genre);
  
  // 2. 싹 다 한글로 번역해버린다. (['Strategy', '전략'] -> ['전략', '전략'])
  const allTranslatedGenres = allRawGenres.map(g => translateGenre(g));
  
  // 3. 중복을 제거한다. (['전략', '전략'] -> ['전략'])
  const uniqueGenres = Array.from(new Set(allTranslatedGenres));

  // 4. 정렬한다. (기타/미분류는 맨 뒤로)
  uniqueGenres.sort((a, b) => {
    const specialGenres = ['기타', '미분류', 'Etc', 'Unknown'];
    const aIsSpecial = specialGenres.includes(a);
    const bIsSpecial = specialGenres.includes(b);
    
    if (aIsSpecial && !bIsSpecial) return 1;
    if (!aIsSpecial && bIsSpecial) return -1;
    return a.localeCompare(b, 'ko');
  });

  // 최종 목록 완성
  const availableGenres = ['전체보기', ...uniqueGenres];

  return (
    <div className="app-container">
      <Header searchQuery={searchQuery} onSearch={handleSearch} onGoHome={goHome} 
              isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />

      {viewMode === 'home' ? (
        <HomeView onStoreClick={handleStoreClick} />
      ) : (
        <GameListView
          games={currentGames}
          totalCount={genreFilteredGames.length}
          title={currentStoreTitle}
          onBack={goHome}
          onGameClick={setSelectedGame}
          genres={availableGenres}
          selectedGenre={selectedGenre}
          onSelectGenre={handleGenreSelect}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
    </div>
  );
}

export default App;