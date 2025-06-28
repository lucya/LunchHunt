# 🍽️ LunchHunt

AI 기반 점심 메뉴 추천 서비스

## 🚀 기능

- **AI 추천**: Gemini AI가 기분, 음식 종류, 예산을 분석해서 맞춤 추천
- **실시간 검색**: 네이버 API를 통한 실제 운영중인 음식점 정보
- **위치 기반**: GPS를 활용한 주변 맛집 추천
- **실제 사진**: 네이버 이미지 검색으로 음식점 실제 사진 표시

## 🛠️ 기술 스택

**Frontend:**

- React + TypeScript
- Vite
- CSS-in-JS

**Backend:**

- Node.js + Express
- 네이버 검색 API
- Google Gemini AI

## 📋 환경 설정

### 1. 환경 변수 설정

`.env` 파일을 생성하고 다음 값들을 설정하세요:

```bash
# 네이버 API 키 (https://developers.naver.com/apps/)
VITE_NAVER_CLIENT_ID=your_naver_client_id_here
VITE_NAVER_CLIENT_SECRET=your_naver_client_secret_here

# Gemini AI API 키 (https://ai.google.dev/)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# 백엔드 서버 포트 (기본값: 3001)
PORT=3001
```

### 2. 의존성 설치

```bash
npm install
```

## 🏃‍♂️ 실행 방법

### 개발 환경

```bash
# 프론트엔드 + 백엔드 동시 실행
npm run dev

# 개별 실행
npm run dev:frontend  # Vite 개발 서버 (포트 5173)
npm run dev:backend   # Express 서버 (포트 3001)
```

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 🚀 배포

### Vercel 배포

1. Vercel 계정 연결
2. 환경 변수 설정
3. 자동 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### Docker 배포

```bash
# Docker 이미지 빌드
docker build -t lunchhunt .

# 컨테이너 실행
docker run -p 3001:3001 --env-file .env lunchhunt
```

### 일반 서버 배포

```bash
# 빌드
npm run build

# PM2로 실행 (권장)
pm2 start server.js --name lunchhunt

# 또는 직접 실행
NODE_ENV=production node server.js
```

## 📁 프로젝트 구조

```
LunchHunt/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── GamePage.tsx
│   ├── aiRecommender.ts     # Gemini AI 추천 로직
│   ├── naverMapService.ts   # 네이버 API 서비스
│   ├── constants.ts
│   └── main.tsx
├── server.js                # Express 백엔드 서버
├── Dockerfile
├── vercel.json
└── package.json
```

## 🔧 API 엔드포인트

### 백엔드 API

- `GET /api/health` - 서버 상태 확인
- `GET /api/naver/v1/search/local.json` - 네이버 로컬 검색
- `GET /api/naver/v1/search/image` - 네이버 이미지 검색
- `GET /api/naver/v1/map-reversegeocode/v2/gc` - 역지오코딩

## 🌟 주요 특징

### 실시간 음식점 검색

- 네이버 검색 API를 통한 실제 운영중인 음식점 정보
- 실시간 이미지 검색으로 음식점 사진 표시

### AI 맞춤 추천

- 사용자의 기분, 선호 음식, 예산을 종합 분석
- Gemini AI의 자연어 처리로 개인화된 추천

### 위치 기반 서비스

- GPS 위치 정보 활용
- 네이버 맵 연동으로 길찾기 제공

## 🐛 트러블슈팅

### 이미지가 로드되지 않는 경우

- 네이버 API 키 확인
- 백엔드 서버 실행 상태 확인
- CORS 설정 확인

### 위치 정보가 작동하지 않는 경우

- HTTPS 환경에서 실행 (위치 API 요구사항)
- 브라우저 위치 권한 허용

## 📄 라이선스

MIT License

## 🤝 기여

Pull Request와 Issue는 언제나 환영합니다!
