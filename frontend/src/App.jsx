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

  const [selectedGenre, setSelectedGenre] = useState('전체보기');
  
  const [sortOption, setSortOption] = useState('metacritic'); 
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 16;

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

        // 초기 데이터 로딩 시 기본 정렬
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
      setSelectedGenre('전체보기');
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
    setSelectedGenre('전체보기');
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

  // 정렬 변경 핸들러
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // 정렬 바꾸면 1페이지로 이동
  };

  // 장르 필터링
  const genreFilteredGames = filteredGames.filter(game => {
    if (selectedGenre === '전체보기' || selectedGenre === 'All') return true;
    return game.genre.some(g => translateGenre(g) === selectedGenre);
  });

  // 정렬 로직 적용 (필터링된 목록을 정렬)
  const sortedGames = [...genreFilteredGames].sort((a, b) => {
    if (sortOption === 'metacritic') {
      return b.metacriticScore - a.metacriticScore; // 점수 높은순
    } else if (sortOption === 'savings') {
      return b.savings - a.savings; // 할인율 높은순
    } else if (sortOption === 'price_asc') {
      return a.salePrice - b.salePrice; // 가격 낮은순
    }
    return 0;
  });

  // 페이지네이션
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = sortedGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(sortedGames.length / gamesPerPage);

  // 사이드바 장르 목록 생성
  const allRawGenres = filteredGames.flatMap(game => game.genre);
  const allTranslatedGenres = allRawGenres.map(g => translateGenre(g));
  const uniqueGenres = Array.from(new Set(allTranslatedGenres));
  
  uniqueGenres.sort((a, b) => {
    const specialGenres = ['기타', '미분류', 'Etc', 'Unknown'];
    const aIsSpecial = specialGenres.includes(a);
    const bIsSpecial = specialGenres.includes(b);
    if (aIsSpecial && !bIsSpecial) return 1;
    if (!aIsSpecial && bIsSpecial) return -1;
    return a.localeCompare(b, 'ko');
  });

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
          allGames={allGames}
          sortOption={sortOption}
          onSortChange={handleSortChange}
        />
      )}

      <GameModal 
        game={selectedGame} 
        onClose={() => setSelectedGame(null)} 
        allGames={allGames} 
        onGameClick={setSelectedGame} // 추천 게임 클릭 시 바로 이동하기 위해
      />
    </div>
  );
}

export default App;