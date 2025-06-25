#flask_camera_capture.py

import cv2
import time
import requests
from flask_yolo import detect_pothole

def generate_frames(camera_index=1):
    camera = cv2.VideoCapture(camera_index)

    if not camera.isOpened():
        print(f"[❌ 오류] 카메라(index={camera_index}) 열기 실패")
        return

    print(f"[✅ 카메라 연결됨] 카메라 index={camera_index} 로 실시간 스트리밍 시작")

    frame_count = 0

    while True:
        success, frame = camera.read()
        if not success:
            print(f"[⚠️ 프레임 오류] 프레임 #{frame_count + 1} 읽기 실패")
            continue

        frame_count += 1
        print(f"[📸 프레임 #{frame_count}] 프레임 읽음 및 처리 중...")

        # 프레임 저장 (YOLO는 파일 경로로 감지 수행)
        temp_path = './images/live_frame.jpg'
        cv2.imwrite(temp_path, frame)

        # 포트홀 감지
        is_detected = detect_pothole(temp_path)
        if is_detected:
            print(f"[🚧 포트홀 감지됨] 프레임 #{frame_count} → 서버로 전송 시도 중...", flush=True)
            try:
                res = requests.post("http://127.0.0.1:5000/auto-detect", json={"image_path": temp_path})
                if res.status_code == 200:
                    print(f"[✅ 전송 성공] /auto-detect에 포트홀 정보 전송 완료", flush=True)
                else:
                    print(f"[❌ 전송 실패] 상태 코드: {res.status_code}", flush=True)
                time.sleep(5)  # 중복 방지를 위해 대기
            except Exception as e:
                print(f"[⚠️ 전송 중 오류] {e}")
        else:
            print(f"[✔️ 포트홀 없음] 프레임 #{frame_count} 처리 완료", flush=True)

        # 클라이언트에 프레임 스트리밍
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
