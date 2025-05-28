import axios from 'axios';

export const handleSearch = async ({ filters, mapInstance, createMarker, clearMarkers }) => {
    try {
        const response = await axios.get('http://localhost:8000/api/pothole-location', {
            params: filters,
        });
        
        const data = await response.data;

        if(typeof clearMarkers === 'function') clearMarkers();

        data.forEach(({ x, y }) => { createMarker(x, y, mapInstance) });
    } catch (error) {
        console.error('포트홀 데이터 가져오기 실패:', error);
    }
};