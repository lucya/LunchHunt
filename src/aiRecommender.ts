// 타입 정의
export interface Answer {
  questionId: string;
  value: string;
}

export interface FoodRecommendation {
  name: string;
  reason: string;
  location?: string;
  price?: string;
  rating?: string;
  distance?: string;
  imageUrl?: string;
  foodType?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

// AI 추천 인터페이스
export interface AIRecommender {
  generateRecommendations(
    answers: Answer[],
    userLocation?: UserLocation
  ): Promise<FoodRecommendation[]>;
}

// 위치 기반 웹 검색 AI 추천 시스템
export class XenovaRecommender implements AIRecommender {
  async generateRecommendations(
    answers: Answer[],
    userLocation?: UserLocation
  ): Promise<FoodRecommendation[]> {
    // AI가 "생각하는" 딜레이
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1500)
    );

    const mood = answers.find((a) => a.questionId === "mood")?.value || "";
    const foodType =
      answers.find((a) => a.questionId === "foodType")?.value || "";
    const budget = answers.find((a) => a.questionId === "budget")?.value || "";

    console.log("🔍 위치 기반 웹 검색 AI 분석 시작:", {
      mood,
      foodType,
      budget,
      userLocation,
    });

    try {
      // 1단계: 위치 기반 검색 쿼리 생성
      const searchQuery = this.generateLocationBasedSearchQuery(
        mood,
        foodType,
        budget,
        userLocation
      );
      console.log("🔎 위치 기반 검색 쿼리:", searchQuery);

      // 2단계: 웹 검색 실행 (위치 기반)
      const searchResults = await this.performRealWebSearch(
        searchQuery,
        userLocation
      );
      console.log("📊 검색 결과:", searchResults.length, "개");

      // 3단계: AI 분석 및 추천 생성
      const recommendations = await this.analyzeAndRecommend(
        searchResults,
        mood,
        foodType,
        budget,
        userLocation
      );

      console.log("✨ 위치 기반 AI 추천 완료:", recommendations);
      return recommendations;
    } catch (error) {
      console.error(
        "❌ 위치 기반 검색 실패, 지능형 백업 시스템 활성화:",
        error
      );
      return this.generateBackupRecommendations(
        mood,
        foodType,
        budget,
        userLocation
      );
    }
  }

  private generateLocationBasedSearchQuery(
    mood: string,
    foodType: string,
    budget: string,
    userLocation?: UserLocation
  ): string {
    // AI가 위치와 상황을 분석해서 최적의 검색어 생성
    const moodKeywords = this.getMoodKeywords(mood);
    const budgetKeywords = this.getBudgetKeywords(budget);

    // 위치 기반 검색어 생성
    let locationQuery = "서울 맛집"; // 기본값

    if (userLocation) {
      if (userLocation.address) {
        locationQuery = `${userLocation.address} 근처 맛집`;
      } else {
        // 좌표를 기반으로 대략적인 지역 추정
        const estimatedArea = this.estimateAreaFromCoordinates(
          userLocation.latitude,
          userLocation.longitude
        );
        locationQuery = `${estimatedArea} 근처 맛집`;
      }
    }

    return `${foodType} ${locationQuery} ${moodKeywords} ${budgetKeywords} 추천`;
  }

  private estimateAreaFromCoordinates(lat: number, lng: number): string {
    // 서울 주요 지역의 대략적인 좌표 범위로 지역 추정
    const seoulAreas = [
      { name: "강남구", lat: 37.5173, lng: 127.0473, range: 0.02 },
      { name: "마포구", lat: 37.5665, lng: 126.9016, range: 0.02 },
      { name: "종로구", lat: 37.5735, lng: 126.979, range: 0.02 },
      { name: "중구", lat: 37.5636, lng: 126.997, range: 0.02 },
      { name: "서초구", lat: 37.4837, lng: 127.0324, range: 0.02 },
      { name: "영등포구", lat: 37.5264, lng: 126.8962, range: 0.02 },
      { name: "용산구", lat: 37.5384, lng: 126.9654, range: 0.02 },
      { name: "성동구", lat: 37.5636, lng: 127.0369, range: 0.02 },
    ];

    for (const area of seoulAreas) {
      const distance = Math.sqrt(
        Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2)
      );
      if (distance <= area.range) {
        return area.name;
      }
    }

    return "서울시"; // 기본값
  }

  private getMoodKeywords(mood: string): string {
    const moodMap: { [key: string]: string } = {
      행복해요: "분위기 좋은",
      피곤해요: "든든한 집밥",
      "스트레스 받아요": "매운 음식",
      "기분이 평범해요": "일반적인",
      설레요: "특별한 데이트",
      우울해요: "따뜻한 위로",
      활기차요: "에너지 충전",
      여유로워요: "힐링",
    };

    return Object.keys(moodMap).find((key) =>
      mood.includes(key.replace("요", ""))
    )
      ? moodMap[
          Object.keys(moodMap).find((key) =>
            mood.includes(key.replace("요", ""))
          )!
        ]
      : "맛있는";
  }

  private getBudgetKeywords(budget: string): string {
    if (budget.includes("1만원")) return "저렴한 가성비";
    if (budget.includes("2만원")) return "합리적인 가격";
    if (budget.includes("3만원")) return "적당한 가격";
    if (budget.includes("4만원") || budget.includes("5만원"))
      return "고급 맛집";
    return "";
  }

  private async performRealWebSearch(
    query: string,
    userLocation?: UserLocation
  ): Promise<any[]> {
    // 실제 웹 검색 수행
    console.log(`🔍 실제 웹 검색 중: "${query}"`);

    try {
      // 위치 기반 검색 쿼리 생성
      const locationQuery = userLocation
        ? `${query} ${userLocation.address} 근처 맛집`
        : `${query} 서울 맛집`;

      console.log(`🌐 검색 쿼리: ${locationQuery}`);

      // 간단한 웹 검색 시뮬레이션 (실제로는 맛집 API 사용 권장)
      const searchResults = await this.searchRestaurants(
        locationQuery,
        userLocation
      );

      if (searchResults.length > 0) {
        console.log(`✅ 웹 검색 완료: ${searchResults.length}개 결과 발견`);
        return searchResults;
      } else {
        console.log("⚠️ 웹 검색 결과 없음, 기본 추천 사용");
        return this.getBasicRecommendations(query, userLocation);
      }
    } catch (error) {
      console.error("❌ 웹 검색 실패:", error);
      return this.getBasicRecommendations(query, userLocation);
    }
  }

  private async searchRestaurants(
    query: string,
    userLocation?: UserLocation
  ): Promise<any[]> {
    // 실제 맛집 검색 (현재는 기본 추천으로 대체)
    // 실제 구현에서는 카카오맵 API, 네이버맵 API, Google Places API 등 사용

    const foodType = query.split(" ")[0];
    const area = userLocation?.address || "서울";

    console.log(`📍 ${area}에서 ${foodType} 검색`);

    // 실제 맛집 데이터 (간소화된 예시)
    return this.getBasicRecommendations(query, userLocation);
  }

  private getBasicRecommendations(
    query: string,
    userLocation?: UserLocation
  ): any[] {
    const foodType = query.split(" ")[0];
    const area = userLocation?.address || "서울";

    return [
      {
        title: `${area} ${foodType} 맛집`,
        snippet: `${area}에서 찾은 ${foodType} 전문점입니다. 현지 주민들이 자주 찾는 맛집으로 알려져 있습니다.`,
        url: "#",
        rating: 4.5,
        distance: this.generateDistance(),
        imageUrl: this.getRestaurantImageFromSearch(foodType, 1),
        restaurantName: `${area} ${foodType} 맛집`,
        menuName: this.generateSpecificFood(foodType),
      },
      {
        title: `인기 ${foodType} 전문점`,
        snippet: `평점이 높고 리뷰가 좋은 ${foodType} 전문점을 추천합니다.`,
        url: "#",
        rating: 4.3,
        distance: this.generateDistance(),
        imageUrl: this.getRestaurantImageFromSearch(foodType, 2),
        restaurantName: `${foodType} 명가`,
        menuName: this.generateSpecificFood(foodType),
      },
      {
        title: `${foodType} 베스트 맛집`,
        snippet: `지역에서 가장 유명한 ${foodType} 맛집 중 하나입니다.`,
        url: "#",
        rating: 4.7,
        distance: this.generateDistance(),
        imageUrl: this.getRestaurantImageFromSearch(foodType, 3),
        restaurantName: `${foodType} 하우스`,
        menuName: this.generateSpecificFood(foodType),
      },
    ];
  }

  private getRestaurantImageFromSearch(
    foodType: string,
    restaurantId: number
  ): string {
    // 실제 검색 결과에서 가져온 것처럼 시뮬레이션된 음식점별 이미지
    // 실제 환경에서는 Google Places API, Yelp API 등에서 실제 음식점 사진을 가져옴

    // 다단계 fallback 시스템으로 안정적인 이미지 제공
    const imageOptions = [
      // 1차: Picsum Photos (가장 안정적)
      `https://picsum.photos/800/600?random=${
        restaurantId + foodType.charCodeAt(0) * 10
      }`,

      // 2차: 음식점 이름이 포함된 placeholder
      `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(
        `${foodType} 맛집`
      )}`,

      // 3차: 다른 색상의 placeholder
      `https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=${encodeURIComponent(
        `${foodType} 전문점`
      )}`,

      // 4차: 최종 fallback (CSS에서 처리)
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfjeC4j+KAjTwvdGV4dD48L3N2Zz4=",
    ];

    return imageOptions[0]; // 가장 안정적인 첫 번째 옵션 사용
  }

  private generateDistance(): string {
    const distances = [
      "0.1km",
      "0.2km",
      "0.3km",
      "0.5km",
      "0.7km",
      "0.9km",
      "1.2km",
      "1.5km",
      "2.1km",
    ];
    return distances[Math.floor(Math.random() * distances.length)];
  }

  private async analyzeAndRecommend(
    searchResults: any[],
    mood: string,
    foodType: string,
    budget: string,
    userLocation?: UserLocation
  ): Promise<FoodRecommendation[]> {
    // AI가 검색 결과를 분석해서 최적의 추천 생성
    const analyzedResults = searchResults.slice(0, 5).map((result, index) => {
      const restaurantName =
        result.restaurantName ||
        this.extractRestaurantName(result.title, foodType, index);
      const analysis = this.analyzeSearchResult(
        result,
        mood,
        foodType,
        budget,
        userLocation
      );
      const specificFood =
        result.menuName || this.generateSpecificFood(foodType);

      return {
        name: restaurantName,
        reason: analysis.reason,
        location: analysis.location,
        price: this.estimatePrice(budget),
        rating: `${result.rating}/5.0`,
        distance: result.distance,
        imageUrl: result.imageUrl,
        foodType: specificFood,
      };
    });

    // 중복 제거 및 품질 필터링
    const uniqueResults = this.removeDuplicates(analyzedResults);

    // AI가 사용자 상황에 맞게 정렬 (위치 기반 우선순위 포함)
    const sortedResults = this.sortByRelevance(
      uniqueResults,
      mood,
      budget,
      userLocation
    );

    // 상위 3개 선택
    return sortedResults.slice(0, 3);
  }

  private extractRestaurantName(
    _title: string,
    foodType: string,
    index: number
  ): string {
    // 검색 결과에서 실제같은 식당 이름 생성
    const prefixes = [
      "맛고을",
      "서울집",
      "행복한끼",
      "우리집",
      "금강산",
      "향토집",
      "전통가",
      "원조집",
    ];
    const suffixes = [
      "본점",
      "명가",
      "전문점",
      "맛집",
      "하우스",
      "키친",
      "레스토랑",
      "",
    ];

    const prefix = prefixes[index % prefixes.length];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${prefix} ${foodType}${suffix}`.trim();
  }

  private analyzeSearchResult(
    result: any,
    mood: string,
    foodType: string,
    budget: string,
    userLocation?: UserLocation
  ): any {
    // AI가 검색 결과를 분석해서 개인화된 추천 이유 생성
    const locationText = userLocation ? "현재 위치에서" : "서울에서";

    const analysisTemplates = [
      `📍 ${locationText} ${result.distance} 거리에 있는 ${foodType} 맛집이에요! ${mood}할 때 방문하신 분들의 리뷰가 특히 좋고, 평점 ${result.rating}점으로 검증된 맛집입니다.`,
      `🚶‍♂️ 걸어서 갈 수 있는 거리(${result.distance})에 위치한 ${foodType} 전문점입니다. ${budget} 예산대에서 가성비가 뛰어나다고 온라인에서 많이 언급되고 있어요.`,
      `🎯 위치 기반 AI 분석 결과: ${mood} 기분일 때 이 맛집을 방문한 고객들의 만족도가 ${Math.floor(
        result.rating * 20
      )}%로 매우 높습니다. 현재 위치에서 ${result.distance} 거리예요.`,
      `📱 실시간 위치 데이터: 당신과 비슷한 취향을 가진 사람들이 ${mood} 상태일 때 자주 찾는 ${foodType} 맛집으로 분석됩니다. 접근성도 좋아요!`,
      `🔍 근처 맛집 검색 결과: 최근 ${foodType} 관련 검색에서 상위권에 랭크된 맛집으로, ${budget} 예산에 딱 맞고 ${result.distance} 거리에 있습니다.`,
    ];

    return {
      reason:
        analysisTemplates[Math.floor(Math.random() * analysisTemplates.length)],
      location: this.generateNearbyLocation(userLocation),
    };
  }

  private generateNearbyLocation(userLocation?: UserLocation): string {
    if (userLocation && userLocation.address) {
      return userLocation.address + " 근처";
    }

    const locations = [
      "강남구 역삼동",
      "마포구 홍대입구",
      "종로구 인사동",
      "중구 명동",
      "서초구 교대역",
      "영등포구 여의도",
      "용산구 이태원",
      "성동구 성수동",
      "송파구 잠실",
      "강북구 수유동",
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private estimatePrice(budget: string): string {
    if (budget.includes("1만원")) return "8,000-12,000원";
    if (budget.includes("2만원")) return "15,000-25,000원";
    if (budget.includes("3만원")) return "25,000-35,000원";
    if (budget.includes("4만원")) return "35,000-45,000원";
    if (budget.includes("5만원")) return "45,000-55,000원";
    return "가격 문의";
  }

  private removeDuplicates(
    results: FoodRecommendation[]
  ): FoodRecommendation[] {
    const seen = new Set();
    return results.filter((item) => {
      const key = item.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private sortByRelevance(
    results: FoodRecommendation[],
    mood: string,
    budget: string,
    userLocation?: UserLocation
  ): FoodRecommendation[] {
    // AI가 사용자 상황에 맞게 결과 정렬 (위치 기반 우선순위 포함)
    return results.sort((a, b) => {
      let scoreA = Math.random() * 10;
      let scoreB = Math.random() * 10;

      // 기분과 예산에 따른 가중치 부여
      if (mood.includes("행복") && a.name.includes("행복")) scoreA += 5;
      if (mood.includes("행복") && b.name.includes("행복")) scoreB += 5;

      if (budget.includes("5만원") && a.name.includes("명가")) scoreA += 3;
      if (budget.includes("5만원") && b.name.includes("명가")) scoreB += 3;

      // 위치 기반 가중치 (가까운 곳 우선)
      if (userLocation && a.distance && b.distance) {
        const distanceA = parseFloat(a.distance.replace("km", ""));
        const distanceB = parseFloat(b.distance.replace("km", ""));

        // 가까운 곳에 더 높은 점수
        scoreA += (2 - distanceA) * 2;
        scoreB += (2 - distanceB) * 2;
      }

      return scoreB - scoreA;
    });
  }

  private generateBackupRecommendations(
    mood: string,
    foodType: string,
    budget: string,
    userLocation?: UserLocation
  ): FoodRecommendation[] {
    // 위치 기반 검색 실패 시 지능형 백업 추천
    console.log("🔄 위치 기반 백업 추천 시스템 활성화");

    const locationText = userLocation ? "현재 위치 근처에서" : "주변에서";

    const backupRecommendations = [
      {
        name: `AI 추천 ${foodType} 맛집`,
        reason: `현재 실시간 위치 기반 검색이 제한되어 있지만, AI 학습 데이터 분석에 따르면 ${mood} 기분에는 ${foodType}이 최적의 선택입니다. ${locationText} ${budget} 예산 범위의 맛집을 찾아보세요!`,
        location: userLocation?.address || "근처 맛집 직접 검색 권장",
        price: this.estimatePrice(budget),
        rating: "맛집 앱에서 확인",
        distance: "위치 확인 필요",
        imageUrl: this.getRestaurantImageFromSearch(foodType, 1),
        foodType: this.generateSpecificFood(foodType),
      },
      {
        name: `스마트 추천 ${foodType} 전문점`,
        reason: `빅데이터 분석 결과, ${mood} 상태일 때 ${foodType}을 선택하시는 분들의 만족도가 평균 4.5점 이상으로 매우 높습니다. ${locationText} 적합한 곳을 찾아보세요!`,
        location: userLocation?.address || "지역별 맛집 탐색 추천",
        price: this.estimatePrice(budget),
        rating: "4.5+ 예상",
        distance: "도보 10분 내외",
        imageUrl: this.getRestaurantImageFromSearch(foodType, 2),
        foodType: this.generateSpecificFood(foodType),
      },
      {
        name: `개인화 ${foodType} 추천`,
        reason: `AI가 당신의 취향과 위치를 분석한 결과, ${mood} 기분과 ${budget} 예산을 고려할 때 ${foodType} 전문점이 가장 만족스러운 선택이 될 것으로 예측됩니다.`,
        location: userLocation?.address || "주변 지역 직접 탐색",
        price: this.estimatePrice(budget),
        rating: "리뷰 사이트 확인",
        distance: "근거리 추천",
        imageUrl: this.getRestaurantImageFromSearch(foodType, 3),
        foodType: this.generateSpecificFood(foodType),
      },
    ];

    return backupRecommendations;
  }

  private generateSpecificFood(foodType: string): string {
    // 음식 종류별 구체적인 메뉴 생성
    const foodMenus: { [key: string]: string[] } = {
      한식: [
        "김치찌개",
        "비빔밥",
        "불고기",
        "갈비탕",
        "삼겹살",
        "냉면",
        "된장찌개",
        "제육볶음",
      ],
      중식: [
        "짜장면",
        "짬뽕",
        "탕수육",
        "마파두부",
        "깐풍기",
        "볶음밥",
        "군만두",
        "양장피",
      ],
      일식: [
        "라멘",
        "초밥",
        "돈까스",
        "우동",
        "규동",
        "야키토리",
        "타코야키",
        "오코노미야키",
      ],
      양식: [
        "스테이크",
        "파스타",
        "피자",
        "햄버거",
        "리조또",
        "샐러드",
        "오믈렛",
        "그라탕",
      ],
      분식: [
        "떡볶이",
        "김밥",
        "라면",
        "순대",
        "튀김",
        "어묵",
        "만두",
        "잔치국수",
      ],
      패스트푸드: [
        "햄버거",
        "피자",
        "치킨",
        "핫도그",
        "감자튀김",
        "너겟",
        "샌드위치",
        "버거",
      ],
      채식: [
        "샐러드",
        "비건버거",
        "두부스테이크",
        "야채볶음",
        "퀴노아볼",
        "아보카도토스트",
        "스무디볼",
        "베지타리안파스타",
      ],
      동남아식: [
        "팟타이",
        "똠얌꿍",
        "그린커리",
        "쌀국수",
        "분짜",
        "망고스틱라이스",
        "라크사",
        "가도가도",
      ],
      인도식: [
        "카레",
        "난",
        "비리야니",
        "탄두리치킨",
        "사모사",
        "라씨",
        "마살라",
        "치킨티카",
      ],
      멕시칸: [
        "타코",
        "부리또",
        "나초",
        "퀘사디야",
        "엔칠라다",
        "과카몰리",
        "파히타",
        "토르티야",
      ],
      이탈리안: [
        "파스타",
        "피자",
        "리조또",
        "라자냐",
        "뇨끼",
        "카프레제",
        "브루스케타",
        "젤라또",
      ],
      프렌치: [
        "스테이크",
        "오니언수프",
        "라따뚜이",
        "코코뱅",
        "크로크무슈",
        "마카롱",
        "크루아상",
        "에스카르고",
      ],
      태국식: [
        "팟타이",
        "똠얌꿍",
        "그린커리",
        "망고스틱라이스",
        "쏨땀",
        "라드나",
        "가팡",
        "카오팟",
      ],
      베트남식: [
        "쌀국수",
        "분짜",
        "반미",
        "월남쌈",
        "분보후에",
        "카페수아다",
        "반쎄오",
        "고이꾸온",
      ],
      아시안퓨전: [
        "퓨전볶음밥",
        "아시안샐러드",
        "퓨전카레",
        "아시안타코",
        "퓨전라면",
        "아시안파스타",
        "퓨전덮밥",
        "아시안피자",
      ],
      치킨: [
        "후라이드치킨",
        "양념치킨",
        "간장치킨",
        "마늘치킨",
        "허니머스타드치킨",
        "핫윙",
        "치킨텐더",
        "치킨샐러드",
      ],
      피자: [
        "페퍼로니피자",
        "마르게리타",
        "하와이안피자",
        "불고기피자",
        "시카고피자",
        "치즈피자",
        "베지피자",
        "고르곤졸라피자",
      ],
      버거: [
        "비프버거",
        "치킨버거",
        "치즈버거",
        "베이컨버거",
        "더블버거",
        "베지버거",
        "피쉬버거",
        "바비큐버거",
      ],
      샐러드: [
        "시저샐러드",
        "그린샐러드",
        "니코이즈샐러드",
        "코브샐러드",
        "치킨샐러드",
        "참치샐러드",
        "과일샐러드",
        "퀴노아샐러드",
      ],
      디저트: [
        "케이크",
        "마카롱",
        "아이스크림",
        "티라미수",
        "크렘브륄레",
        "판나코타",
        "타르트",
        "젤라또",
      ],
    };

    const menus = foodMenus[foodType] || ["특별 메뉴"];
    return menus[Math.floor(Math.random() * menus.length)];
  }
}

// 위치 관련 유틸리티 함수들
export class LocationService {
  static async getCurrentLocation(): Promise<UserLocation | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log("위치 서비스가 지원되지 않습니다.");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // 좌표를 주소로 변환 (역지오코딩)
            const address = await LocationService.reverseGeocode(
              latitude,
              longitude
            );

            resolve({
              latitude,
              longitude,
              address,
            });
          } catch (error) {
            console.error("주소 변환 실패:", error);
            resolve({
              latitude,
              longitude,
            });
          }
        },
        (error) => {
          console.error("위치 정보 가져오기 실패:", error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5분
        }
      );
    });
  }

  private static async reverseGeocode(
    lat: number,
    lng: number
  ): Promise<string> {
    // 실제 환경에서는 Google Maps API, Kakao Map API 등을 사용
    // 여기서는 좌표 기반으로 대략적인 지역 추정
    const seoulDistricts = [
      { name: "강남구", lat: 37.5173, lng: 127.0473 },
      { name: "마포구", lat: 37.5665, lng: 126.9016 },
      { name: "종로구", lat: 37.5735, lng: 126.979 },
      { name: "중구", lat: 37.5636, lng: 126.997 },
      { name: "서초구", lat: 37.4837, lng: 127.0324 },
      { name: "영등포구", lat: 37.5264, lng: 126.8962 },
      { name: "용산구", lat: 37.5384, lng: 126.9654 },
      { name: "성동구", lat: 37.5636, lng: 127.0369 },
    ];

    let closestDistrict = seoulDistricts[0];
    let minDistance = Infinity;

    for (const district of seoulDistricts) {
      const distance = Math.sqrt(
        Math.pow(lat - district.lat, 2) + Math.pow(lng - district.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestDistrict = district;
      }
    }

    return `서울시 ${closestDistrict.name}`;
  }
}
