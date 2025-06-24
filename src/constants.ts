// 게임 옵션 상수들

export const MOODS = [
  "행복해요",
  "피곤해요",
  "스트레스 받아요",
  "기분이 평범해요",
  "설레요",
  "우울해요",
  "활기차요",
  "여유로워요",
] as const;

export const FOOD_TYPES = [
  "한식",
  "중식",
  "일식",
  "양식",
  "분식",
  "패스트푸드",
  "채식",
  "동남아식",
  "인도식",
  "멕시칸",
  "이탈리안",
  "프렌치",
  "태국식",
  "베트남식",
  "아시안퓨전",
  "치킨",
  "피자",
  "버거",
  "샐러드",
  "디저트",
] as const;

export const BUDGETS = [
  "1만원",
  "1만5천원",
  "2만원",
  "3만원",
  "4만원",
  "5만원",
  "상관없음",
] as const;

// 타입 정의
export type Mood = (typeof MOODS)[number];
export type FoodType = (typeof FOOD_TYPES)[number];
export type Budget = (typeof BUDGETS)[number];
