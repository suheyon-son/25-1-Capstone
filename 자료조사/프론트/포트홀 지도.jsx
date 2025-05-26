import React from "react";
import "./PotholeMapPage.css";

export default function PotholeMapPage() {
  return (
    <div className="pmp4-root">
      <div className="pmp4-header">
        <span className="title">포트홀 지도</span>
        <div className="menu-bar">
          <button className="menu-btn">&#9776;</button>
        </div>
      </div>
      <div className="nav-bar">
      </div>
      <div className="pmp4-body">
        <div className="pmp4-sidebar">
          <div className="pmp4-section">
            <div className="pmp4-label">범위</div>
            <div className="form-row">
              <label>시도</label>
              <select className="pmp4-select">
                <option>선택</option>
              </select>
            </div>
            <div className="form-row">
              <label>시군구</label>
              <select className="pmp4-select">
                <option>선택</option>
              </select>
            </div>
            <div className="form-row">
              <label>도로명</label>
              <select className="pmp4-select">
                <option>선택</option>
              </select>
            </div>
          </div>
          <div className="pmp4-section">
            <div className="pmp4-label">위험도 수준</div>
            <div className="form-row">
              <input type="text" placeholder="~" className="pmp4-select" />
              <input type="text" placeholder="~" className="pmp4-select" />
            </div>
          </div>
          <div className="pmp4-section">
            <div className="pmp4-label">깊이</div>
            <div className="form-row">
              <input type="text" placeholder="~" className="pmp4-select" />
              <input type="text" placeholder="~" className="pmp4-select" />
            </div>
          </div>
          <div className="pmp4-section">
            <div className="pmp4-label">너비</div>
            <div className="form-row">
              <input type="text" placeholder="~" className="pmp4-select" />
              <input type="text" placeholder="~" className="pmp4-select" />
            </div>
            {/* 확인 버튼 추가 */}
            <button className="pmp4-confirm-btn">확인</button>
          </div>
        </div>
        <div className="pmp4-maparea">
          <div className="pmp4-mapbg">
            <img
              src="map_sample.png"
              alt="지도"
              className="sample-map"
              style={{
                width: "240px",
                height: "230px",
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
              }}
            />
          </div>
        </div>
      </div>
      <div className="pmp4-footer">2025 Capstone Design</div>
    </div>
  );
}
