const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const specialCities = {
  '서울': '특별시',
  '부산': '광역시',
  '대구': '광역시',
  '인천': '광역시',
  '광주': '광역시',
  '대전': '광역시',
  '울산': '광역시',
  '세종': '특별자치시',
  '제주': '특별자치도',
};

function fixSidoName(addressName) {
  if (!addressName) return null;

  const firstWord = addressName.split(' ')[0];

  for (const city of Object.keys(specialCities)) {
    const fullName = city + specialCities[city];
    if (firstWord === fullName) {
      return addressName;
    }
  }

  const sido = firstWord.replace(/(특별시|광역시|특별자치도|특별자치시)/g, '');

  if (specialCities[sido]) {
    const fixedSido = sido + specialCities[sido];
    return addressName.replace(firstWord, fixedSido);
  }

  return addressName;
}

async function getRoadAddress(longitude, latitude) {
  try {
    const response = await axios.get('https://dapi.kakao.com/v2/local/geo/coord2address.json', {
      params: {
        x: longitude,
        y: latitude,
      },
      headers: { Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}` },
    });

    const document = response.data.documents[0];

    let roadAddress = document?.road_address?.address_name || null;
    let jibunAddress = document?.address?.address_name || null;

    roadAddress = fixSidoName(roadAddress);
    jibunAddress = fixSidoName(jibunAddress);

    return { roadAddress, jibunAddress };
  } catch (error) {
    console.error('주소 변환 오류:', error.message);
    return { roadAddress: null, jibunAddress: null };
  }
}

module.exports = { getRoadAddress };