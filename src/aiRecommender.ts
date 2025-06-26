import { GoogleGenerativeAI } from "@google/generative-ai";
import { NaverMapService } from "./naverMapService";

// 타입 정의
export interface Answer {
  questionId: string;
  value: string;
}

export interface FoodRecommendation {
  name: string;
  title?: string;
  reason: string;
  location?: string;
  price?: string;
  rating?: string;
  distance?: string;
  imageUrl?: string;
  foodType?: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
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

// Gemini 2.5 Flash Preview 추천 시스템
export class GeminiRecommender implements AIRecommender {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // API 키는 환경변수에서 가져오거나 직접 설정
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp", // gemini-2.5-flash-preview-05-20 대신 사용 가능한 모델
    });
  }

  async generateRecommendations(
    answers: Answer[],
    userLocation?: UserLocation
  ): Promise<FoodRecommendation[]> {
    try {
      const mood = answers.find((a) => a.questionId === "mood")?.value || "";
      const foodType =
        answers.find((a) => a.questionId === "foodType")?.value || "";
      const budget =
        answers.find((a) => a.questionId === "budget")?.value || "";

      console.log("🤖 실제 음식점 검색 시작:", {
        mood,
        foodType,
        budget,
        userLocation,
      });

      // 1단계: 실제 운영중인 음식점 검색
      const realRestaurants = await this.searchRealRestaurants(
        foodType,
        userLocation
      );

      if (realRestaurants.length > 0) {
        console.log("🏪 실제 음식점 발견:", realRestaurants.length, "개");

        // 2단계: Gemini AI로 개인화된 추천 이유 생성
        const personalizedRecommendations =
          await this.personalizeRecommendations(
            realRestaurants,
            mood,
            budget,
            userLocation
          );

        console.log("✨ 개인화 추천 완료:", personalizedRecommendations);
        return personalizedRecommendations;
      } else {
        console.log("⚠️ 실제 음식점 검색 실패, Gemini AI 추천 사용");

        // 3단계: Gemini AI 백업 추천
        const prompt = this.createPrompt(mood, foodType, budget, userLocation);
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const recommendations = this.parseGeminiResponse(
          text,
          foodType,
          userLocation
        );
        console.log("✨ Gemini AI 백업 추천 완료:", recommendations);
        return recommendations;
      }
    } catch (error) {
      console.error("❌ Gemini AI 추천 실패:", error);
      return this.generateFallbackRecommendations(answers, userLocation);
    }
  }

  // 실제 운영중인 음식점 검색
  private async searchRealRestaurants(
    foodType: string,
    userLocation?: UserLocation
  ): Promise<FoodRecommendation[]> {
    try {
      const locationText = userLocation?.address || "서울";
      console.log("🔍 실제 음식점 데이터베이스 검색:", {
        foodType,
        locationText,
      });

      // 네이버 검색 API로 실시간 음식점 검색
      const realRestaurants = await this.getRealRestaurantData(
        foodType,
        locationText,
        userLocation
      );

      if (realRestaurants.length > 0) {
        console.log(
          "✅ 네이버에서 실제 음식점 발견:",
          realRestaurants.length,
          "개"
        );
        return realRestaurants;
      } else {
        console.log("⚠️ 해당 지역/음식 종류의 등록된 음식점 없음");
        return [];
      }
    } catch (error) {
      console.error("❌ 실제 음식점 검색 실패:", error);
      return [];
    }
  }

  // 네이버 검색 API를 통한 실시간 음식점 검색
  private async getRealRestaurantData(
    foodType: string,
    location: string,
    userLocation?: UserLocation
  ): Promise<FoodRecommendation[]> {
    try {
      console.log("🔍 네이버 검색 API로 실시간 음식점 검색 시작:", {
        foodType,
        location,
      });

      // 네이버 검색 API로 음식점 검색
      const searchQuery = `${foodType} 맛집 ${location}`;
      const naverResults = await NaverMapService.searchRestaurant(
        searchQuery,
        location
      );

      if (naverResults.length === 0) {
        console.log("⚠️ 네이버 검색 결과 없음");
        return [];
      }

      console.log(`✅ 네이버에서 ${naverResults.length}개 음식점 발견`);

      // 사진이 없는 음식점들을 위한 추가 사진 검색
      const enrichedResults = await Promise.all(
        naverResults.map(async (restaurant) => {
          if (restaurant.photos.length === 0) {
            console.log(`🔍 ${restaurant.name} 사진 추가 검색 중...`);
            try {
              const additionalPhoto =
                await NaverMapService.getRestaurantMainPhoto(
                  restaurant.name,
                  restaurant.address
                );
              if (additionalPhoto) {
                restaurant.photos = [
                  {
                    photoUrl: additionalPhoto,
                    thumbnailUrl: additionalPhoto,
                    width: 400,
                    height: 300,
                  },
                ];
                console.log(`✅ ${restaurant.name} 추가 사진 발견!`);
              }
            } catch (error) {
              console.log(`⚠️ ${restaurant.name} 추가 사진 검색 실패`);
            }
          }
          return restaurant;
        })
      );

      // 네이버 검색 결과를 FoodRecommendation 형식으로 변환
      const recommendations = enrichedResults.map((restaurant, index) => {
        // 거리 계산 (좌표가 없으면 랜덤)
        let distance = `${(Math.random() * 3 + 0.5).toFixed(1)}km`;

        // 첫 번째 사진 URL 가져오기 (유효한 URL인지 확인)
        let mainPhotoUrl = null;
        if (restaurant.photos.length > 0) {
          const photoUrl = restaurant.photos[0].photoUrl;
          // 기본적인 URL 유효성 검사
          if (
            photoUrl &&
            photoUrl.startsWith("http") &&
            photoUrl.includes(".")
          ) {
            mainPhotoUrl = photoUrl;
          }
        }

        console.log(`📸 ${restaurant.name} 사진 정보:`, {
          photosCount: restaurant.photos.length,
          mainPhotoUrl: mainPhotoUrl,
          allPhotos: restaurant.photos.map((p) => p.photoUrl).slice(0, 2), // 처음 2개만 로깅
        });

        return {
          name: restaurant.name,
          title: restaurant.name,
          reason: `네이버 검색에서 찾은 ${foodType} 전문점으로 실제 운영중입니다.`,
          location: restaurant.address,
          price: "가격 정보 없음", // 네이버 API에서 가격 정보가 없을 수 있음
          rating: restaurant.rating
            ? `${restaurant.rating}/5.0`
            : "평점 정보 없음",
          distance: distance,
          imageUrl: mainPhotoUrl || undefined,
          foodType: foodType,
          phone: restaurant.phone,
          website: undefined,
          latitude: undefined, // 네이버 로컬 검색 API에서는 좌표를 제공하지 않을 수 있음
          longitude: undefined,
        };
      });

      // 최대 5개 반환
      return recommendations.slice(0, 5);
    } catch (error) {
      console.error("❌ 네이버 검색 API 호출 실패:", error);
      return [];
    }
  }

  // Gemini AI로 개인화된 추천 이유 생성
  private async personalizeRecommendations(
    restaurants: FoodRecommendation[],
    mood: string,
    budget: string,
    userLocation?: UserLocation
  ): Promise<FoodRecommendation[]> {
    try {
      const restaurantList = restaurants
        .map((r) => `- ${r.name} (${r.location})`)
        .join("\n");

      const prompt = `다음은 실제 운영중인 음식점 목록입니다:
${restaurantList}

사용자 정보:
- 기분: ${mood}
- 예산: ${budget}
- 위치: ${userLocation?.address || "서울"}

각 음식점에 대해 사용자의 기분과 예산을 고려한 개인화된 추천 이유를 작성해주세요.
다음 JSON 형식으로 응답해주세요:

[
  {
    "name": "음식점 이름",
    "reason": "개인화된 추천 이유 (기분과 예산을 반영한 구체적인 설명)",
    "estimatedPrice": "예상 가격대",
    "rating": "예상 평점/5.0"
  }
]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("🤖 개인화 추천 응답:", text);

      // JSON 파싱
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const personalizedData = JSON.parse(jsonMatch[0]);

        // 기존 음식점 정보와 개인화된 추천 이유 결합
        return restaurants.map((restaurant, index) => {
          const personalized = personalizedData[index] || {};
          return {
            ...restaurant,
            reason: personalized.reason || restaurant.reason,
            price: personalized.estimatedPrice || restaurant.price,
            rating: personalized.rating || restaurant.rating,
          };
        });
      }
    } catch (error) {
      console.error("❌ 개인화 추천 실패:", error);
    }

    // 개인화 실패 시 기본 추천 이유 사용
    return restaurants.map((restaurant) => ({
      ...restaurant,
      reason: `${mood}에 어울리는 ${restaurant.foodType} 전문점으로, ${budget} 예산에 적합한 곳입니다.`,
    }));
  }

  private createPrompt(
    mood: string,
    foodType: string,
    budget: string,
    userLocation?: UserLocation
  ): string {
    const locationText = userLocation?.address || "서울";
    const coordinates = userLocation
      ? `(위도: ${userLocation.latitude}, 경도: ${userLocation.longitude})`
      : "";

    return `당신은 맛집 추천 전문가입니다. 다음 조건에 맞는 실제 존재하는 음식점 3곳을 추천해주세요:

조건:
- 기분: ${mood}
- 음식 종류: ${foodType}
- 예산: ${budget}
- 위치: ${locationText} ${coordinates}

각 추천에 대해 다음 형식으로 JSON 배열로 응답해주세요:
[
  {
    "name": "실제 음식점 이름",
    "reason": "추천 이유 (기분과 예산을 고려한 구체적인 설명)",
    "location": "구체적인 위치 (동/구 포함)",
    "latitude": 음식점의 위도 (숫자),
    "longitude": 음식점의 경도 (숫자),
    "price": "예상 가격대",
    "rating": "예상 평점/5.0",
    "foodType": "구체적인 메뉴명",
    "imageUrl": "음식점 또는 음식 사진 URL",
    "phone": "전화번호 (있다면)",
    "website": "웹사이트 또는 블로그 링크 (있다면)"
  }
]

중요사항:
1. 실제 존재하는 유명한 음식점을 우선 추천해주세요
2. latitude, longitude는 실제 음식점의 정확한 좌표를 제공해주세요
3. imageUrl은 해당 음식점이나 음식의 실제 사진 링크를 제공해주세요
4. 추천 이유는 사용자의 기분과 예산을 반영하여 개인화된 내용으로 작성해주세요`;
  }

  private parseGeminiResponse(
    text: string,
    foodType: string,
    userLocation?: UserLocation
  ): FoodRecommendation[] {
    try {
      // JSON 부분만 추출
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((item: any, index: number) => {
          // 음식점 좌표가 있으면 실제 거리 계산, 없으면 랜덤 거리
          let distance = `${(Math.random() * 2 + 0.1).toFixed(1)}km`;

          if (userLocation && item.latitude && item.longitude) {
            const calculatedDistance = this.calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              parseFloat(item.latitude),
              parseFloat(item.longitude)
            );
            distance = `${calculatedDistance.toFixed(1)}km`;
          }

          return {
            name: item.name || `${foodType} 맛집 ${index + 1}`,
            title: item.name || `${foodType} 맛집`,
            reason: item.reason || `${foodType} 전문점으로 유명한 곳입니다.`,
            location: item.location || userLocation?.address || "서울",
            price: item.price || "2-3만원",
            rating: item.rating || "4.5/5.0",
            distance: distance,
            imageUrl: item.imageUrl || undefined,
            foodType: item.foodType || foodType,
            phone: item.phone || undefined,
            website: item.website || undefined,
            latitude: item.latitude ? parseFloat(item.latitude) : undefined,
            longitude: item.longitude ? parseFloat(item.longitude) : undefined,
          };
        });
      }
    } catch (error) {
      console.error("Gemini 응답 파싱 실패:", error);
    }

    // 파싱 실패 시 기본 추천
    return this.generateFallbackRecommendations([], userLocation);
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    // 하버사인 공식을 사용한 두 지점 간 거리 계산 (km)
    const R = 6371; // 지구 반지름 (km)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private generateFallbackRecommendations(
    answers: Answer[],
    userLocation?: UserLocation
  ): FoodRecommendation[] {
    const mood =
      answers.find((a) => a.questionId === "mood")?.value || "기분이 좋아요";
    const foodType =
      answers.find((a) => a.questionId === "foodType")?.value || "한식";
    const budget =
      answers.find((a) => a.questionId === "budget")?.value || "2만원 이하";

    // 가상의 음식점 좌표 (사용자 위치 기준 근처)
    const nearbyRestaurants =
      this.generateNearbyRestaurantLocations(userLocation);

    return [
      {
        name: `${foodType} 맛집`,
        title: `추천 ${foodType} 맛집`,
        reason: `${mood} 기분에 딱 맞는 ${foodType} 전문점입니다. ${budget} 예산에 적합한 가성비 좋은 곳이에요.`,
        location: userLocation?.address || "서울",
        price: budget,
        rating: "4.5/5.0",
        distance: this.calculateDistanceFromUser(
          userLocation,
          nearbyRestaurants[0]
        ),
        imageUrl: undefined,
        foodType: foodType,
        latitude: nearbyRestaurants[0].lat,
        longitude: nearbyRestaurants[0].lng,
      },
      {
        name: `${foodType} 전문점`,
        title: `인기 ${foodType} 전문점`,
        reason: `현재 기분과 예산을 고려했을 때 가장 만족스러운 선택이 될 것 같습니다.`,
        location: userLocation?.address || "서울",
        price: budget,
        rating: "4.3/5.0",
        distance: this.calculateDistanceFromUser(
          userLocation,
          nearbyRestaurants[1]
        ),
        imageUrl: undefined,
        foodType: foodType,
        latitude: nearbyRestaurants[1].lat,
        longitude: nearbyRestaurants[1].lng,
      },
      {
        name: `${foodType} 하우스`,
        title: `베스트 ${foodType} 하우스`,
        reason: `지역에서 가장 유명한 ${foodType} 맛집 중 하나로, 특히 ${mood} 때 방문하기 좋은 곳입니다.`,
        location: userLocation?.address || "서울",
        price: budget,
        rating: "4.7/5.0",
        distance: this.calculateDistanceFromUser(
          userLocation,
          nearbyRestaurants[2]
        ),
        imageUrl: undefined,
        foodType: foodType,
        latitude: nearbyRestaurants[2].lat,
        longitude: nearbyRestaurants[2].lng,
      },
    ];
  }

  private generateNearbyRestaurantLocations(
    userLocation?: UserLocation
  ): Array<{ lat: number; lng: number }> {
    if (!userLocation) {
      // 기본 서울 위치 기준
      return [
        { lat: 37.5665, lng: 126.978 }, // 명동
        { lat: 37.5173, lng: 127.0473 }, // 강남
        { lat: 37.5665, lng: 126.9016 }, // 홍대
      ];
    }

    // 사용자 위치 기준 반경 1-3km 내 가상 음식점 위치 생성
    const restaurants = [];
    for (let i = 0; i < 3; i++) {
      const distance = 0.5 + Math.random() * 2.5; // 0.5-3km
      const angle = Math.random() * 2 * Math.PI; // 랜덤 방향

      const lat = userLocation.latitude + (distance / 111) * Math.cos(angle);
      const lng =
        userLocation.longitude +
        (distance / (111 * Math.cos((userLocation.latitude * Math.PI) / 180))) *
          Math.sin(angle);

      restaurants.push({ lat, lng });
    }

    return restaurants;
  }

  private calculateDistanceFromUser(
    userLocation?: UserLocation,
    restaurantLocation?: { lat: number; lng: number }
  ): string {
    if (!userLocation || !restaurantLocation) {
      return `${(Math.random() * 2 + 0.1).toFixed(1)}km`;
    }

    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      restaurantLocation.lat,
      restaurantLocation.lng
    );

    return `${distance.toFixed(1)}km`;
  }
}

// 위치 서비스 (기존 유지)
export class LocationService {
  // 현재 위치 정보를 상세하게 가져오기
  static async getCurrentLocationDetailed(): Promise<{
    location: UserLocation | null;
    accuracy: number;
    timestamp: number;
    source: "gps" | "network" | "passive";
  }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log("❌ 이 브라우저는 위치 서비스를 지원하지 않습니다.");
        resolve({
          location: null,
          accuracy: 0,
          timestamp: Date.now(),
          source: "passive",
        });
        return;
      }

      console.log("🌍 GPS 위치 정보 요청 중...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const timestamp = position.timestamp;

          console.log(
            `📍 GPS 좌표 획득: ${latitude}, ${longitude} (정확도: ${accuracy}m)`
          );

          try {
            const address = await this.reverseGeocode(latitude, longitude);
            console.log(`🏠 주소 변환 완료: ${address}`);

            resolve({
              location: {
                latitude,
                longitude,
                address,
              },
              accuracy,
              timestamp,
              source: "gps",
            });
          } catch (error) {
            console.error("❌ 주소 변환 실패:", error);
            resolve({
              location: {
                latitude,
                longitude,
                address: "주소를 확인할 수 없습니다",
              },
              accuracy,
              timestamp,
              source: "gps",
            });
          }
        },
        (error) => {
          console.error("❌ 위치 정보 획득 실패:", error);
          let errorMessage = "위치 정보를 가져올 수 없습니다";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "위치 접근 권한이 거부되었습니다";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "위치 정보를 사용할 수 없습니다";
              break;
            case error.TIMEOUT:
              errorMessage = "위치 정보 요청 시간이 초과되었습니다";
              break;
          }

          console.log(`⚠️ ${errorMessage}`);
          resolve({
            location: null,
            accuracy: 0,
            timestamp: Date.now(),
            source: "passive",
          });
        },
        {
          enableHighAccuracy: true, // 고정밀 GPS 사용
          timeout: 15000, // 15초 타임아웃
          maximumAge: 60000, // 1분간 캐시
        }
      );
    });
  }

  static async getCurrentLocation(): Promise<UserLocation | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log("Geolocation is not supported by this browser.");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const address = await this.reverseGeocode(latitude, longitude);
            resolve({
              latitude,
              longitude,
              address,
            });
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
            resolve({
              latitude,
              longitude,
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          resolve(null);
        },
        {
          enableHighAccuracy: true, // GPS 사용
          timeout: 15000, // 15초 타임아웃
          maximumAge: 60000, // 1분간 캐시 (더 자주 업데이트)
        }
      );
    });
  }

  private static async reverseGeocode(
    lat: number,
    lng: number
  ): Promise<string> {
    try {
      console.log(`🌍 LocationService에서 좌표 변환: ${lat}, ${lng}`);

      // NaverMapService의 새로운 reverseGeocode 메서드 사용
      const address = await NaverMapService.reverseGeocode(lat, lng);

      console.log(`✅ 주소 변환 성공: ${address}`);
      return address;
    } catch (error) {
      console.error("❌ NaverMapService reverseGeocode 실패:", error);
      // API 실패 시 기본 위치 추정 사용
      return this.fallbackReverseGeocode(lat, lng);
    }
  }

  private static fallbackReverseGeocode(lat: number, lng: number): string {
    // 네이버맵 API 실패 시 사용할 기본 위치 추정
    const koreaRegions = [
      // 서울
      { name: "서울시 강남구", lat: 37.5173, lng: 127.0473, range: 0.015 },
      { name: "서울시 강북구", lat: 37.6369, lng: 127.0256, range: 0.015 },
      { name: "서울시 강서구", lat: 37.5509, lng: 126.8495, range: 0.02 },
      { name: "서울시 관악구", lat: 37.4781, lng: 126.9515, range: 0.015 },
      { name: "서울시 광진구", lat: 37.5384, lng: 127.0822, range: 0.015 },
      { name: "서울시 구로구", lat: 37.4954, lng: 126.8874, range: 0.015 },
      { name: "서울시 금천구", lat: 37.4519, lng: 126.9018, range: 0.015 },
      { name: "서울시 노원구", lat: 37.6541, lng: 127.0568, range: 0.02 },
      { name: "서울시 도봉구", lat: 37.6688, lng: 127.0471, range: 0.015 },
      { name: "서울시 동대문구", lat: 37.5744, lng: 127.0396, range: 0.015 },
      { name: "서울시 동작구", lat: 37.5124, lng: 126.9393, range: 0.015 },
      { name: "서울시 마포구", lat: 37.5665, lng: 126.9016, range: 0.015 },
      { name: "서울시 서대문구", lat: 37.5794, lng: 126.9368, range: 0.015 },
      { name: "서울시 서초구", lat: 37.4837, lng: 127.0324, range: 0.015 },
      { name: "서울시 성동구", lat: 37.5636, lng: 127.0369, range: 0.015 },
      { name: "서울시 성북구", lat: 37.5894, lng: 127.0167, range: 0.015 },
      { name: "서울시 송파구", lat: 37.5145, lng: 127.1059, range: 0.015 },
      { name: "서울시 양천구", lat: 37.5168, lng: 126.8665, range: 0.015 },
      { name: "서울시 영등포구", lat: 37.5264, lng: 126.8962, range: 0.015 },
      { name: "서울시 용산구", lat: 37.5384, lng: 126.9654, range: 0.015 },
      { name: "서울시 은평구", lat: 37.6176, lng: 126.9227, range: 0.015 },
      { name: "서울시 종로구", lat: 37.5735, lng: 126.979, range: 0.015 },
      { name: "서울시 중구", lat: 37.5636, lng: 126.997, range: 0.015 },
      { name: "서울시 중랑구", lat: 37.6063, lng: 127.0925, range: 0.015 },

      // 경기도 주요 지역
      { name: "경기도 수원시", lat: 37.2636, lng: 127.0286, range: 0.03 },
      { name: "경기도 성남시", lat: 37.4449, lng: 127.1388, range: 0.03 },
      { name: "경기도 고양시", lat: 37.6584, lng: 126.832, range: 0.03 },
      { name: "경기도 용인시", lat: 37.2411, lng: 127.1776, range: 0.03 },
      { name: "경기도 부천시", lat: 37.5036, lng: 126.766, range: 0.02 },
      { name: "경기도 안산시", lat: 37.3219, lng: 126.8309, range: 0.02 },
      { name: "경기도 안양시", lat: 37.3943, lng: 126.9568, range: 0.02 },
      { name: "경기도 남양주시", lat: 37.636, lng: 127.2165, range: 0.03 },

      // 인천
      { name: "인천시 중구", lat: 37.4738, lng: 126.6216, range: 0.02 },
      { name: "인천시 남동구", lat: 37.4467, lng: 126.7313, range: 0.02 },
      { name: "인천시 연수구", lat: 37.4138, lng: 126.6778, range: 0.02 },
    ];

    let closestRegion = koreaRegions[0];
    let minDistance = Infinity;

    for (const region of koreaRegions) {
      const distance = Math.sqrt(
        Math.pow(lat - region.lat, 2) + Math.pow(lng - region.lng, 2)
      );
      if (distance < minDistance && distance <= region.range) {
        minDistance = distance;
        closestRegion = region;
      }
    }

    return closestRegion.name;
  }
}
