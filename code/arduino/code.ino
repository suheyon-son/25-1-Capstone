// 아두이노 통합 코드
// 모터 제어 + 적외선 거리 센서 + GPS + 시리얼 통신

#include <TinyGPS++.h>
#include <SoftwareSerial.h>

// 모터 제어 핀
const int IN1 = 6;
const int IN2 = 7;
const int IN3 = 8;
const int IN4 = 9;
const int ENA = 10;
const int ENB = 11;

// 적외선 거리 센서 핀
const int irPins[3] = {A0, A1, A2};  // 센서 1, 2, 3

// GPS 모듈 핀
const int GPS_RX = 4;  // 아두이노의 RX (GPS TX에 연결)
const int GPS_TX = 3;  // 아두이노의 TX (GPS RX에 연결)

// 변수 설정
int baseSpeed = 255;        // 직진 속도
int turnOffset = 100;       // 회전 시 속도 차이

TinyGPSPlus gps;
SoftwareSerial gpsSerial(GPS_RX, GPS_TX);

// 거리 측정 제어 변수
bool shouldMeasure = false;

// 초기 설정
void setup() {
  Serial.begin(9600);
  gpsSerial.begin(9600);

  // 모터 핀 설정
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);

  stopMotors();
}

// 메인 루프
void loop() {
  // GPS 처리
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }

  // 명령 수신 처리
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    handleCommand(command);
  }

  // 측정 명령이 들어온 경우 실행
  if (shouldMeasure) {
    shouldMeasure = false;
    readAndSendDistances();
  }
}

float smoothRead(int pin) {
  const int N = 5;
  float sum = 0;
  for (int i = 0; i < N; i++) {
    sum += voltToCm(analogRead(pin));
    delay(5);  // 약간의 딜레이로 안정화
  }
  return sum / N;
}

float voltToCm(int raw) {
  float voltage = raw * (5.0 / 1023.0);
  return 65 * pow(voltage, -1.10);
}
// 거리 측정 함수
void readAndSendDistances() {
  const int samples = 50;
  const int delayMs = 100;
  float distances[3];

  for (int i = 0; i < samples; i++) {
    for (int j = 0; j < 3; j++) {
      distances[j] = voltToCm(analogRead(irPins[j]));  // 딱 1회 측정만
    }

    Serial.print(distances[0], 1);
    Serial.print(",");
    Serial.print(distances[1], 1);
    Serial.print(",");
    Serial.println(distances[2], 1);

    delay(delayMs);  // 초당 10회
  }
}

// 명령 처리 함수
void handleCommand(String cmd) {
  cmd.toUpperCase();

  if (cmd == "MEASURE") {
    shouldMeasure = true;
  } else if (cmd == "GO") {
    goForward(baseSpeed, baseSpeed);
    Serial.println("▶ 전진 시작");
  } else if (cmd == "LEFT") {
    goForward(baseSpeed, baseSpeed + turnOffset);
    Serial.println("↰ 좌회전");
  } else if (cmd == "RIGHT") {
    goForward(baseSpeed + turnOffset, baseSpeed);
    Serial.println("↱ 우회전");
  } else if (cmd == "STOP") {
    stopMotors();
    Serial.println("■ 정지");
  } else if (cmd == "GPS") {
    sendGPSData();
  } else {
    Serial.println("⚠️ 알 수 없는 명령어입니다.");
  }
}

// 모터 제어 함수
void goForward(int leftSpeed, int rightSpeed) {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);

  analogWrite(ENA, constrain(leftSpeed, 0, 255));
  analogWrite(ENB, constrain(rightSpeed, 0, 255));
}

void stopMotors() {
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
}

// GPS 데이터 전송 함수
void sendGPSData() {
  if (gps.location.isValid()) {
    Serial.print("LAT:");
    Serial.print(gps.location.lat(), 6);
    Serial.print(", LNG:");
    Serial.println(gps.location.lng(), 6);
  } else {
    Serial.println("GPS 데이터 없음");
  }
}
