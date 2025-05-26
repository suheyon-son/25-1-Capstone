import React, { useState, useRef, useEffect } from "react";
import "./RoadAnalysis.css";

const thLabels = [
  { label: "도로명", value: "roadName" },
  { label: "포트홀 개수", value: "potholeCount" },
  { label: "평균 위험도", value: "avgRisk" },
  { label: "최근 측정 일시", value: "lastMeasuredAt" },
  { label: "최근 보수 일시", value: "lastRepairedAt" },
  { label: "처리 상태", value: "status" },
];

// 예시 데이터
const dummyData = [
  {
    roadName: "도로1",
    potholeCount: 2,
    avgRisk: 3.5,
    lastMeasuredAt: "2025-05-19",
    lastRepairedAt: "2025-05-20",
    status: "정상",
  },
  {
    roadName: "도로2",
    potholeCount: 4,
    avgRisk: 2.1,
    lastMeasuredAt: "2025-05-18",
    lastRepairedAt: "2025-05-21",
    status: "점검중",
  },
  {
    roadName: "도로3",
    potholeCount: 1,
    avgRisk: 4.3,
    lastMeasuredAt: "2025-05-22",
    lastRepairedAt: "2025-05-23",
    status: "보수필요",
  },
];

const RoadAnalysis = () => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [data, setData] = useState(dummyData);

  // 드롭다운 상태
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchField, setSearchField] = useState(thLabels[0]);
  const dropdownRef = useRef();

  // 드롭다운 바깥 클릭 시 닫힘
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    const sorted = [...data].sort((a, b) => {
      if (a[field] === b[field]) return 0;
      if (direction === "asc") return a[field] > b[field] ? 1 : -1;
      else return a[field] < b[field] ? 1 : -1;
    });
    setData(sorted);
  };

  const handleDropdownSelect = (item) => {
    setSearchField(item);
    setDropdownOpen(false);
  };

  return (
    <div className="container">
      <div className="content">
        {/* 메뉴 바 */}
        <div className="menu-bar">
          <button className="menu-button selected">도로 분석</button>
          <div className="search-dropdown-wrap" ref={dropdownRef}>
            <input
              type="text"
              className="search-dropdown"
              value={searchField.label}
              readOnly
              onClick={() => setDropdownOpen((open) => !open)}
              tabIndex={0}
            />
            <span
              className="dropdown-arrow"
              onClick={() => setDropdownOpen((open) => !open)}
              tabIndex={0}
            >
              ▼
            </span>
            {dropdownOpen && (
              <div className="dropdown-list">
                {thLabels.map((item) => (
                  <div
                    key={item.value}
                    className={
                      "dropdown-option" +
                      (searchField.value === item.value ? " selected" : "")
                    }
                    onClick={() => handleDropdownSelect(item)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input type="text" className="search-bar" placeholder="검색" />
          <button className="search-button">검색</button>
        </div>

        {/* 테이블 영역 */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                {thLabels.map(({ label, value }) => (
                  <th key={value} className="sortable-th">
                    <span className="th-label">{label}</span>
                    <span className="sort-btn-wrap">
                      <button
                        className={
                          "sort-arrow-btn" +
                          (sortField === value && sortDirection === "asc"
                            ? " active"
                            : "")
                        }
                        onClick={() => handleSort(value, "asc")}
                        aria-label={`${label} 오름차순 정렬`}
                        type="button"
                      >
                        ▲
                      </button>
                      <button
                        className={
                          "sort-arrow-btn" +
                          (sortField === value && sortDirection === "desc"
                            ? " active"
                            : "")
                        }
                        onClick={() => handleSort(value, "desc")}
                        aria-label={`${label} 내림차순 정렬`}
                        type="button"
                      >
                        ▼
                      </button>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.roadName}</td>
                  <td>{row.potholeCount}</td>
                  <td>{row.avgRisk}</td>
                  <td>{row.lastMeasuredAt}</td>
                  <td>{row.lastRepairedAt}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="footer">2025 Capstone Design</footer>
    </div>
  );
};

export default RoadAnalysis;
