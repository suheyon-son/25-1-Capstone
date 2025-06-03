// 공통: DISTINCT 조회 쿼리 생성기
const getDistinctList = ({ column, conditions = [] }) => {
  const whereClause = conditions.map(c => `${c.column} = ?`).join(' AND ');
  const values = conditions.map(c => c.value);
  const sql = `SELECT DISTINCT ${column} FROM roadname${whereClause ? ` WHERE ${whereClause}` : ''} ORDER BY ${column}`;
  return { sql, values };
};

// 시/도 목록 조회
const getSidoList = () => getDistinctList({ column: 'roadname_sido' });

// 시/군/구 목록 조회
const getSigunguList = (sido) =>
  getDistinctList({
    column: 'roadname_sigungu',
    conditions: [{ column: 'roadname_sido', value: sido }],
  });

// 읍/면/동 목록 조회
const getEmdList = (sido, sigungu) =>
  getDistinctList({
    column: 'roadname_emd',
    conditions: [
      { column: 'roadname_sido', value: sido },
      { column: 'roadname_sigungu', value: sigungu },
    ],
  });

// 읍/면/동 (시/도만 있을 때)
const getEmdListBySido = (sido) =>
  getDistinctList({
    column: 'roadname_emd',
    conditions: [{ column: 'roadname_sido', value: sido }],
  });

// 도로명 조회
const getRoadnameList = (sido, sigungu, emd) =>
  getDistinctList({
    column: 'roadname_roadname',
    conditions: [
      { column: 'roadname_sido', value: sido },
      { column: 'roadname_sigungu', value: sigungu },
      { column: 'roadname_emd', value: emd },
    ],
  });

// 도로명 (시/도 + 읍/면/동)
const getRoadnameListbyEmd = (sido, emd) =>
  getDistinctList({
    column: 'roadname_roadname',
    conditions: [
      { column: 'roadname_sido', value: sido },
      { column: 'roadname_emd', value: emd },
    ],
  });

// 조건부 WHERE 절 조립 유틸
const appendCondition = (sqlParts, values, condition, clause) => {
  if (condition !== undefined && condition !== null) {
    sqlParts.push(clause);
    if (Array.isArray(condition)) {
      values.push(...condition);
    } else {
      values.push(condition);
    }
  }
};

// 포트홀 위치 조회
const getPotholeLocation = (filters = {}) => {
  const sqlParts = [
    `SELECT p.pothole_latitude AS x, p.pothole_longitude AS y 
     FROM pothole p 
     INNER JOIN road r ON p.road_id = r.road_id 
     INNER JOIN roadname n ON r.roadname_id = n.roadname_id 
     WHERE 1=1`,
  ];
  const values = [];

  appendCondition(sqlParts, values, filters.sido, 'AND n.roadname_sido = ?');
  appendCondition(sqlParts, values, filters.sigungu, 'AND n.roadname_sigungu = ?');
  appendCondition(sqlParts, values, filters.emd, 'AND n.roadname_emd = ?');
  appendCondition(sqlParts, values, filters.roadname, 'AND n.roadname_roadname = ?');
  appendCondition(
    sqlParts,
    values,
    filters.depthMin && filters.depthMax ? [filters.depthMin, filters.depthMax] : null,
    'AND p.pothole_depth BETWEEN ? AND ?'
  );
  appendCondition(
    sqlParts,
    values,
    filters.widthMin && filters.widthMax ? [filters.widthMin, filters.widthMax] : null,
    'AND p.pothole_width BETWEEN ? AND ?'
  );
  appendCondition(
    sqlParts,
    values,
    filters.dangerMin && filters.dangerMax ? [filters.dangerMin, filters.dangerMax] : null,
    'AND r.road_danger BETWEEN ? AND ?'
  );

  return { sql: sqlParts.join(' '), values };
};

// 도로 검색 (도로 목록)
const getRoadSearch = () => ({
  sql: `SELECT n.roadname_roadname, r.road_count, r.road_danger, r.road_lastdate, r.road_lastfixdate, r.road_state, p.pothole_url
        FROM ( roadname n INNER JOIN road r ON n.roadname_id = r.roadname_id ) INNER JOIN pothole p ON r.road_id = p.road_id
        ORDER BY r.roadname_id`,
  values: [],
});

// 도로명 주소 파싱
const parseRoadAddress = (address) => {
  const [sido, sigungu, emd, roadname] = address.trim().split(' ');
  return { sido, sigungu, emd, roadname };
};

// 지번 주소 파싱
const parseJibunAddress = (address) => {
  const parts = address.trim().split(' ');
  const [sido, sigungu, emd, ...rest] = parts;
  const sanIndex = rest.indexOf('산');
  const filtered = sanIndex !== -1 ? rest.slice(0, sanIndex) : rest;
  const [jibun_other, ...nums] = filtered;
  const [main, sub = '0'] = (nums.join(' ').split('-'));
  return {
    sido, sigungu, emd,
    jibun_other,
    jibun_number: `${main}-${sub}`,
  };
};

// 도로 ID 찾기
const findRoadId = (roadAddress, jibunAddress) => {
  if (roadAddress) {
    const { sido, sigungu, emd, roadname } = parseRoadAddress(roadAddress);
    if (sido && sigungu && emd && roadname) {
      return {
        sql: `SELECT roadname_id FROM roadname 
              WHERE roadname_sido = ? AND roadname_sigungu = ? AND roadname_emd = ? AND roadname_roadname = ?`,
        values: [sido, sigungu, emd, roadname],
      };
    }
  }

  if (jibunAddress) {
    const { sido, sigungu, emd, jibun_other, jibun_number } = parseJibunAddress(jibunAddress);
    if (sido && sigungu && emd && jibun_other && jibun_number) {
      return {
        sql: `SELECT roadname_id FROM roadname 
              WHERE jibun_sido = ? AND jibun_sigungu = ? AND jibun_emd = ? 
              AND jibun_other = ? AND jibun_number = ?`,
        values: [sido, sigungu, emd, jibun_other, jibun_number],
      };
    }
  }

  return null;
};

// 도로 존재 확인
const checkExistingRoadByRoadnameId = (roadnameId) => ({
  sql: 'SELECT road_id FROM road WHERE roadname_id = ?',
  values: [roadnameId],
});

// 새 도로 삽입
const insertNewRoad = ({ roadnameId, date }) => ({
  sql: `INSERT INTO road 
        (roadname_id, road_lastdate, road_lastfixdate, road_danger, road_count, road_state)
        VALUES (?, ?, NULL, NULL, 1, 0)`,
  values: [roadnameId, date],
});

// 도로 카운트 증가
const updateRoadCount = ({ roadId, date }) => ({
  sql: `UPDATE road 
        SET road_count = road_count + 1, road_lastdate = ? 
        WHERE road_id = ?`,
  values: [date, roadId],
});

module.exports = {
  getDistinctList,
  getSidoList,
  getSigunguList,
  getEmdList,
  getEmdListBySido,
  getRoadnameList,
  getRoadnameListbyEmd,
  getPotholeLocation,
  getRoadSearch,
  findRoadId,
  checkExistingRoadByRoadnameId,
  insertNewRoad,
  updateRoadCount,
};