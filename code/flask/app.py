# app.py

from flask import Flask, render_template, Response, request, redirect, url_for, jsonify
from flask_camera_capture import generate_frames
from flask_yolo import detect_pothole
from flask_distance_measurement import calculate_depth_width
from flask_serial_reader import read_distance_data
import os
import cv2
import time
import requests
import threading
import serial
import json
from werkzeug.utils import secure_filename
from datetime import datetime
from flask_send_data import send_data_to_server

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 최근 GPS 좌표를 저장할 변수
detected_gps = {'lat': None, 'lng': None}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(camera_index=1),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# 이미지 수동 업로드 및 포트홀 탐지 결과 보기용 테스트 페이지
@app.route('/test', methods=['GET', 'POST'])
def test_image():
    if request.method == 'POST':
        if 'file' not in request.files:
            return '파일이 전송되지 않았습니다.', 400
        file = request.files['file']
        if file.filename == '':
            return '파일 이름이 없습니다.', 400
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            result = detect_pothole(filepath)
            return render_template('result.html', filename=filename, result=result)
    return '''
        <!doctype html>
        <title>포트홀 이미지 테스트</title>
        <h1>이미지 업로드 (png, jpg, jpeg)</h1>
        <form method=post enctype=multipart/form-data>
          <input type=file name=file>
          <input type=submit value=업로드>
        </form>
    '''

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return redirect(url_for('static', filename=f'uploads/{filename}'))

# 외부 GPS 모듈에서 위경도를 받아 저장하는 API
@app.route('/gps', methods=['POST'])
def receive_gps():
    data = request.get_json(force=True)
    detected_gps['lat'] = data['lat']
    detected_gps['lng'] = data['lng']
    print(f"[GPS 수신] 위도 {data['lat']}, 경도 {data['lng']}")
    return "OK"

# 거리 데이터 수신 및 깊이/너비 분석 (개별 요청 테스트용)
@app.route('/read-and-analyze', methods=['GET'])
def read_and_analyze():
    try:
        sensor_data = read_distance_data(port='COM5')  # 필요 시 포트 조정
        if not sensor_data:
            return jsonify({"error": "센서 데이터 없음"}), 400

        distance_input = [sensor_data]
        result = calculate_depth_width(distance_input, base_height=20.0, sampling_rate_hz=10, vehicle_speed_mps=1.0)
        return jsonify({"result": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 포트홀 자동 탐지 및 거리, GPS 포함 최종 전송 처리 API
@app.route('/auto-detect', methods=['POST'])
def auto_detect():
    print("[🚧 Flask] /auto-detect 요청 수신됨 → 아두이노에 측정 시작")
    distances = []

    try:
        with serial.Serial('COM5', 9600, timeout=1) as ser:
            for _ in range(50):
                reading = read_distance_data(ser)
                if reading:
                    distances.append(reading)

        if len(distances) >= 49:  # 1개 누락 대비
            sensor_data = list(map(list, zip(*distances)))
            result = calculate_depth_width(sensor_data, base_height_cm=25)

            print("📊 포트홀 분석 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))  # <-- 추가

            # 결과가 포트홀 감지된 경우만 서버 전송
            if result.get("max_depth_cm", 0) >= 2.5:
                # 위치 정보는 예시 값
                from flask_send_data import send_data_to_server
                image_path = 'C:/flask_test/venv/Scripts/images/live_frame.jpg'
                send_data_to_server(
                    image_path=image_path,
                    depth=result["max_depth_cm"],
                    width=result["width_cm"],
                    latitude=35.107688,  # 추후 GPS 연동 필요
                    longitude=126.895587,
                    detected_time=time.strftime("%Y-%m-%d %H:%M:%S")
                )

            return jsonify(result)
        else:
            return jsonify({"error": f"데이터 부족 (수신: {len(distances)}줄)"}), 400

    except Exception as e:
        print(f"[❌ 에러 발생] {e}")
        return jsonify({"error": f"시리얼 포트 열기 실패: {str(e)}"}), 500

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(host='0.0.0.0', port=5000, debug=True)
