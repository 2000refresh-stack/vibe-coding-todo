# 할일 관리 앱 (Todo App)

Firebase Realtime Database를 사용한 할일 관리 웹 애플리케이션입니다.

## 🚀 주요 기능

- ✅ 할일 추가
- ✏️ 할일 수정
- 🗑️ 할일 삭제
- ☑️ 완료 상태 토글
- 🔍 필터링 (전체/진행중/완료)
- 🧹 완료된 항목 일괄 삭제
- 🔄 실시간 동기화 (Firebase Realtime Database)

## 🛠️ 기술 스택

- **HTML5** - 구조
- **CSS3** - 스타일링 (그라데이션, 반응형 디자인)
- **JavaScript (ES6 Modules)** - 로직
- **Firebase Realtime Database** - 클라우드 데이터베이스

## 📁 프로젝트 구조

```
todo-firebase/
├── index.html      # HTML 구조
├── styles.css      # 스타일시트
├── app.js          # Firebase 초기화
├── script.js       # 할일 앱 로직
└── README.md       # 프로젝트 설명
```

## 🔧 설정 방법

### 1. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **Realtime Database** 생성
4. Firebase 구성 정보를 `app.js`에 입력:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "YOUR_DATABASE_URL"
};
```

### 2. 보안 규칙 설정

Firebase Console → Realtime Database → 규칙 탭에서 다음 규칙을 설정:

**개발/테스트용 (모든 사용자 읽기/쓰기 허용):**
```json
{
  "rules": {
    "todos": {
      ".read": true,
      ".write": true
    }
  }
}
```

**프로덕션용 (인증 사용자만 허용):**
```json
{
  "rules": {
    "todos": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## 🚀 실행 방법

### 로컬 서버 실행 (권장)

ES6 모듈을 사용하기 때문에 로컬 서버가 필요합니다.

**방법 1: Python 사용**
```bash
python -m http.server 8000
```

**방법 2: Node.js 사용**
```bash
npx serve
```

**방법 3: VS Code Live Server**
- VS Code에서 Live Server 확장 프로그램 사용

브라우저에서 `http://localhost:8000` 접속

### 파일 직접 열기

일부 브라우저에서는 직접 파일 열기도 가능하지만, 모듈 로딩 오류가 발생할 수 있습니다.

## 📱 사용 방법

1. **할일 추가**: 입력 필드에 할일을 입력하고 "추가" 버튼을 클릭하거나 Enter 키를 누릅니다.
2. **할일 완료**: 체크박스를 클릭하여 완료 상태를 변경합니다.
3. **할일 수정**: "수정" 버튼을 클릭하여 내용을 변경합니다.
4. **할일 삭제**: "삭제" 버튼을 클릭하여 할일을 삭제합니다.
5. **필터링**: 상단의 필터 버튼(전체/진행중/완료)으로 목록을 필터링합니다.
6. **완료된 항목 삭제**: 하단의 "완료된 항목 삭제" 버튼으로 한 번에 삭제합니다.

## ✨ 특징

- **실시간 동기화**: Firebase Realtime Database를 통해 여러 기기에서 동시에 사용 가능
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원
- **아름다운 UI**: 그라데이션 배경과 부드러운 애니메이션
- **에러 처리**: 네트워크 오류 및 권한 오류에 대한 상세한 처리
- **연결 상태 표시**: Firebase 연결 상태를 실시간으로 확인 가능

## 🔍 연결 상태 확인

페이지 상단에 Firebase 연결 상태가 표시됩니다:
- 🟠 주황: 연결 확인 중
- 🟢 초록: 연결 성공
- 🔴 빨강: 연결 실패

브라우저 개발자 도구(F12) 콘솔에서도 상세한 로그를 확인할 수 있습니다.

## 🐛 문제 해결

### Firebase 연결 실패
- Firebase 설정 정보 확인
- 인터넷 연결 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 권한 오류
- Firebase Console에서 보안 규칙 확인
- 데이터베이스 URL이 올바른지 확인

### 데이터가 보이지 않음
- Firebase Console에서 데이터베이스에 데이터가 있는지 확인
- 브라우저 콘솔 로그 확인

## 📄 라이선스

이 프로젝트는 오픈 소스로 자유롭게 사용할 수 있습니다.

## 👨‍💻 작성자

[2000refresh-stack](https://github.com/2000refresh-stack)

