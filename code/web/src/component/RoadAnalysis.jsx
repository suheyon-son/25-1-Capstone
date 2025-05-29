import React, { useState, useRef, useEffect } from "react";
import "./page.css";

const thLabels = [
  { label: "포트홀 번호", value: "potholeId" },
  { label: "도로명", value: "roadName" },
  { label: "깊이(cm)", value: "depth" },
  { label: "너비(cm)", value: "width" },
  { label: "위험도", value: "risk" },
  { label: "측정 일시", value: "measuredAt" },
];

const dummyData = [
  {
    potholeId: 1,
    roadName: "도로1",
    depth: 3.2,
    width: 12,
    risk: 4.1,
    measuredAt: "2025-05-19",
  },
  {
    potholeId: 2,
    roadName: "도로2",
    depth: 5.1,
    width: 16,
    risk: 2.8,
    measuredAt: "2025-05-20",
  },
  {
    potholeId: 3,
    roadName: "도로3",
    depth: 2.7,
    width: 10,
    risk: 3.7,
    measuredAt: "2025-05-18",
  },
];

const PotholeQueryPage = () => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [data, setData] = useState(dummyData);

  // 드롭다운 관련 상태 추가
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchField, setSearchField] = useState(thLabels[0]); // 기본값 '포트홀 번호'
  const dropdownRef = useRef();

  // 드롭다운 바깥 클릭하면 닫힘
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
      if (field === "measuredAt") {
        const dateA = new Date(a[field]);
        const dateB = new Date(b[field]);
        if (dateA.getTime() === dateB.getTime()) return 0;
        if (direction === "asc") return dateA > dateB ? 1 : -1;
        else return dateA < dateB ? 1 : -1;
      } else {
        if (a[field] === b[field]) return 0;
        if (direction === "asc") return a[field] > b[field] ? 1 : -1;
        else return a[field] < b[field] ? 1 : -1;
      }
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
        <div className="menu-bar">
          <button className="menu-button selected">포트홀 조회</button>
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
                  {thLabels.map(({ value }) => (
                    <td key={value}>{row[value]}</td>
                  ))}
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

export default PotholeQueryPage;
