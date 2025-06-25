# flask_gps.py

import serial
import requests
import re

ser = serial.Serial('COM5', 9600)
server_url = 'http://127.0.0.1:5000/gps'
pattern = re.compile(r'LAT:([-\d.]+),LNG:([-\d.]+)')

while True:
    line = ser.readline().decode('utf-8').strip()
    match = pattern.match(line)
    if match:
        lat, lng = match.groups()
        data = {'lat': float(lat), 'lng': float(lng)}
        try:
            response = requests.post(server_url, json=data)
            print(f"서버 응답: {response.status_code}, 데이터: {data}")
        except Exception as e:
            print(f"전송 실패: {e}")
