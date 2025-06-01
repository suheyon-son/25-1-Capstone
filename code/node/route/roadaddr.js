const axios = require('axios');

function fixSidoName(address) {
  if (!address) return null;
  const firstWord = address.split(' ')[0];
  const REGION_MAP = {
    '서울': { full: '서울특별시' },
    '부산': { full: '부산광역시' },
    '대구': { full: '대구광역시' },
    '인천': { full: '인천광역시' },
    '광주': { full: '광주광역시' },
    '대전': { full: '대전광역시' },
    '울산': { full: '울산광역시' },
    '세종': { full: '세종특별자치시' },
    '경기': { full: '경기도' },
    '강원': { full: '강원특별자치도' },
    '충북': { full: '충청북도' },
    '충남': { full: '충청남도' },
    '전북': { full: '전라북도' },
    '전남': { full: '전라남도' },
    '경북': { full: '경상북도' },
    '경남': { full: '경상남도' },
    '제주': { full: '제주특별자치도' },
  };

  for (const short in REGION_MAP) {
    if (firstWord === REGION_MAP[short].full) return address;
    if (firstWord === short) {
      return address.replace(firstWord, REGION_MAP[short].full);
    }
  }
  return address;
}

function getRoadAddress(longitude, latitude) {
  return axios
    .get('https://dapi.kakao.com/v2/local/geo/coord2address.json', {
      params: { x: longitude, y: latitude },
      headers: { Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}` },
    })
    .then(res => {
      const doc = res.data.documents[0] || {};
      const roadAddress = fixSidoName(doc.road_address?.address_name);
      const jibunAddress = fixSidoName(doc.address?.address_name);
      return { roadAddress, jibunAddress };
    });
}

module.exports = { getRoadAddress };