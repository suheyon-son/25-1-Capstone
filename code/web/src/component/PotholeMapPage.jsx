import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import "./PotholeMapPage.css";
import { RangeInput } from "./rangeInput.jsx";
import MapPage from "./MapPage.jsx";
import { handleSearch } from "./handleSearch.jsx";

const PotholeMapPage = () => {
  const [sidoList, setSidoList] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);
  const [emdList, setEmdList] = useState([]);
  const [roadList, setRoadList] = useState([]);

  const [selectedSido, setSelectedSido] = useState('');
  const [selectedSigungu, setSelectedSigungu] = useState('');
  const [selectedEmd, setSelectedEmd] = useState('');
  const [selectedRoad, setSelectedRoad] = useState('');

  const [dangerMin, setDangerMin] = useState(null);
  const [dangerMax, setDangerMax] = useState(null);
  const [depthMin, setDepthMin] = useState(null);
  const [depthMax, setDepthMax] = useState(null);
  const [widthMin, setWidthMin] = useState(null);
  const [widthMax, setWidthMax] = useState(null);

  const mapPageRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/sido').then(res => setSidoList(res.data));
  }, []);

  useEffect(() => {
    if (selectedSido) {
      axios.get(`http://localhost:8000/api/sigungu/${selectedSido}`).then((res) => {
        const data = res.data;

        if (data.length === 0) {
          axios.get(`http://localhost:8000/api/emd/${selectedSido}`)
            .then((res) => setEmdList(res.data))
            .catch((err) => console.error(err));

          setSigunguList([]);
        } else {
          setSigunguList(data);
          setEmdList([]);
        }
      }).catch((err) => console.error(err));
    }
  }, [selectedSido]);

  useEffect(() => {
    if (selectedSido && selectedSigungu) {
      axios.get(`http://localhost:8000/api/emd/${selectedSido}/${selectedSigungu}`)
        .then(res => setEmdList(res.data))
        .catch(err => console.error(err));
    }
  }, [selectedSido, selectedSigungu]);

  useEffect(() => {
    if (selectedSido && selectedSigungu && selectedEmd) {
      axios.get(`http://localhost:8000/api/roadname/${selectedSido}/${selectedSigungu}/${selectedEmd}`)
        .then(res => setRoadList(res.data));
    }
    else if (selectedSido && selectedEmd) {
      axios.get(`http://localhost:8000/api/roadname/${selectedSido}/${selectedEmd}`)
        .then(res => setRoadList(res.data));
    }
  }, [selectedSido, selectedSigungu, selectedEmd]);

const onSearchClick = () => {
  const ref = mapPageRef.current;

  if (!ref || !ref.getMap || !ref.createMarker || !ref.clearMarkers) {
    console.error("MapPage ref is not set or required methods are not available.");
    return;
  }

  const filters = {
    sido: selectedSido,
    sigungu: selectedSigungu,
    emd: selectedEmd,
    road: selectedRoad,
    dangerMin,
    dangerMax,
    depthMin,
    depthMax,
    widthMin,
    widthMax,
  };

  handleSearch({
    filters,
    mapInstance: ref.getMap(),
    createMarker: ref.createMarker,
    clearMarkers: ref.clearMarkers,
  });
};

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
              <form onSubmit={(e) => {
                e.preventDefault();
                onSearchClick();
              }}>
            <div className="form-row">
                <label>시도</label>
                <select className="pmp4-select" onChange={(e) => setSelectedSido(e.target.value)}>
                  <option value="">시/도 선택</option>
                  {sidoList.map((sido) => (
                    <option key={sido} value={sido}>{sido}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>시군구</label>
                <select className="pmp4-select" onChange={(e) => setSelectedSigungu(e.target.value)} disabled={!selectedSido}>
                  <option value="">시/군/구 선택</option>
                  {sigunguList.map((sigungu) => (
                    <option key={sigungu} value={sigungu}>{sigungu}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>읍/면/동</label>
                <select className="pmp4-select" onChange={(e) => setSelectedEmd(e.target.value)} disabled={emdList.length === 0}>
                  <option value="">읍/면/동 선택</option>
                  {emdList.map((emd) => (
                    <option key={emd} value={emd}>{emd}</option>
                  ))}
                </select>
              </div>

            <div className="form-row">
              <label>도로명</label>
              <select
                className="pmp4-select"
                onChange={(e) => setSelectedRoad(e.target.value)}
                disabled={!selectedEmd}
              >
                <option value="">도로명 선택</option>
                {roadList.map((road) => (
                  <option key={road} value={road}>{road}</option>
                ))}
              </select>
            </div>

            <RangeInput label="위험도 수준" setMin={setDangerMin} setMax={setDangerMax} minLimit={0} maxLimit={10}/>
            <RangeInput label="깊이" setMin={setDepthMin} setMax={setDepthMax} minLimit={0} maxLimit={100}/>
            <RangeInput label="너비" setMin={setWidthMin} setMax={setWidthMax} minLimit={0} maxLimit={100}/>

            <button type="submit" className="pmp4-configm-btn">검색</button>
          </form>
          </div>
        </div>          
        <div className="pmp4-maparea">
          <div className="pmp4-mapbg">
            <MapPage ref={mapPageRef}/>
          </div>
        </div>
      </div>
      <div className="pmp4-footer">2025 Capstone Design</div>
    </div>
  );
}

export default PotholeMapPage;