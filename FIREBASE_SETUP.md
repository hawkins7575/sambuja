# Firebase 설정 가이드

삼부자 가족 웹사이트에서 Firebase를 사용하기 위한 설정 가이드입니다.

## 1. Firebase 프로젝트 생성

1. [Firebase 콘솔](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `sambuja-family` (또는 원하는 이름)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

## 2. 웹 앱 등록

1. Firebase 프로젝트 콘솔에서 "웹" 아이콘 (</>)을 클릭
2. 앱 닉네임: `삼부자 가족 사이트`
3. Firebase SDK 설정 코드에서 config 객체 값들을 복사

## 3. Firestore 데이터베이스 설정

1. 좌측 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. 보안 규칙 모드: "테스트 모드에서 시작" 선택 (개발용)
4. 위치: `asia-northeast3 (서울)` 선택

## 4. 환경 변수 설정

`.env.local` 파일에 Firebase 설정값을 입력하세요:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 설정값 찾는 방법:

1. Firebase 콘솔 → 프로젝트 설정 (⚙️ 아이콘)
2. "내 앱" 섹션에서 웹 앱 선택
3. "Firebase SDK 스니펫" → "구성" 선택
4. config 객체의 각 값들을 위 환경 변수에 복사

## 5. Firestore 보안 규칙 (개발용)

Firestore 데이터베이스 → 규칙 탭에서 다음 규칙으로 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 개발 중에는 모든 읽기/쓰기 허용
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **주의**: 이는 개발용 규칙입니다. 프로덕션 환경에서는 적절한 보안 규칙을 설정해야 합니다.

## 6. 컬렉션 구조

앱에서 사용하는 Firestore 컬렉션들:

- `users` - 사용자 정보
- `posts` - 소통 게시글
- `comments` - 댓글
- `events` - 일정
- `goals` - 목표
- `helpRequests` - 도움 요청

## 7. 앱 실행

환경 변수 설정 후 앱을 재시작하면 Firebase 데이터베이스가 연동됩니다.

```bash
npm run dev
```

## 트러블슈팅

### Firebase 초기화 오류
- `.env.local` 파일의 환경 변수가 정확한지 확인
- 프로젝트 ID가 실제 Firebase 프로젝트와 일치하는지 확인

### Firestore 권한 오류
- Firestore 보안 규칙이 개발 모드로 설정되어 있는지 확인
- Firebase 프로젝트가 활성화 상태인지 확인

### 데이터가 표시되지 않음
- 브라우저 개발자 도구의 콘솔에서 에러 확인
- Firebase 콘솔에서 데이터가 올바르게 저장되었는지 확인