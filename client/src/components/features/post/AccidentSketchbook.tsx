// client/src/components/features/post/AccidentSketchbook.tsx
"use client";

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Pencil } from "lucide-react";

// ✅ 부모가 꺼내 쓸 함수의 타입 정의
export interface SketchbookRef {
    exportImage: () => string | null;
}

// ✅ forwardRef로 감싸기
export const AccidentSketchbook = forwardRef<SketchbookRef>((props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false); // 그림을 한 번이라도 그렸는지 체크

    useImperativeHandle(ref, () => ({
        // ✅ 부모(폼)에서 이 함수를 호출하면 Base64 이미지를 리턴함
        exportImage: () => {
            if (!hasDrawn || !canvasRef.current) return null; // 안 그렸으면 null 전송
            return canvasRef.current.toDataURL("image/png");
        }
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
                ctx.strokeStyle = "#ef4444"; 
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath(); 
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top); 
            setIsDrawing(true);
            setHasDrawn(true); // 그렸다고 상태 변경!
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); 
            ctx.stroke();     
        }
    };

    const stopDrawing = () => setIsDrawing(false);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height); 
                setHasDrawn(false); // 초기화했으니 다시 안 그린 상태로!
            }
        }
    };

    return (
        <div className="flex flex-col gap-4 border p-4 rounded-lg bg-card shadow-sm w-full">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-primary" />
                    사고 현장 스케치북 (선택)
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={clearCanvas} className="text-red-500">
                    <Eraser className="w-4 h-4 mr-1" /> 전체 지우기
                </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">마우스로 드래그하여 당시의 차량 동선을 그려주세요.</p>
            <div className="w-full bg-muted/30 border-2 border-dashed rounded-lg overflow-hidden flex justify-center cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={350}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="bg-white max-w-full h-auto"
                />
            </div>
        </div>
    );
});

AccidentSketchbook.displayName = "AccidentSketchbook";