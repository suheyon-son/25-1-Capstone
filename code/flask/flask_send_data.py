# flask_send_data.py

import requests
from datetime import datetime, timezone
import os

# 서버 설정
SERVER_URL = 'https://suhyeon.xyz/api/upload'


def send_data_to_server(image_path, depth, width, latitude, longitude, detected_time):
    # 날짜 → ISO 형식 (UTC)
    detected_time = datetime.now(timezone.utc).isoformat()

    with open(image_path, 'rb') as image_file:
        files = {
            'image': (os.path.basename(image_path), image_file, 'image/jpeg')
        }
        data = {
            'pothole_depth':     str(depth),
            'pothole_width':     str(width),
            'pothole_latitude':  str(latitude),
            'pothole_longitude': str(longitude),
            'pothole_date':      detected_time
        }

        print('[📤 전송할 데이터]')
        for k, v in data.items():
            print(f'{k}: {v}')

        try:
            response = requests.post(SERVER_URL, files=files, data=data)
            print(f'✅ 상태코드: {response.status_code}')
            print(f'📦 응답: {response.text}')
        except Exception as e:
            print('[❌ 전송 실패]', e)
