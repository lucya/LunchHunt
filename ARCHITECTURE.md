# 🏗️ LunchHunt 아키텍처 설계

## 1. 전체 시스템 아키텍처

### 1.1 아키텍처 패턴

- **MVC 패턴**: React 컴포넌트 기반 구조
- **단방향 데이터 플로우**: Props down, Events up
- **Context API**: 전역 상태 관리

### 1.2 레이어 구조

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│        (React Components)           │
├─────────────────────────────────────┤
│           Business Logic            │
│         (Custom Hooks)              │
├─────────────────────────────────────┤
│           Service Layer             │
│       (API, Local Storage)          │
├─────────────────────────────────────┤
│             Data Layer              │
│    (Types, Interfaces, Utils)       │
└─────────────────────────────────────┘
```

## 2. 디렉토리 구조

```
src/
├── components/           # UI 컴포넌트
│   ├── common/          # 공통 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Loading.tsx
│   │   └── Layout.tsx
│   ├── game/            # 게임 관련 컴포넌트
│   │   ├── QuestionCard.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── GameFlow.tsx
│   │   └── QuestionTypes/
│   │       ├── MoodQuestion.tsx
│   │       ├── FoodTypeQuestion.tsx
│   │       ├── BudgetQuestion.tsx
│   │       ├── SpiceQuestion.tsx
│   │       └── SpecialRequirementQuestion.tsx
│   └── result/          # 결과 관련 컴포넌트
│       ├── ResultCard.tsx
│       ├── FoodRecommendation.tsx
│       └── ActionButtons.tsx
├── pages/               # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── GamePage.tsx
│   ├── ResultPage.tsx
│   ├── HistoryPage.tsx
│   └── SettingsPage.tsx
├── hooks/              # 커스텀 훅
│   ├── useGameState.ts
│   ├── useAIRecommendation.ts
│   ├── useLocalStorage.ts
│   └── useHistory.ts
├── services/           # 외부 서비스
│   ├── geminiAPI.ts
│   ├── localStorage.ts
│   └── imageService.ts
├── context/            # Context API
│   ├── GameContext.tsx
│   ├── HistoryContext.tsx
│   └── SettingsContext.tsx
├── types/              # TypeScript 타입
│   ├── game.ts
│   ├── recommendation.ts
│   └── user.ts
├── utils/              # 유틸리티 함수
│   ├── constants.ts
│   ├── validation.ts
│   └── formatting.ts
├── styles/             # 스타일 파일
│   └── globals.css
├── App.tsx
└── main.tsx
```

## 3. 컴포넌트 설계

### 3.1 컴포넌트 계층 구조

```
App
├── Router
│   ├── HomePage
│   │   ├── WelcomeSection
│   │   ├── StartButton
│   │   └── HistoryPreview
│   ├── GamePage
│   │   ├── ProgressBar
│   │   ├── QuestionCard
│   │   │   ├── MoodQuestion
│   │   │   ├── FoodTypeQuestion
│   │   │   ├── BudgetQuestion
│   │   │   ├── SpiceQuestion
│   │   │   └── SpecialRequirementQuestion
│   │   └── NavigationButtons
│   ├── ResultPage
│   │   ├── LoadingSpinner
│   │   ├── RecommendationList
│   │   │   └── FoodCard × 3
│   │   └── ActionButtons
│   ├── HistoryPage
│   │   ├── HistoryList
│   │   └── HistoryItem
│   └── SettingsPage
│       ├── ThemeToggle
│       ├── AllergySettings
│       └── PreferenceSettings
```

### 3.2 주요 컴포넌트 인터페이스

#### QuestionCard

```typescript
interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: Answer) => void;
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  onBack: () => void;
}
```

#### FoodCard

```typescript
interface FoodCardProps {
  food: FoodRecommendation;
  onSave: (food: FoodRecommendation) => void;
  onReject: (food: FoodRecommendation) => void;
}
```

## 4. 상태 관리 설계

### 4.1 게임 상태 (GameContext)

```typescript
interface GameState {
  currentStep: number;
  answers: Answer[];
  isLoading: boolean;
  recommendations: FoodRecommendation[];
  gamePhase: "idle" | "playing" | "processing" | "results";
}

interface GameActions {
  startGame: () => void;
  answerQuestion: (answer: Answer) => void;
  goBack: () => void;
  resetGame: () => void;
  generateRecommendations: () => Promise<void>;
}
```

### 4.2 히스토리 상태 (HistoryContext)

```typescript
interface HistoryState {
  history: GameSession[];
  favorites: FoodRecommendation[];
  rejectedFoods: string[];
}

interface HistoryActions {
  saveSession: (session: GameSession) => void;
  addToFavorites: (food: FoodRecommendation) => void;
  rejectFood: (foodName: string) => void;
  clearHistory: () => void;
}
```

### 4.3 설정 상태 (SettingsContext)

```typescript
interface SettingsState {
  theme: "light" | "dark";
  allergies: string[];
  defaultPreferences: UserPreferences;
  language: "ko" | "en";
}
```

## 5. API 설계

### 5.1 Gemini AI 서비스

```typescript
class GeminiService {
  private apiKey: string;

  async generateRecommendations(
    answers: Answer[]
  ): Promise<FoodRecommendation[]> {
    // AI 프롬프트 생성
    const prompt = this.buildPrompt(answers);

    // Gemini API 호출
    const response = await this.callGeminiAPI(prompt);

    // 응답 파싱 및 반환
    return this.parseRecommendations(response);
  }

  private buildPrompt(answers: Answer[]): string {
    // 사용자 답변을 바탕으로 AI 프롬프트 구성
  }
}
```

### 5.2 로컬 스토리지 서비스

```typescript
class StorageService {
  saveGameSession(session: GameSession): void;
  getGameHistory(): GameSession[];
  saveFavorites(favorites: FoodRecommendation[]): void;
  getFavorites(): FoodRecommendation[];
  saveSettings(settings: SettingsState): void;
  getSettings(): SettingsState;
}
```

## 6. 데이터 모델

### 6.1 핵심 타입 정의

```typescript
// 질문 타입
interface Question {
  id: string;
  type: "mood" | "foodType" | "budget" | "spice" | "special";
  title: string;
  options: Option[];
}

// 답변 타입
interface Answer {
  questionId: string;
  selectedOption: string;
  value: any;
}

// 음식 추천 타입
interface FoodRecommendation {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  estimatedPrice: number;
  spiceLevel: number;
  reason: string;
  imageUrl?: string;
  tags: string[];
}

// 게임 세션 타입
interface GameSession {
  id: string;
  timestamp: Date;
  answers: Answer[];
  recommendations: FoodRecommendation[];
  selectedFood?: FoodRecommendation;
}
```

## 7. 성능 최적화 전략

### 7.1 컴포넌트 최적화

- React.memo() 사용으로 불필요한 리렌더링 방지
- useMemo(), useCallback() 활용
- 코드 스플리팅 (React.lazy)

### 7.2 API 최적화

- 요청 디바운싱
- 캐싱 전략
- 에러 재시도 로직

### 7.3 번들 최적화

- Tree shaking
- Dynamic imports
- 이미지 최적화

## 8. 보안 고려사항

### 8.1 API 보안

- 환경변수를 통한 API 키 관리
- API 사용량 제한
- 입력 데이터 검증

### 8.2 데이터 보안

- 민감한 데이터 암호화
- XSS 방지
- 로컬 스토리지 데이터 검증
