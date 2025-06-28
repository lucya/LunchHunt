const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정 - 프로덕션과 개발 환경 모두 지원
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? true // 프로덕션에서는 같은 도메인이므로 모든 origin 허용
      : ["http://localhost:5173", "http://localhost:3000"], // 개발환경
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// 프로덕션 환경에서 정적 파일 서빙
if (process.env.NODE_ENV === "production") {
  // 빌드된 React 앱의 정적 파일들 서빙
  app.use(express.static(path.join(__dirname, "dist")));

  console.log("📦 프로덕션 모드: 정적 파일 서빙 설정됨");
}

// 네이버 API 프록시 라우트들
app.get("/api/naver/v1/search/local.json", async (req, res) => {
  try {
    console.log("🔍 네이버 로컬 검색 API 프록시 요청:", req.query);

    const response = await axios.get(
      "https://openapi.naver.com/v1/search/local.json",
      {
        headers: {
          "X-Naver-Client-Id": process.env.VITE_NAVER_CLIENT_ID,
          "X-Naver-Client-Secret": process.env.VITE_NAVER_CLIENT_SECRET,
          "User-Agent": "Mozilla/5.0 (compatible; LunchHunt/1.0)",
        },
        params: req.query,
      }
    );

    console.log(
      "✅ 네이버 로컬 검색 성공, 결과:",
      response.data.items?.length || 0,
      "개"
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      "❌ 네이버 로컬 검색 실패:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: "네이버 로컬 검색 실패",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/api/naver/v1/search/image", async (req, res) => {
  try {
    console.log("🖼️ 네이버 이미지 검색 API 프록시 요청:", req.query);

    const response = await axios.get(
      "https://openapi.naver.com/v1/search/image",
      {
        headers: {
          "X-Naver-Client-Id": process.env.VITE_NAVER_CLIENT_ID,
          "X-Naver-Client-Secret": process.env.VITE_NAVER_CLIENT_SECRET,
          "User-Agent": "Mozilla/5.0 (compatible; LunchHunt/1.0)",
        },
        params: req.query,
      }
    );

    console.log(
      "✅ 네이버 이미지 검색 성공, 결과:",
      response.data.items?.length || 0,
      "개"
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      "❌ 네이버 이미지 검색 실패:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: "네이버 이미지 검색 실패",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/api/naver/v1/map-reversegeocode/v2/gc", async (req, res) => {
  try {
    console.log("🗺️ 네이버 Reverse Geocoding API 프록시 요청:", req.query);

    const response = await axios.get(
      "https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc",
      {
        headers: {
          "X-Naver-Client-Id": process.env.VITE_NAVER_CLIENT_ID,
          "X-Naver-Client-Secret": process.env.VITE_NAVER_CLIENT_SECRET,
          "User-Agent": "Mozilla/5.0 (compatible; LunchHunt/1.0)",
        },
        params: req.query,
      }
    );

    console.log("✅ 네이버 Reverse Geocoding 성공");
    res.json(response.data);
  } catch (error) {
    console.error(
      "❌ 네이버 Reverse Geocoding 실패:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: "네이버 Reverse Geocoding 실패",
      details: error.response?.data || error.message,
    });
  }
});

// 헬스 체크
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "LunchHunt Backend Server is running!",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// 프로덕션 환경에서 SPA 라우팅 지원 (React Router)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    // API 경로가 아닌 모든 요청을 React 앱으로 리다이렉트
    if (!req.path.startsWith("/api/")) {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    } else {
      res.status(404).json({ error: "API endpoint not found" });
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 LunchHunt Server running on http://localhost:${PORT}`);
  console.log(`📡 네이버 API 프록시 서버 준비 완료!`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

  if (process.env.NODE_ENV === "production") {
    console.log(`📦 정적 파일 서빙: ${path.join(__dirname, "dist")}`);
  }
});
