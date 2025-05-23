var mapOptions = {
    center: new naver.maps.LatLng(35.95, 128.25),
    zoom: 6
};
var map = new naver.maps.Map('map', mapOptions);




const createMarker = (x, y) => {
    var position = new naver.maps.LatLng(x, y);

    var markerOptions = {
        position: position,
        map: map,
        icon: {
            url: './img/pin_default.png',
            size: new naver.maps.Size(22, 35),
            origin: new naver.maps.Point(0, 0),
            anchor: new naver.maps.Point(11, 35)
        }
    };

    var marker = new naver.maps.Marker(markerOptions);
};

const run = async () => {
    const response = await fetch('/api');
    const data = await response.json();
    console.log(data);
    data.forEach((item) => {
        createMarker(item.x, item.y);
    });
}


run();
