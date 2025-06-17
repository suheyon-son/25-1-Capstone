import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./PotholeQueryPage.css";

const thLabels = [
  { label: "도로명", value: "roadName" },
  { label: "포트홀 개수", value: "potholeCount" },
  { label: "위험도", value: "risk" },
  { label: "최근 측정 일시", value: "lastMeasuredAt" },
  { label: "최근 보수 일시", value: "lastRepairedAt" },
  { label: "처리 상태", value: "status" },
  { label: "포트홀 URL", value: "potholeUrl" },
];

function formatKoreanDate(dateStr) {
  return dayjs(dateStr).format("YYYY년 MM월 DD일 HH:mm:ss");
}

const PotholeQueryPage = ({ setSelectedImageUrl }) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState(thLabels[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // ✅ 초기 데이터 로딩
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = (query = "", field = "") => {
    const params = query && field ? { field, query } : {};
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/roadSearch`, { params })
      .then((res) => {
        const transformed = res.data.map((item) => ({
          roadName: item.roadname_roadname,
          potholeCount: item.road_count,
          risk: item.road_danger,
          lastMeasuredAt: formatKoreanDate(item.road_lastdate),
          lastRepairedAt: formatKoreanDate(item.road_lastfixdate),
          status: item.road_state,
          potholeUrl: item.pothole_url || "없음",
        }));
        setData(transformed);
      })
      .catch((err) => {
        console.error("데이터 불러오기 실패:", err);
      });
  };

  const handleSearch = () => {
    fetchData(searchQuery.trim(), searchField.value);
  };

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    const sorted = [...data].sort((a, b) => {
      if (a[field] === b[field]) return 0;
      if (direction === "asc") return a[field] > b[field] ? 1 : -1;
      return a[field] < b[field] ? 1 : -1;
    });
    setData(sorted);
  };

  const handleDropdownSelect = (item) => {
    setSearchField(item);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return ( 
    <div className="container">
      <div className="content">
        <div className="menu-bar">
          <div className="search-dropdown-wrap" ref={dropdownRef}>
            <input
              type="text"
              className="search-dropdown"
              value={searchField.label}
              readOnly
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            {dropdownOpen && (
              <div className="dropdown-list">
                {thLabels.map((item) => (
                  <div
                    key={item.value}
                    className={
                      "dropdown-option" + (searchField.value === item.value ? " selected" : "")
                    }
                    onClick={() => handleDropdownSelect(item)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            type="text"
            className="search-bar"
            placeholder="검색어 입력"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button" onClick={handleSearch}>
            검색
          </button>
        </div>
        
        {/* 테이블 */}
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
                          (sortField === value && sortDirection === "asc" ? " active" : "")
                        }
                        onClick={() => handleSort(value, "asc")}
                        type="button"
                      >
                        ▲
                      </button>
                      <button
                        className={
                          "sort-arrow-btn" +
                          (sortField === value && sortDirection === "desc" ? " active" : "")
                        }
                        onClick={() => handleSort(value, "desc")}
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
                  <td>{row.risk}</td>
                  <td>{row.lastMeasuredAt}</td>
                  <td>{row.lastRepairedAt}</td>
                  <td>{row.status}</td>
                  <td>{row.potholeUrl ? (
                    <button className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => setSelectedImageUrl(row.potholeUrl)}
                    >
                      이미지 보기
                    </button>
                    ) : ( '없음' )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="footer">2025 Capstone Design</footer>
      </div>
    </div>
  );
};

export default PotholeQueryPage;
