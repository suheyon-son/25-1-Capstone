# flask_send_image.py

import os
import requests

IMAGE_DIR = './images'
UPLOAD_URL = 'https://suhyeon.xyz/api/uploads'  # 실제 주소로 바꾸세요

def get_latest_png():
    png_files = [f for f in os.listdir(IMAGE_DIR) if f.lower().endswith('.png')]
    if not png_files:
        return None
    png_paths = [os.path.join(IMAGE_DIR, f) for f in png_files]
    png_paths.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    return png_paths[0]

def send_latest_image():
    filepath = get_latest_png()
    if filepath:
        print(f"📤 전송할 파일: {filepath}")
        filename = os.path.basename(filepath)
        with open(filepath, 'rb') as img_file:
            files = {'file': (filename, img_file, 'image/png')}
            try:
                response = requests.post(UPLOAD_URL, files=files)
                if response.status_code == 200:
                    print(f'✅ {filename} 전송 성공')
                    return True
                else:
                    print(f'❌ {filename} 전송 실패: {response.status_code}')
                    return False
            except Exception as e:
                print(f'⚠️ {filename} 전송 중 오류: {e}')
                return False
    else:
        print("❗ PNG 파일이 없습니다.")
        return False
