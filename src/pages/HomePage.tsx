import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f9fafb",
      }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem" }}>
        🍽️ LunchHunt
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          color: "#555",
          marginBottom: "2rem",
          textAlign: "center",
        }}>
        AI가 오늘 점심 메뉴를 재미있게 추천해주는 게임형 웹앱입니다.
        <br />
        버튼을 눌러 점심 추천을 시작해보세요!
      </p>
      <button
        style={{
          padding: "0.8rem 2.5rem",
          fontSize: "1.1rem",
          fontWeight: 600,
          borderRadius: "2rem",
          background: "#4f46e5",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        }}
        onClick={() => navigate("/game")}>
        점심 추천 시작하기
      </button>
    </div>
  );
};

export default HomePage;
