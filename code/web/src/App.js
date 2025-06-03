import React, { useState } from 'react';
import PotholeQueryPage from './component/PotholeQueryPage.jsx';
import RoadAnalysis from './component/RoadAnalysis.jsx';
import PotholeMapPage from './component/PotholeMapPage.jsx';
import Temp from './component/temp.jsx';
import ImageModal from './component/ImageModal.jsx';


import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('pothole');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'pothole':
        return <PotholeQueryPage setSelectedImageUrl={setSelectedImageUrl}/>;
      case 'road':
        return <RoadAnalysis />;
      case 'map':
        return <PotholeMapPage />;
      case 'temp':
        return <Temp />;
      default:
        return <PotholeQueryPage setSelectedImageUrl={setSelectedImageUrl}/>;
    }
  };

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setMenuOpen(false); // 메뉴 선택 시 자동 닫힘
  };

  return (
      <div className="app-container">
        {selectedImageUrl && (
          <ImageModal
            imageUrl={selectedImageUrl}
            onClose={() => setSelectedImageUrl(null)}/>
        )}
        {/* 상단 네비게이션 바 */}
        <div className="navbar">
          <span className="logo">Hole In One Q</span>

          <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className={`nav-buttons ${menuOpen ? 'active' : ''}`}>
            <button onClick={() => handleNavClick('pothole')} className="nav-button">포트홀 분석</button>
            <button onClick={() => handleNavClick('road')} className="nav-button">도로 분석</button>
            <button onClick={() => handleNavClick('map')} className="nav-button">포트홀 지도</button>
            <button onClick={() => handleNavClick('temp')} className="nav-button">임시</button>
          </div>
        </div>

        {/* 현재 페이지 렌더링 */}
        <div className="page-container">
          {renderPage()}
        </div>
      </div>
  );
}

export default App;
