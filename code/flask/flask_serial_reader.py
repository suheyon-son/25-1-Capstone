# flask_serial_reader.py

import serial
import time

# 빈 배열 100칸 초기화
arr1 = [0.0] * 50
arr2 = [0.0] * 50
arr3 = [0.0] * 50
current_index = 0  # 지금까지 몇 개를 저장했는지

def read_distance_data(ser):
    try:
        ser.write(b'MEASURE\n')
        line = ser.readline().decode().strip()
        print(f"[→ 수신] {line}")
        if line:
            return [float(val) for val in line.split(',')]
    except Exception as e:
        print("[X] 시리얼 통신 실패:", e)
    return []