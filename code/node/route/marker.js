const createMarker = (lat, lng) => {
    const position = new naver.maps.LatLng(lat, lng);

    const markerOptions = {
        position: position,
        map: map,
        icon: {
            url: '/img/pin_default.png',
            size: new naver.maps.Size(22, 35),
            origin: new naver.maps.Point(0, 0),
            anchor: new naver.maps.Point(11, 35)
        }
    };

    new naver.maps.Marker(markerOptions);
};

const map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(35.95, 128.25),
    zoom: 6,
    zoomControl: true,
    minZoom: 7,
    maxZoom: 15,
    zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT
    }
});

const loadPotholeMarkers = async () => {
    try {
        const response = await fetch('/api/pothole-location');
        const data = await response.json();

        data.forEach(({ x, y }) => {
            createMarker(x, y);
        });
    } catch (error) {
        console.error('포트홀 데이터 가져오기 실패:', error);
    }
};

loadPotholeMarkers();