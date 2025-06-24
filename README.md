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

### 환경 변수 설정

```bash
cp .env.example .env.local
# .env.local 파일에 Google AI API 키 추가
```

### 설치 및 실행

```bash
npm install
npm run dev
```

## 📋 요구사항

자세한 요구사항은 `REQUIREMENTS.md` 파일을 참조하세요.
