// client/src/components/features/post/AccidentSketchbook.tsx

"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Pencil } from "lucide-react";

export function AccidentSketchbook() {
    // Canvas 태그에 직접 접근하기 위한 참조
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // 컴포넌트가 마운트될 때 캔버스 기본 세팅
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                // 선 굵기와 끝부분 둥글게 처리
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
                ctx.strokeStyle = "#ef4444"; // 기본색: 빨간색(사고 동선용)
            }
        }
    }, []);

    // 🖱️ 마우스를 눌렀을 때 (그리기 시작)
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            // 마우스의 현재 좌표 계산
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.beginPath(); // 새로운 선 그리기 시작
            ctx.moveTo(x, y); // 시작점으로 붓 이동
            setIsDrawing(true);
        }
    };

    // 🖱️ 마우스를 움직일 때 (선 긋기)
    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return; // 마우스를 누른 상태가 아니면 무시

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.lineTo(x, y); // 이전 점에서 현재 점까지 선 생성
            ctx.stroke();     // 실제로 화면에 선을 그림
        }
    };

    // 🖱️ 마우스를 뗐거나 캔버스 밖으로 나갔을 때 (그리기 종료)
    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.closePath();
        }
    };

    // 🗑️ 지우개 (전체 초기화)
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 전체 지우기
            }
        }
    };

    return (
        <div className="flex flex-col gap-4 border p-4 rounded-lg bg-card shadow-sm">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-primary" />
                    사고 현장 스케치북
                </h3>
                <Button variant="outline" size="sm" onClick={clearCanvas} className="text-red-500 hover:text-red-700">
                    <Eraser className="w-4 h-4 mr-1" /> 전체 지우기
                </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
                마우스로 드래그하여 당시의 차량 동선이나 상황을 자유롭게 그려보세요.
            </p>

            {/* 🎨 실제 그림이 그려지는 도화지 영역 */}
            <div className="w-full bg-muted/30 border-2 border-dashed rounded-lg overflow-hidden flex justify-center cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="bg-white"
                />
            </div>
        </div>
    );
}