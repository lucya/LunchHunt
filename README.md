# 🍽️ LunchHunt - 점심 메뉴 추천 게임

구글 AI를 활용한 인터랙티브 점심 메뉴 추천 웹 애플리케이션

## 📋 프로젝트 개요

LunchHunt는 사용자의 기분, 날씨, 선호도를 바탕으로 AI가 개인맞춤형 점심 메뉴를 추천해주는 게임형 웹 애플리케이션입니다.

## 🎯 주요 기능

- **AI 기반 메뉴 추천**: Google Gemini AI를 활용한 개인화된 음식 추천
- **인터랙티브 게임**: 질문 답변을 통한 재미있는 추천 과정
- **다양한 필터링**: 음식 종류, 가격대, 거리, 알레르기 등
- **시각적 결과**: 음식 이미지와 상세 정보 제공
- **히스토리 기능**: 이전 추천 결과 저장 및 관리

## 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **State Management**: React Hooks (useState, useContext)
- **Build Tool**: Vite
- **Deployment**: Vercel/Netlify

## 📁 프로젝트 구조

```
LunchHunt/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── game/
│   │   └── result/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── App.tsx
├── .env.example
├── package.json
└── README.md
```

## 🚀 시작하기

### 1. API 키 설정

#### Gemini AI API

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키를 발급받습니다

#### 네이버맵 API (위치 정확도 향상)

1. [네이버 클라우드 플랫폼](https://www.ncloud.com/product/applicationService/maps)에서 계정 생성
2. Maps API 신청 및 애플리케이션 등록
3. Client ID와 Client Secret 발급

#### 네이버 검색 API (실제 음식점 검색)

1. [네이버 개발자 센터](https://developers.naver.com/main/)에서 애플리케이션 등록
2. 검색 API 서비스 추가
3. Client ID와 Client Secret 발급

#### 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음과 같이 설정합니다:

```bash
# .env.local
# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Naver Map API (선택사항 - 위치 정확도 향상)
VITE_NAVER_MAP_CLIENT_ID=your_naver_map_client_id_here
VITE_NAVER_MAP_CLIENT_SECRET=your_naver_map_client_secret_here

# Naver Search API (실제 음식점 검색)
VITE_NAVER_CLIENT_ID=your_naver_search_client_id_here
VITE_NAVER_CLIENT_SECRET=your_naver_search_client_secret_here
```

### 2. 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 3. 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📋 요구사항

자세한 요구사항은 `REQUIREMENTS.md` 파일을 참조하세요.
