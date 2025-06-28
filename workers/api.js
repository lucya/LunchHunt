// Cloudflare Workers용 API 핸들러
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS 헤더 설정
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Naver-Client-Id, X-Naver-Client-Secret",
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 네이버 로컬 검색 API 프록시
      if (url.pathname.startsWith("/api/naver/v1/search/local.json")) {
        return await handleNaverLocalSearch(request, env, corsHeaders);
      }

      // 네이버 이미지 검색 API 프록시
      if (url.pathname.startsWith("/api/naver/v1/search/image")) {
        return await handleNaverImageSearch(request, env, corsHeaders);
      }

      // 네이버 Reverse Geocoding API 프록시
      if (url.pathname.startsWith("/api/naver/v1/map-reversegeocode/v2/gc")) {
        return await handleNaverReverseGeocode(request, env, corsHeaders);
      }

      // 헬스 체크
      if (url.pathname === "/api/health") {
        return new Response(
          JSON.stringify({
            status: "OK",
            message: "LunchHunt Cloudflare Workers API is running!",
            environment: "production",
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

// 네이버 로컬 검색 API 핸들러
async function handleNaverLocalSearch(request, env, corsHeaders) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const naverUrl = new URL("https://openapi.naver.com/v1/search/local.json");

  // 쿼리 파라미터 복사
  for (const [key, value] of searchParams) {
    naverUrl.searchParams.set(key, value);
  }

  const response = await fetch(naverUrl.toString(), {
    headers: {
      "X-Naver-Client-Id": env.VITE_NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": env.VITE_NAVER_CLIENT_SECRET,
      "User-Agent": "Mozilla/5.0 (compatible; LunchHunt/1.0)",
    },
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// 네이버 이미지 검색 API 핸들러
async function handleNaverImageSearch(request, env, corsHeaders) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const naverUrl = new URL("https://openapi.naver.com/v1/search/image");

  // 쿼리 파라미터 복사
  for (const [key, value] of searchParams) {
    naverUrl.searchParams.set(key, value);
  }

  const response = await fetch(naverUrl.toString(), {
    headers: {
      "X-Naver-Client-Id": env.VITE_NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": env.VITE_NAVER_CLIENT_SECRET,
      "User-Agent": "Mozilla/5.0 (compatible; LunchHunt/1.0)",
    },
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// 네이버 Reverse Geocoding API 핸들러
async function handleNaverReverseGeocode(request, env, corsHeaders) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const naverUrl = new URL(
    "https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc"
  );

  // 쿼리 파라미터 복사
  for (const [key, value] of searchParams) {
    naverUrl.searchParams.set(key, value);
  }

  const response = await fetch(naverUrl.toString(), {
    headers: {
      "X-Naver-Client-Id": env.VITE_NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": env.VITE_NAVER_CLIENT_SECRET,
      "User-Agent": "Mozilla/5.0 (compatible; LunchHunt/1.0)",
    },
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
