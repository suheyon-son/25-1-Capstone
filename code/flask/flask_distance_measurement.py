def calculate_depth_width(sensor_data, base_height_cm=25, sensor_spacing_cm=5):
    max_depth = 0.0
    pothole_flags = []

    for i in range(len(sensor_data[0])):
        depths = []

        for j in range(3):
            val = sensor_data[j][i]
            # 25cm 이하인 값은 무시
            if val > base_height_cm:
                depth = val - base_height_cm  # 25 초과면 깊이 계산
            else:
                depth = 0.0  # 25 이하이면 깊이 0으로 무시

            depths.append(depth)

        # 너비 계산 기준: 깊이 1cm 이상인 시점
        is_pothole_for_width = any(d >= 1 for d in depths)
        pothole_flags.append(is_pothole_for_width)

        max_depth = max(max_depth, max(depths))

    # 너비 계산 (연속된 True 구간 길이 * 센서 간 거리)
    width_count = 0
    current_width = 0
    for flag in pothole_flags:
        if flag:
            current_width += 1
        else:
            width_count = max(width_count, current_width)
            current_width = 0
    width_count = max(width_count, current_width)

    width_cm = width_count * sensor_spacing_cm

    pothole_detected = max_depth >= 2.5

    if not pothole_detected:
        return {
            "message": "포트홀 감지되지 않음",
            "max_depth_cm": 0.0,
            "width_cm": 0.0,
            "sample_count": len(sensor_data[0]),
            "threshold_info": "2.5cm 이상을 포트홀로 간주 (측정 거리 25cm 이하 무시됨)"
        }

    return {
        "message": "포트홀 감지됨",
        "max_depth_cm": round(max_depth, 2),
        "width_cm": round(width_cm, 2),
        "sample_count": len(sensor_data[0]),
        "threshold_info": "2.5cm 이상을 포트홀로 간주 (측정 거리 25cm 이하 무시됨)"
    }
