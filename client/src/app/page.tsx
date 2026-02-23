"use client"; // 클라이언트 컴포넌트 선언

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("백엔드 데이터를 기다리는 중...");

  useEffect(() => {
    // 백엔드 API 호출 (포트 4000번 주의!)
    fetch("http://localhost:4000/api/test")
      .then((res) => res.json())
      .then((data) => {
        console.log("받은 데이터:", data);
        setMessage(data.message);
      })
      .catch((err) => {
        console.error("에러 발생:", err);
        setMessage("백엔드 연결 실패 ㅠㅠ 서버 켜져 있나요?");
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">Traffic Judge Project</h1>
      <div className="p-6 border-2 border-green-500 rounded-xl">
        <p className="text-xl font-mono text-green-400">
          백엔드 응답: {message}
        </p>
      </div>
    </div>
  );
}