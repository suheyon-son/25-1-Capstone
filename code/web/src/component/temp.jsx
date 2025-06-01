import React, { useState } from 'react';
import axios from 'axios';

const Temp = () => {
  const [file, setFile] = useState(null);
  const [depth, setDepth] = useState('');
  const [width, setWidth] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [date, setDate] = useState('');

  const handleUpload = async () => {
    if (!file) {
      alert('파일을 선택하세요.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('pothole_depth', depth);
    formData.append('pothole_width', width);
    formData.append('pothole_latitude', lat);
    formData.append('pothole_longitude', lng);
    formData.append('pothole_date', date);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('업로드 성공!');
    } catch (err) {
      if (err.response) {
        // 서버에서 에러 응답을 보냈을 경우
        alert(`오류: ${err.response.data.error}`);
      } else {
        // 네트워크 문제 또는 서버 자체 에러
        alert('서버 통신 중 오류가 발생했습니다.');
      }
      console.error('업로드 실패:', err);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input type="text" placeholder="깊이" value={depth} onChange={(e) => setDepth(e.target.value)} />
      <input type="text" placeholder="너비" value={width} onChange={(e) => setWidth(e.target.value)} />
      <input type="text" placeholder="위도" value={lat} onChange={(e) => setLat(e.target.value)} />
      <input type="text" placeholder="경도" value={lng} onChange={(e) => setLng(e.target.value)} />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={handleUpload}>업로드</button>
    </div>
  );
};

export default Temp;
