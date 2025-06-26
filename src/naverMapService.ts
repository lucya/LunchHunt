import axios from "axios";

export interface NaverPlacePhoto {
  photoUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

export interface NaverPlaceDetails {
  id: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  photos: NaverPlacePhoto[];
  category: string;
}

export class NaverMapService {
  private static readonly CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
  private static readonly CLIENT_SECRET = import.meta.env
    .VITE_NAVER_CLIENT_SECRET;
  private static readonly BASE_URL = "/api/naver/v1"; // 프록시 사용

  // 음식점 검색
  static async searchRestaurant(
    query: string,
    location?: string
  ): Promise<NaverPlaceDetails[]> {
    try {
      const searchQuery = location ? `${query} ${location}` : query;

      const response = await axios.get(`${this.BASE_URL}/search/local.json`, {
        headers: {
          "X-Naver-Client-Id": this.CLIENT_ID,
          "X-Naver-Client-Secret": this.CLIENT_SECRET,
        },
        params: {
          query: searchQuery,
          display: 5, // 최대 5개 결과
          start: 1,
          sort: "random", // 랜덤 정렬
          category: "음식점",
        },
      });

      const items = response.data.items || [];
      console.log("🔍 네이버 지도 검색 결과:", items.length, "개");

      // 각 음식점에 대해 상세 정보와 사진 가져오기
      const detailedResults = await Promise.all(
        items.map(async (item: any) => {
          const photos = await this.getPlacePhotos(item.title, item.address);
          return {
            id: item.link || `${item.title}_${item.address}`,
            name: this.cleanHtmlTags(item.title),
            address: item.address,
            phone: item.telephone,
            rating: item.rating ? parseFloat(item.rating) : undefined,
            photos: photos,
            category: item.category,
          };
        })
      );

      return detailedResults;
    } catch (error) {
      console.error("❌ 네이버 지도 검색 실패:", error);
      return [];
    }
  }

  // 음식점 사진 가져오기 (네이버 이미지 검색 API 사용)
  private static async getPlacePhotos(
    restaurantName: string,
    address: string
  ): Promise<NaverPlacePhoto[]> {
    try {
      const cleanName = this.cleanHtmlTags(restaurantName);
      console.log(`🔍 ${cleanName} 사진 검색 시작...`);

      const response = await axios.get(`${this.BASE_URL}/search/image`, {
        headers: {
          "X-Naver-Client-Id": this.CLIENT_ID,
          "X-Naver-Client-Secret": this.CLIENT_SECRET,
        },
        params: {
          query: cleanName, // 음식점 이름으로 직접 검색
          display: 10, // 더 많은 결과
          start: 1,
          sort: "sim", // 정확도순
          filter: "large", // 큰 이미지만
        },
      });

      const items = response.data.items || [];

      if (items.length > 0) {
        console.log(`📸 ${cleanName} 사진 발견! 결과: ${items.length}개`);

        // 첫 3개 이미지 반환
        return items.slice(0, 3).map((item: any) => ({
          photoUrl: item.link,
          thumbnailUrl: item.thumbnail,
          width: parseInt(item.sizewidth) || 400,
          height: parseInt(item.sizeheight) || 300,
        }));
      }

      console.log(`❌ ${cleanName} 사진을 찾을 수 없음`);
      return [];
    } catch (error) {
      console.error(`❌ ${restaurantName} 사진 검색 실패:`, error);
      return [];
    }
  }

  // HTML 태그 제거
  private static cleanHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, "");
  }

  // 좌표를 주소로 변환 (Reverse Geocoding)
  static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<string> {
    try {
      console.log(`🌍 좌표를 주소로 변환 시작: ${latitude}, ${longitude}`);

      const response = await axios.get(
        `${this.BASE_URL}/map-reversegeocode/v2/gc`,
        {
          headers: {
            "X-Naver-Client-Id": this.CLIENT_ID,
            "X-Naver-Client-Secret": this.CLIENT_SECRET,
          },
          params: {
            coords: `${longitude},${latitude}`, // 네이버 API는 경도,위도 순서
            sourcecrs: "epsg:4326",
            targetcrs: "epsg:4326",
            orders: "roadaddr,addr", // 도로명 주소 우선, 지번 주소 백업
          },
        }
      );

      const data = response.data;
      console.log("🗺️ 네이버 Reverse Geocoding 응답:", data);

      if (data.status.code === 0 && data.results && data.results.length > 0) {
        const result = data.results[0];
        const region = result.region;

        // 도로명 주소가 있으면 우선 사용
        if (result.land && result.land.name) {
          const roadAddr = result.land;
          const fullAddress = `${region.area1.name} ${region.area2.name} ${
            roadAddr.name
          }${roadAddr.number1 ? " " + roadAddr.number1 : ""}${
            roadAddr.number2 ? "-" + roadAddr.number2 : ""
          }`;

          console.log("✅ 도로명 주소 발견:", fullAddress);
          return fullAddress;
        }

        // 도로명 주소가 없으면 지번 주소 사용
        const jibunAddress = `${region.area1.name} ${region.area2.name} ${
          region.area3.name
        }${region.area4.name ? " " + region.area4.name : ""}`;

        console.log("✅ 지번 주소 사용:", jibunAddress);
        return jibunAddress;
      } else {
        throw new Error(`네이버 API 응답 오류: ${data.status.name}`);
      }
    } catch (error) {
      console.error("❌ 네이버 Reverse Geocoding 실패:", error);

      // API 실패 시 기본 주소 추정
      return this.fallbackAddressEstimation(latitude, longitude);
    }
  }

  // API 실패 시 기본 주소 추정
  private static fallbackAddressEstimation(lat: number, lng: number): string {
    console.log("🔄 기본 주소 추정 모드 사용");

    // 한국의 주요 지역 좌표와 주소 매핑
    const koreaRegions = [
      // 서울 25개 구
      { name: "서울시 강남구", lat: 37.5173, lng: 127.0473, range: 0.02 },
      { name: "서울시 강동구", lat: 37.5301, lng: 127.1238, range: 0.02 },
      { name: "서울시 강북구", lat: 37.6369, lng: 127.0256, range: 0.02 },
      { name: "서울시 강서구", lat: 37.5509, lng: 126.8495, range: 0.025 },
      { name: "서울시 관악구", lat: 37.4781, lng: 126.9515, range: 0.02 },
      { name: "서울시 광진구", lat: 37.5384, lng: 127.0822, range: 0.02 },
      { name: "서울시 구로구", lat: 37.4954, lng: 126.8874, range: 0.02 },
      { name: "서울시 금천구", lat: 37.4519, lng: 126.9018, range: 0.02 },
      { name: "서울시 노원구", lat: 37.6541, lng: 127.0568, range: 0.025 },
      { name: "서울시 도봉구", lat: 37.6688, lng: 127.0471, range: 0.02 },
      { name: "서울시 동대문구", lat: 37.5744, lng: 127.0396, range: 0.02 },
      { name: "서울시 동작구", lat: 37.5124, lng: 126.9393, range: 0.02 },
      { name: "서울시 마포구", lat: 37.5665, lng: 126.9016, range: 0.02 },
      { name: "서울시 서대문구", lat: 37.5794, lng: 126.9368, range: 0.02 },
      { name: "서울시 서초구", lat: 37.4837, lng: 127.0324, range: 0.02 },
      { name: "서울시 성동구", lat: 37.5636, lng: 127.0369, range: 0.02 },
      { name: "서울시 성북구", lat: 37.5894, lng: 127.0167, range: 0.02 },
      { name: "서울시 송파구", lat: 37.5145, lng: 127.1059, range: 0.02 },
      { name: "서울시 양천구", lat: 37.5168, lng: 126.8665, range: 0.02 },
      { name: "서울시 영등포구", lat: 37.5264, lng: 126.8962, range: 0.02 },
      { name: "서울시 용산구", lat: 37.5384, lng: 126.9654, range: 0.02 },
      { name: "서울시 은평구", lat: 37.6176, lng: 126.9227, range: 0.02 },
      { name: "서울시 종로구", lat: 37.5735, lng: 126.979, range: 0.02 },
      { name: "서울시 중구", lat: 37.5636, lng: 126.997, range: 0.02 },
      { name: "서울시 중랑구", lat: 37.6063, lng: 127.0925, range: 0.02 },

      // 경기도 주요 도시
      {
        name: "경기도 수원시 영통구",
        lat: 37.2636,
        lng: 127.0286,
        range: 0.03,
      },
      {
        name: "경기도 성남시 분당구",
        lat: 37.4449,
        lng: 127.1388,
        range: 0.03,
      },
      {
        name: "경기도 고양시 일산동구",
        lat: 37.6584,
        lng: 126.832,
        range: 0.03,
      },
      {
        name: "경기도 용인시 기흥구",
        lat: 37.2411,
        lng: 127.1776,
        range: 0.03,
      },
      { name: "경기도 부천시", lat: 37.5036, lng: 126.766, range: 0.025 },
      {
        name: "경기도 안산시 단원구",
        lat: 37.3219,
        lng: 126.8309,
        range: 0.025,
      },
      {
        name: "경기도 안양시 동안구",
        lat: 37.3943,
        lng: 126.9568,
        range: 0.025,
      },
      { name: "경기도 남양주시", lat: 37.636, lng: 127.2165, range: 0.03 },

      // 인천
      { name: "인천시 중구", lat: 37.4738, lng: 126.6216, range: 0.025 },
      { name: "인천시 남동구", lat: 37.4467, lng: 126.7313, range: 0.025 },
      { name: "인천시 연수구", lat: 37.4138, lng: 126.6778, range: 0.025 },
      { name: "인천시 서구", lat: 37.5456, lng: 126.6769, range: 0.025 },

      // 기타 주요 도시
      { name: "부산시 해운대구", lat: 35.1595, lng: 129.1625, range: 0.03 },
      { name: "대구시 중구", lat: 35.8714, lng: 128.601, range: 0.03 },
      { name: "대전시 유성구", lat: 36.362, lng: 127.356, range: 0.03 },
      { name: "광주시 서구", lat: 35.1595, lng: 126.8526, range: 0.03 },
    ];

    let closestRegion = { name: "서울시 중구", distance: Infinity };

    for (const region of koreaRegions) {
      const distance = Math.sqrt(
        Math.pow(lat - region.lat, 2) + Math.pow(lng - region.lng, 2)
      );

      if (distance <= region.range && distance < closestRegion.distance) {
        closestRegion = { name: region.name, distance };
      }
    }

    console.log(`📍 추정된 주소: ${closestRegion.name}`);
    return closestRegion.name;
  }

  // 음식점 이름으로 대표 사진 1개 가져오기 (개선된 버전)
  static async getRestaurantMainPhoto(
    restaurantName: string,
    location?: string
  ): Promise<string | null> {
    try {
      console.log(`🔍 ${restaurantName} 대표 사진 검색 시작...`);

      const cleanName = this.cleanHtmlTags(restaurantName);
      const locationText = location || "";

      const response = await axios.get(`${this.BASE_URL}/search/image`, {
        headers: {
          "X-Naver-Client-Id": this.CLIENT_ID,
          "X-Naver-Client-Secret": this.CLIENT_SECRET,
        },
        params: {
          query: cleanName, // 음식점 이름으로 직접 검색
          display: 5,
          start: 1,
          sort: "sim", // 정확도순
          filter: "large", // 고품질 이미지
        },
      });

      const items = response.data.items || [];

      if (items.length > 0) {
        console.log(`✅ ${cleanName} 대표 사진 발견! 결과: ${items.length}개`);
        return items[0].link; // 첫 번째 이미지 반환
      }

      console.log(`❌ ${cleanName} 사진을 찾을 수 없음`);
      return null;
    } catch (error) {
      console.error(`❌ ${restaurantName} 사진 검색 실패:`, error);
      return null;
    }
  }

  // 음식점 정보 업데이트 (사진 포함)
  static async enrichRestaurantWithPhoto(restaurant: {
    name: string;
    location?: string;
    imageUrl?: string;
  }): Promise<{ name: string; location?: string; imageUrl?: string }> {
    try {
      // 이미 사진이 있으면 건너뛰기
      if (restaurant.imageUrl && restaurant.imageUrl !== "") {
        return restaurant;
      }

      const photoUrl = await this.getRestaurantMainPhoto(
        restaurant.name,
        restaurant.location
      );

      return {
        ...restaurant,
        imageUrl: photoUrl || restaurant.imageUrl || "",
      };
    } catch (error) {
      console.error(`❌ ${restaurant.name} 사진 업데이트 실패:`, error);
      return restaurant;
    }
  }
}
