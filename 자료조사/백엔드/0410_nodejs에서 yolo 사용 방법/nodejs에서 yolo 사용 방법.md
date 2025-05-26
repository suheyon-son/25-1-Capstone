# nodejs에서 yolo 사용 방법

## python을 직접 실행시키고, yolo라이브러리 쓰기
https://nodejs.org/api/child_process.html<br>
https://docs.ultralytics.com/quickstart/#use-ultralytics-with-cli<br>
지원 체크 안됨, 성능 조사 안됨<br>

## python-shell 라이브러리 사용하고, yolo라이브러리 쓰기
https://www.npmjs.com/package/python-shell<br>
https://docs.ultralytics.com/quickstart/#use-ultralytics-with-cli<br>
지원 체크 안됨, 성능 조사 안됨<br>

## nodejs라이브러리를 사용하기
https://www.npmjs.com/package/@vapi/node-yolo?activeTab=readme<br>
지원 체크 안됨, 성능 조사 안됨<br>

## gyp를 이용해서 직접 native 라이브러리 만들고, C++ yolo라이브러리 쓰기
구버전은 C++기반으로 작성되어 있으나<br>
https://github.com/AlexeyAB/darknet<br>
최신 버전은 PyTorch프레임워크 기반으로 작성되어 있다.<br>
https://github.com/ultralytics/ultralytics<br>
지원 체크 안됨, 성능 조사 안됨<br>

## onnx라이브러리를 통해 yolo활용하기
https://docs.ultralytics.com/ko/guides/model-deployment-options/#pytorch<br>
Windows는 CUDA지원이 안된다.<br>
https://www.npmjs.com/package/onnxruntime-node<br>
지원 체크 안됨, 성능 조사 안됨<br>

