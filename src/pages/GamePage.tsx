import React, { useState, useEffect } from "react";
import {
  GeminiRecommender,
  LocationService,
  UserLocation,
} from "../aiRecommender.ts";
import { MOODS, FOOD_TYPES, BUDGETS } from "../constants";

interface Answer {
  questionId: string;
  value: string;
}

interface FoodRecommendation {
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

const GamePage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>(
    []
  );
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "loading" | "granted" | "denied" | "unavailable"
  >("loading");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualLocation, setManualLocation] = useState("");

  useEffect(() => {
    // 컴포넌트 마운트 시 위치 정보 요청
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      setLocationStatus("loading");
      console.log("🌍 상세 위치 정보 요청 중...");

      // 새로운 상세 위치 정보 메서드 사용
      const locationData = await LocationService.getCurrentLocationDetailed();

      if (locationData.location) {
        setUserLocation(locationData.location);

        setLocationStatus("granted");
        console.log("📍 상세 위치 정보 획득:", {
          location: locationData.location,
          accuracy: `${locationData.accuracy}m`,
          source: locationData.source,
          timestamp: new Date(locationData.timestamp).toLocaleString(),
        });
      } else {
        setLocationStatus("denied");
        console.log("📍 위치 정보 사용 불가");
      }
    } catch (error) {
      console.error("위치 정보 요청 실패:", error);
      setLocationStatus("unavailable");
    }
  };

  const handleLocationChange = () => {
    setShowLocationModal(true);
  };

  const handleManualLocationSubmit = () => {
    if (manualLocation.trim()) {
      const newLocation: UserLocation = {
        latitude: 0, // 수동 입력시에는 좌표가 없음
        longitude: 0,
        address: manualLocation.trim(),
      };
      setUserLocation(newLocation);
      setLocationStatus("granted");
      setShowLocationModal(false);
      setManualLocation("");
      console.log("📍 수동 위치 설정:", newLocation);
    }
  };

  const getQuickLocationOptions = () => [
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
    "관악구 신림동",
    "동작구 사당동",
  ];

  const handleQuickLocation = (location: string) => {
    const newLocation: UserLocation = {
      latitude: 0,
      longitude: 0,
      address: location,
    };
    setUserLocation(newLocation);
    setLocationStatus("granted");
    setShowLocationModal(false);
    console.log("📍 빠른 위치 설정:", newLocation);
  };

  const handleMoodSelect = (mood: string) => {
    setAnswers([{ questionId: "mood", value: mood }]);
    setStep(2);
  };

  const handleFoodTypeSelect = (food: string) => {
    setAnswers((prev) => [...prev, { questionId: "foodType", value: food }]);
    setStep(3);
  };

  const handleBudgetSelect = async (budget: string) => {
    const finalAnswers = [...answers, { questionId: "budget", value: budget }];
    setAnswers(finalAnswers);
    setIsLoading(true);

    try {
      const ai = new GeminiRecommender();
      // 위치 정보를 Gemini AI 추천에 전달
      const recs = await ai.generateRecommendations(
        finalAnswers,
        userLocation || undefined
      );
      setRecommendations(recs);
      setStep(4);
    } catch (error) {
      console.error("Gemini AI 추천 실패:", error);
      alert("추천 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setStep(1);
    setAnswers([]);
    setRecommendations([]);
  };

  const generateNaverMapUrl = (
    rec: FoodRecommendation,
    isDirections: boolean = false
  ) => {
    if (isDirections && userLocation && rec.latitude && rec.longitude) {
      // 길찾기 모드 - 현재 위치에서 목적지까지
      return `https://map.naver.com/v5/directions/${userLocation.longitude},${
        userLocation.latitude
      },,/${rec.longitude},${rec.latitude},${encodeURIComponent(
        rec.name
      )},/-/transit?c=${rec.longitude},${rec.latitude},15,0,0,0,dh`;
    } else if (rec.latitude && rec.longitude) {
      // 음식점 좌표가 있는 경우 - 해당 위치로 직접 이동
      return `https://map.naver.com/v5/search/${encodeURIComponent(
        rec.name
      )}?c=${rec.longitude},${rec.latitude},15,0,0,0,dh`;
    } else if (rec.location) {
      // 주소만 있는 경우 - 주소로 검색
      return `https://map.naver.com/v5/search/${encodeURIComponent(
        rec.location + " " + rec.name
      )}`;
    } else {
      // 기본 검색
      return `https://map.naver.com/v5/search/${encodeURIComponent(rec.name)}`;
    }
  };

  const handleDistanceClick = (rec: FoodRecommendation) => {
    const mapUrl = generateNaverMapUrl(rec, false);
    window.open(mapUrl, "_blank");
  };

  const handleDirectionsClick = (rec: FoodRecommendation) => {
    const directionsUrl = generateNaverMapUrl(rec, true);
    window.open(directionsUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#f3f4f6",
        }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "1rem" }}>
          🤖 Gemini AI가 맞춤 추천 중...
        </h2>
        <p style={{ fontSize: "1.2rem", color: "#666", textAlign: "center" }}>
          {userLocation
            ? `${
                userLocation.address || "현재 위치"
              } 근처 맛집을 Gemini AI가 분석하고 있습니다`
            : "Gemini AI가 맛집 정보를 분석하고 있습니다"}
        </p>
        {userLocation && (
          <p style={{ fontSize: "1rem", color: "#888", marginTop: "0.5rem" }}>
            📍 위치:{" "}
            {userLocation.address ||
              `${userLocation.latitude.toFixed(
                4
              )}, ${userLocation.longitude.toFixed(4)}`}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="game-container"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f4f6",
        padding: "2rem",
      }}>
      {/* 위치 정보 상태 표시 */}
      <div
        className="location-status"
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          background: "#fff",
          padding: "0.75rem 1rem",
          borderRadius: "1rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          fontSize: "0.9rem",
          zIndex: 1000,
          minWidth: "200px",
          maxWidth: "calc(100vw - 2rem)",
          width: "auto",
        }}>
        {locationStatus === "loading" && "📍 위치 확인 중..."}
        {locationStatus === "granted" && userLocation && (
          <div style={{ color: "#10b981" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: "500" }}>
              📍 {userLocation.address || "위치 확인됨"}
            </div>

            <div
              style={{ marginTop: "0.3rem", display: "flex", gap: "0.5rem" }}>
              <button
                onClick={requestLocation}
                style={{
                  background: "none",
                  border: "none",
                  color: "#10b981",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "0.8rem",
                }}>
                🔄 새로고침
              </button>
              <button
                onClick={handleLocationChange}
                style={{
                  background: "none",
                  border: "none",
                  color: "#3b82f6",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "0.8rem",
                }}>
                📝 변경
              </button>
            </div>
          </div>
        )}
        {locationStatus === "denied" && (
          <span style={{ color: "#f59e0b" }}>
            📍 위치 사용 안함
            <button
              onClick={requestLocation}
              style={{
                marginLeft: "0.5rem",
                background: "none",
                border: "none",
                color: "#3b82f6",
                cursor: "pointer",
                textDecoration: "underline",
              }}>
              재시도
            </button>
            <button
              onClick={handleLocationChange}
              style={{
                marginLeft: "0.5rem",
                background: "none",
                border: "none",
                color: "#10b981",
                cursor: "pointer",
                textDecoration: "underline",
              }}>
              수동설정
            </button>
          </span>
        )}
        {locationStatus === "unavailable" && (
          <span style={{ color: "#ef4444" }}>📍 위치 서비스 불가</span>
        )}
      </div>

      {step === 1 && (
        <>
          <h2
            className="question-title"
            style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "1rem" }}>
            Q1. 오늘 기분은 어떤가요?
          </h2>
          {userLocation && (
            <p
              style={{ fontSize: "1rem", color: "#666", marginBottom: "1rem" }}>
              📍 {userLocation.address || "현재 위치"} 근처 맛집을
              추천해드릴게요!
              <button
                onClick={handleLocationChange}
                style={{
                  marginLeft: "0.5rem",
                  background: "none",
                  border: "none",
                  color: "#3b82f6",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "0.9rem",
                }}>
                (위치 변경)
              </button>
            </p>
          )}
          {!userLocation && (
            <p
              style={{ fontSize: "1rem", color: "#666", marginBottom: "1rem" }}>
              위치를 설정하시면 더 정확한 맛집을 추천해드릴 수 있어요!
              <button
                onClick={handleLocationChange}
                style={{
                  marginLeft: "0.5rem",
                  background: "none",
                  border: "none",
                  color: "#10b981",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "0.9rem",
                }}>
                위치 설정하기
              </button>
            </p>
          )}
          <div
            className="button-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
              maxWidth: "800px",
              width: "100%",
            }}>
            {MOODS.map((mood) => (
              <button
                key={mood}
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1.1rem",
                  borderRadius: "1.5rem",
                  border: "1px solid #ccc",
                  background: "#fff",
                  color: "#333",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => handleMoodSelect(mood)}>
                {mood}
              </button>
            ))}
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <h2
            className="question-title"
            style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "2rem" }}>
            Q2. 어떤 종류의 음식을 원하시나요?
          </h2>
          <div
            className="button-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "1rem",
              maxWidth: "1000px",
              width: "100%",
            }}>
            {FOOD_TYPES.map((food) => (
              <button
                key={food}
                style={{
                  padding: "1rem 1.5rem",
                  fontSize: "1rem",
                  borderRadius: "1.5rem",
                  border: "1px solid #ccc",
                  background: "#fff",
                  color: "#333",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => handleFoodTypeSelect(food)}>
                {food}
              </button>
            ))}
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <h2
            className="question-title"
            style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "2rem" }}>
            Q3. 예산은 얼마정도인가요?
          </h2>
          <div
            className="button-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
              maxWidth: "800px",
              width: "100%",
            }}>
            {BUDGETS.map((budget) => (
              <button
                key={budget}
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1.1rem",
                  borderRadius: "1.5rem",
                  border: "1px solid #ccc",
                  background: "#fff",
                  color: "#333",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => handleBudgetSelect(budget)}>
                {budget}
              </button>
            ))}
          </div>
        </>
      )}
      {step === 4 && (
        <>
          <h2
            className="question-title"
            style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "2rem" }}>
            📍 위치 기반 AI 추천
          </h2>
          {recommendations.length > 0 && (
            <div
              className="recommendation-grid"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
                maxWidth: "900px",
                width: "100%",
              }}>
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  style={{
                    background: "#fff",
                    borderRadius: "1.5rem",
                    border: "1px solid #ddd",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}>
                  <div
                    className="restaurant-card"
                    style={{ display: "flex", flexDirection: "row" }}>
                    {/* 음식 이미지 */}
                    <div
                      className="restaurant-image"
                      style={{
                        width: "300px",
                        height: "250px",
                        position: "relative",
                        flexShrink: 0,
                      }}>
                      <img
                        src={rec.imageUrl}
                        alt={rec.foodType || rec.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          // 단계별 대체 이미지 시도
                          const currentSrc = e.currentTarget.src;
                          console.log("❌ 이미지 로딩 실패:", currentSrc);

                          if (currentSrc.includes("picsum.photos")) {
                            // 첫 번째 대체: placeholder 이미지
                            e.currentTarget.src = `https://via.placeholder.com/300x250/4F46E5/FFFFFF?text=${encodeURIComponent(
                              rec.foodType || "음식"
                            )}`;
                          } else if (
                            currentSrc.includes("via.placeholder.com") &&
                            currentSrc.includes("4F46E5")
                          ) {
                            // 두 번째 대체: 다른 색상 placeholder
                            e.currentTarget.src = `https://via.placeholder.com/300x250/FF6B6B/FFFFFF?text=${encodeURIComponent(
                              "맛집"
                            )}`;
                          } else {
                            // 최종 대체: CSS 배경으로 교체
                            e.currentTarget.style.display = "none";
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div style="
                                  width: 100%;
                                  height: 100%;
                                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                  color: white;
                                  font-size: 1.2rem;
                                  font-weight: 600;
                                  text-align: center;
                                  flex-direction: column;
                                ">
                                  <div style="font-size: 2rem; margin-bottom: 0.5rem;">🍽️</div>
                                  <div>${rec.foodType || "맛집"}</div>
                                </div>
                              `;
                            }
                          }
                        }}
                        onLoad={() => {
                          // 이미지 로딩 성공 시 로그
                          console.log(`✅ 이미지 로딩 성공: ${rec.name}`);
                        }}
                      />
                      {/* 음식 종류 배지 */}
                      {rec.foodType && (
                        <div
                          style={{
                            position: "absolute",
                            top: "1rem",
                            left: "1rem",
                            background: "rgba(0, 0, 0, 0.7)",
                            color: "#fff",
                            padding: "0.5rem 1rem",
                            borderRadius: "1.5rem",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}>
                          {rec.foodType}
                        </div>
                      )}
                      {/* 평점 배지 */}
                      {rec.rating && (
                        <div
                          style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            background: "#fbbf24",
                            color: "#92400e",
                            padding: "0.5rem 1rem",
                            borderRadius: "1.5rem",
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}>
                          ⭐ {rec.rating}
                        </div>
                      )}
                    </div>

                    {/* 정보 섹션 */}
                    <div
                      className="restaurant-content"
                      style={{ flex: 1, padding: "2rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "1rem",
                        }}>
                        <div>
                          {rec.title && (
                            <div
                              style={{
                                fontSize: "1rem",
                                color: "#6b7280",
                                marginBottom: "0.25rem",
                                fontWeight: 500,
                              }}>
                              {rec.title}
                            </div>
                          )}
                          <h3
                            style={{
                              fontSize: "1.75rem",
                              fontWeight: 700,
                              marginBottom: "0.5rem",
                              color: "#1f2937",
                            }}>
                            {index + 1}. {rec.name}
                          </h3>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                          }}>
                          {rec.distance && (
                            <span
                              onClick={() => handleDistanceClick(rec)}
                              style={{
                                background: "#10b981",
                                color: "#fff",
                                padding: "0.3rem 0.8rem",
                                borderRadius: "1rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#059669";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 8px rgba(16, 185, 129, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#10b981";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                  "0 2px 4px rgba(16, 185, 129, 0.2)";
                              }}
                              title="클릭하면 네이버 지도에서 위치를 확인할 수 있어요!">
                              🗺️ 현재 위치에서 {rec.distance}
                            </span>
                          )}
                          {rec.rating && (
                            <span
                              style={{
                                background: "#f59e0b",
                                color: "#fff",
                                padding: "0.3rem 0.8rem",
                                borderRadius: "1rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                              }}>
                              ⭐ {rec.rating}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 추천 이유 */}
                      <div
                        style={{
                          background: "#f8f9ff",
                          padding: "1.5rem",
                          borderRadius: "1rem",
                          marginBottom: "1.5rem",
                          border: "1px solid #e0e7ff",
                        }}>
                        <h4
                          style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "#4f46e5",
                            marginBottom: "0.5rem",
                          }}>
                          🤖 AI 추천 이유
                        </h4>
                        <p
                          style={{
                            fontSize: "1rem",
                            color: "#4b5563",
                            lineHeight: "1.6",
                            margin: 0,
                          }}>
                          {rec.reason}
                        </p>
                      </div>

                      {/* 상세 정보 */}
                      <div
                        className="info-grid"
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: "1rem",
                          fontSize: "0.9rem",
                          color: "#6b7280",
                        }}>
                        {rec.location && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "0.5rem",
                              padding: "0.75rem",
                              background: "#f0f9ff",
                              borderRadius: "0.75rem",
                              border: "1px solid #e0f2fe",
                            }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}>
                              <span style={{ fontSize: "1.1rem" }}>📍</span>
                              <div>
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#64748b",
                                  }}>
                                  위치
                                </div>
                                <div
                                  style={{ fontWeight: 600, color: "#0369a1" }}>
                                  {rec.location}
                                </div>
                              </div>
                            </div>
                            {userLocation && rec.latitude && rec.longitude && (
                              <button
                                onClick={() => handleDirectionsClick(rec)}
                                style={{
                                  background: "#3b82f6",
                                  color: "#fff",
                                  border: "none",
                                  padding: "0.4rem 0.8rem",
                                  borderRadius: "0.5rem",
                                  fontSize: "0.8rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#2563eb";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "#3b82f6";
                                }}
                                title="네이버 지도에서 길찾기">
                                🧭 길찾기
                              </button>
                            )}
                          </div>
                        )}
                        {rec.price && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.75rem",
                              background: "#f0fdf4",
                              borderRadius: "0.75rem",
                              border: "1px solid #dcfce7",
                            }}>
                            <span style={{ fontSize: "1.1rem" }}>💰</span>
                            <div>
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#64748b",
                                }}>
                                예상 가격
                              </div>
                              <div
                                style={{ fontWeight: 600, color: "#15803d" }}>
                                {rec.price}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 에러 상태 */}
          {recommendations.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem 0" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😅</div>
              <p
                style={{
                  fontSize: "1.25rem",
                  color: "#666",
                  marginBottom: "1rem",
                }}>
                추천 결과를 가져오는데 문제가 발생했어요
              </p>
              <p style={{ color: "#999", marginBottom: "2rem" }}>
                잠시 후 다시 시도해주세요
              </p>
            </div>
          )}

          {/* 다시 시작 버튼 */}
          <button
            style={{
              padding: "1rem 2.5rem",
              fontSize: "1.2rem",
              fontWeight: 600,
              borderRadius: "2rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              marginTop: "2rem",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              transition: "all 0.3s ease",
            }}
            onClick={handleRestart}>
            🔄 다른 추천 받기
          </button>
        </>
      )}

      {/* 위치 설정 모달 */}
      {showLocationModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}>
          <div
            className="modal-content"
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "1rem",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                marginBottom: "1rem",
              }}>
              📍 위치 설정
            </h3>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                }}>
                직접 입력:
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="예: 강남구 역삼동"
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                  }}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleManualLocationSubmit()
                  }
                />
                <button
                  onClick={handleManualLocationSubmit}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}>
                  설정
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                }}>
                빠른 선택:
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "0.5rem",
                }}>
                {getQuickLocationOptions().map((location) => (
                  <button
                    key={location}
                    onClick={() => handleQuickLocation(location)}
                    style={{
                      padding: "0.75rem",
                      background: "#f3f4f6",
                      border: "1px solid #ddd",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      transition: "all 0.2s",
                    }}>
                    {location}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={requestLocation}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontWeight: 500,
                }}>
                🎯 GPS로 재탐지
              </button>
              <button
                onClick={() => setShowLocationModal(false)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "#6b7280",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontWeight: 500,
                }}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
