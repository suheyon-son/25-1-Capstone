from ultralytics import YOLO
import cv2

model = YOLO('best.pt')

def detect_pothole(image_path, output_path=None):
    results = model(image_path)
    labels = results[0].names
    detected_classes = results[0].boxes.cls.tolist()
    boxes = results[0].boxes.xyxy.tolist()  # 바운딩 박스 좌표 (xmin, ymin, xmax, ymax)
    
    pothole_class_id = 0
    pothole_detected = any(cls == pothole_class_id for cls in detected_classes)

    # 이미지에 바운딩 박스 그리기
    if pothole_detected:
        img = cv2.imread(image_path)
        for cls, box in zip(detected_classes, boxes):
            if cls == pothole_class_id:
                xmin, ymin, xmax, ymax = map(int, box)
                # 녹색 사각형 그리기
                cv2.rectangle(img, (xmin, ymin), (xmax, ymax), (0, 255, 0), 2)
                # 텍스트(클래스명) 추가
                cv2.putText(img, labels[int(cls)], (xmin, ymin - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0,255,0), 2)
        
        if output_path:
            cv2.imwrite(output_path, img)  # 결과 이미지 저장
        else:
            # 이미지 윈도우에 출력 (필요하면)
            cv2.imshow('Detected Potholes', img)
            cv2.waitKey(0)
            cv2.destroyAllWindows()
    return pothole_detected
