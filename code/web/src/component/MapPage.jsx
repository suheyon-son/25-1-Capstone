import { useEffect, useImperativeHandle, useRef, forwardRef, useState, use } from 'react';
import { handleSearch } from './handleSearch.jsx';

const MapPage = forwardRef((props, ref) => {
    const mapRef = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (!window.naver) return;

        mapRef.current = new window.naver.maps.Map('map', {
            center: new window.naver.maps.LatLng(35.95, 128.25),
            zoom: 6,
            zoomControl: true,
            minZoom: 6,
            maxZoom: 18,
            zoomControlOptions: {
                position: window.naver.maps.Position.TOP_RIGHT
            }
        });
    }, []);

    useImperativeHandle(ref, () => ({
        getMap: () => mapRef.current,
        createMarker,
        clearMarkers,
    }));

    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
    }

    const createMarker = (x, y, map = mapRef.current) => {
        const marker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(x, y),
            map,
            icon: {
                url: '/img/pin_default.png',
                size: new window.naver.maps.Size(22, 35),
                origin: new window.naver.maps.Point(0, 0),
                anchor: new window.naver.maps.Point(11, 35)
            },
        });
        markersRef.current.push(marker);
    };

    return <div id="map" style={{ width: '100%', height: '600px' }}/>;
});

export default MapPage;