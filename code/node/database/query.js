// 시/도 목록 조회
const getSidoList = () => {
    return `SELECT DISTINCT roadname_sido FROM roadname ORDER BY roadname_sido`;
};

// 시/군/구 목록 조회
const getSigunguList = (sido) => {
    return {
        sql : `SELECT DISTINCT roadname_sigungu FROM roadname WHERE roadname_sido = ? ORDER BY roadname_sigungu`,
    values: [sido],
    };
};

// 읍/면/동 목록 조회
const getEmdList = (sido, sigungu) => {
    return {
        sql : `SELECT DISTINCT roadname_emd FROM roadname WHERE roadname_sido = ? AND roadname_sigungu = ? ORDER BY roadname_emd`,
        values: [sido, sigungu],
    };
}

// 읍/면/동 목록 조회 (시/도만 선택된 경우)
const getEmdListBySido = (sido) => {
    return {
        sql : `SELECT DISTINCT roadname_emd FROM roadname WHERE roadname_sido = ? ORDER BY roadname_emd`,
        values: [sido],
    };
}

// 도로명 목록 조회
const getRoadnameList = (sido, sigungu, emd) => {
    return {
        sql : `SELECT DISTINCT roadname_roadname FROM roadname WHERE roadname_sido = ? AND roadname_sigungu = ? AND roadname_emd = ? ORDER BY roadname_roadname`,
        values: [sido, sigungu, emd],
    };
}

// 도로명 목록 조회 (시/도, 읍/면/동만 선택된 경우)
const getRoadnameListbyEmd = (sido, emd) => {
    return {
        sql : `SELECT DISTINCT roadname_roadname FROM roadname WHERE roadname_sido = ? AND roadname_emd = ? ORDER BY roadname_roadname`,
        values: [sido, emd],
    };
}

// 포트홀 위,경도 조회
const getPotholeLocation = (filters = {}) => {
    let sql = `SELECT p.pothole_latitude AS x, p.pothole_longitude AS y FROM (pothole p INNER JOIN road r ON p.road_id = r.road_id) INNER JOIN roadname n ON r.roadname_id = n.roadname_id WHERE 1=1`;
    const values = [];

    if (filters.sido) {
        sql += ` AND n.roadname_sido = ?`;
        values.push(filters.sido);
    }

    if (filters.sigungu) {
        sql += ` AND n.roadname_sigungu = ?`;
        values.push(filters.sigungu);
    }

    if (filters.emd) {
        sql += ` AND n.roadname_emd = ?`;
        values.push(filters.emd);
    }

    if (filters.roadname) {
        sql += ` AND n.roadname_roadname = ?`;
        values.push(filters.roadname);
    }

    if (filters.depthMin && filters.depthMax) {
        sql += ` AND p.pothole_depth BETWEEN ? AND ?`;
        values.push(filters.depthMin, filters.depthMax);
    }

    if (filters.widthMin && filters.widthMax) {
        sql += ` AND p.pothole_width BETWEEN ? AND ?`;
        values.push(filters.widthMin, filters.widthMax);
    }

    if (filters.dangerMin && filters.dangerMax) {
        sql += ` AND r.road_danger BETWEEN ? AND ?`;
        values.push(filters.dangerMin, filters.dangerMax);
    }

    return { sql, values };
}

const getRoadSearch = () => {
    return `SELECT n.roadname_roadname, r.road_count, r.road_danger, r.road_lastdate, r.road_lastfixdate, r.road_state FROM roadname n INNER JOIN road r ON n.roadname_id = r.roadname_id ORDER BY r.roadname_id`;
};

module.exports = {
  getSidoList,
  getSigunguList,
  getEmdList,
  getEmdListBySido,
  getRoadnameList,
  getRoadnameListbyEmd,
  getPotholeLocation,
  getRoadSearch
};