// i18n을 고려한 음식 데이터 구조

export const MOODS = [
  "행복해요",
  "피곤해요",
  "스트레스 받아요",
  "기분이 평범해요",
  "설레요",
  "우울해요",
  "활기차요",
  "여유로워요",
];

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
];

export const BUDGETS = [
  "1만원",
  "1만5천원",
  "2만원",
  "3만원",
  "4만원",
  "5만원",
  "상관없음",
];

// 음식 추천 데이터베이스
export interface FoodItem {
  name: string;
  category: string;
  priceRange: string;
  tags: string[];
  description: string;
}

export const FOOD_DATABASE: FoodItem[] = [
  // 한식
  {
    name: "비빔밥",
    category: "한식",
    priceRange: "1만원 이하",
    tags: ["건강", "영양"],
    description: "다양한 나물과 고기가 어우러진 영양 만점 한식",
  },
  {
    name: "김치찌개",
    category: "한식",
    priceRange: "1만원 이하",
    tags: ["따뜻함", "매콤"],
    description: "한국인의 소울푸드 김치찌개",
  },
  {
    name: "갈비탕",
    category: "한식",
    priceRange: "1만5천원 이하",
    tags: ["든든함", "보양"],
    description: "깊은 국물맛의 든든한 갈비탕",
  },
  {
    name: "삼겹살",
    category: "한식",
    priceRange: "2만원 이하",
    tags: ["고기", "회식"],
    description: "한국인이 사랑하는 삼겹살",
  },
  {
    name: "냉면",
    category: "한식",
    priceRange: "1만원 이하",
    tags: ["시원함", "여름"],
    description: "시원하고 깔끔한 냉면",
  },
  {
    name: "불고기",
    category: "한식",
    priceRange: "1만5천원 이하",
    tags: ["달콤함", "고기"],
    description: "달콤한 양념의 불고기",
  },

  // 중식
  {
    name: "짜장면",
    category: "중식",
    priceRange: "1만원 이하",
    tags: ["면", "클래식"],
    description: "중식의 대표 메뉴 짜장면",
  },
  {
    name: "짬뽕",
    category: "중식",
    priceRange: "1만원 이하",
    tags: ["매콤함", "해물"],
    description: "얼큰한 국물의 짬뽕",
  },
  {
    name: "탕수육",
    category: "중식",
    priceRange: "1만5천원 이하",
    tags: ["달콤함", "바삭함"],
    description: "바삭하고 달콤한 탕수육",
  },
  {
    name: "마파두부",
    category: "중식",
    priceRange: "1만원 이하",
    tags: ["매콤함", "두부"],
    description: "매콤한 사천식 마파두부",
  },

  // 일식
  {
    name: "라멘",
    category: "일식",
    priceRange: "1만원 이하",
    tags: ["면", "따뜻함"],
    description: "진한 국물의 일본식 라멘",
  },
  {
    name: "초밥",
    category: "일식",
    priceRange: "2만원 이하",
    tags: ["신선함", "생선"],
    description: "신선한 생선의 초밥",
  },
  {
    name: "돈까스",
    category: "일식",
    priceRange: "1만원 이하",
    tags: ["바삭함", "돼지고기"],
    description: "바삭한 돈까스",
  },
  {
    name: "우동",
    category: "일식",
    priceRange: "1만원 이하",
    tags: ["면", "담백함"],
    description: "담백한 국물의 우동",
  },

  // 양식
  {
    name: "스테이크",
    category: "양식",
    priceRange: "3만원 이하",
    tags: ["고급", "소고기"],
    description: "부드러운 스테이크",
  },
  {
    name: "파스타",
    category: "양식",
    priceRange: "1만5천원 이하",
    tags: ["면", "이탈리안"],
    description: "다양한 소스의 파스타",
  },
  {
    name: "리조또",
    category: "양식",
    priceRange: "1만5천원 이하",
    tags: ["크림", "이탈리안"],
    description: "크리미한 리조또",
  },

  // 분식
  {
    name: "떡볶이",
    category: "분식",
    priceRange: "5천원 이하",
    tags: ["매콤함", "간식"],
    description: "매콤달콤한 떡볶이",
  },
  {
    name: "김밥",
    category: "분식",
    priceRange: "5천원 이하",
    tags: ["간편함", "든든함"],
    description: "간편하고 든든한 김밥",
  },
  {
    name: "라면",
    category: "분식",
    priceRange: "5천원 이하",
    tags: ["간편함", "따뜻함"],
    description: "간편한 라면",
  },

  // 패스트푸드
  {
    name: "햄버거",
    category: "패스트푸드",
    priceRange: "1만원 이하",
    tags: ["간편함", "빠름"],
    description: "간편한 햄버거",
  },
  {
    name: "피자",
    category: "패스트푸드",
    priceRange: "2만원 이하",
    tags: ["치즈", "공유"],
    description: "치즈가 듬뿍 피자",
  },
  {
    name: "치킨",
    category: "치킨",
    priceRange: "2만원 이하",
    tags: ["바삭함", "간식"],
    description: "바삭한 프라이드 치킨",
  },

  // 기타
  {
    name: "샐러드",
    category: "채식",
    priceRange: "1만원 이하",
    tags: ["건강", "다이어트"],
    description: "신선한 채소 샐러드",
  },
  {
    name: "쌀국수",
    category: "베트남식",
    priceRange: "1만원 이하",
    tags: ["면", "담백함"],
    description: "담백한 베트남 쌀국수",
  },
  {
    name: "카레",
    category: "인도식",
    priceRange: "1만원 이하",
    tags: ["매콤함", "향신료"],
    description: "향신료 가득한 카레",
  },
];

// 기분에 따른 추천 로직
export const MOOD_RECOMMENDATIONS = {
  행복해요: ["삼겹살", "피자", "스테이크"],
  피곤해요: ["갈비탕", "라멘", "우동"],
  스트레스받아요: ["떡볶이", "짬뽕", "치킨"],
  기분이평범해요: ["비빔밥", "김치찌개", "돈까스"],
  설레요: ["초밥", "파스타", "스테이크"],
  우울해요: ["김치찌개", "라멘", "갈비탕"],
  활기차요: ["불고기", "탕수육", "치킨"],
  여유로워요: ["샐러드", "파스타", "리조또"],
};

// 예산에 따른 필터링
export const filterByBudget = (
  foods: FoodItem[],
  budget: string
): FoodItem[] => {
  if (budget === "상관없음") return foods;
  return foods.filter(
    (food) =>
      food.priceRange === budget ||
      (budget === "3만원 이하" &&
        (food.priceRange === "2만원 이하" ||
          food.priceRange === "1만5천원 이하" ||
          food.priceRange === "1만원 이하" ||
          food.priceRange === "5천원 이하"))
  );
};
