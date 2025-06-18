import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import "./page.css";

const PotholeQueryPage = () => {
  const [timelineData, setTimelineData] = useState([]);
  const [dangerData, setDangerData] = useState([]);
  const [topRoads, setTopRoads] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/analysis/timeline`)
      .then((res) => res.json())
      .then(setTimelineData);

    fetch(`${process.env.REACT_APP_API_URL}/api/analysis/danger`)
      .then((res) => res.json())
      .then(setDangerData);

    fetch(`${process.env.REACT_APP_API_URL}/api/analysis/by-road`)
      .then((res) => res.json())
      .then(setTopRoads);
  }, []);

  return (
    <div className="container analysis-layout">
      <div className="left-column">
        <div className="chart-section">
          <h3>시간 기반 분석</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h3>심각도 기반 분석</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dangerData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="right-column">
        <h3>위험한 도로 Top 10</h3>
        <table className="top-table">
          <thead>
            <tr>
              <th>도로명</th>
              <th>위험도</th>
              <th>포트홀 수</th>
            </tr>
          </thead>
          <tbody>
            {topRoads.map((row, i) => (
              <tr key={i}>
                <td>{row.roadname_roadname}</td>
                <td>{row.avg_danger.toFixed(2)}</td>
                <td>{row.pothole_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="footer">2025 Capstone Design</footer>
    </div>
  );
};

export default PotholeQueryPage;
