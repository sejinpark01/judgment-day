// client/src/components/features/post/AccidentSketchbook.tsx

"use client";

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Pencil, RotateCcw, RotateCw, Trash2, Undo2, ZoomIn, ZoomOut } from 'lucide-react';

export interface SketchbookRef {
    exportImage: () => string | null;
}

interface AccidentSketchbookProps {
    initialImage?: string | null;
}

export const AccidentSketchbook = forwardRef<SketchbookRef, AccidentSketchbookProps>((props, ref) => {
    const { initialImage } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false); // 🚨 [픽스 2]: 유저가 '직접' 그렸는지 체크하는 상태 추가
    const [color, setColor] = useState('#ff0000');
    const [lineWidth, setLineWidth] = useState(3);
    const [undoStack, setUndoStack] = useState<ImageData[]>([]);
    const [redoStack, setRedoStack] = useState<ImageData[]>([]);
    const [scale, setScale] = useState(1);
    const [canvasSize] = useState({ width: 600, height: 400 });

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        setUndoStack((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
        // 하얀색 칠하기 대신 완전 투명하게 지우기 (초기 상태로 원복)
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        setRedoStack([]);
        setHasDrawn(false); // 지웠으니 안 그린 상태로!
    };

    const undo = () => {
        if (undoStack.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setRedoStack((prev) => [...prev, currentImageData]);

        const prevImageData = undoStack[undoStack.length - 1];
        setUndoStack((prev) => prev.slice(0, -1));
        ctx.putImageData(prevImageData, 0, 0);
    };

    const redo = () => {
        if (redoStack.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setUndoStack((prev) => [...prev, currentImageData]);

        const nextImageData = redoStack[redoStack.length - 1];
        setRedoStack((prev) => prev.slice(0, -1));
        ctx.putImageData(nextImageData, 0, 0);
    };

    // 🚀 컴포넌트 마운트 시 기존 스케치를 캔버스 바탕에 로드
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        // 🚨 [픽스 2]: 초기화 시 하얀색 칠하기(fillRect) 삭제! 투명하게 유지.
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (initialImage) {
            const img = new Image();
            img.src = initialImage;
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
                setUndoStack([]); 
                setRedoStack([]);
                setHasDrawn(true); // 기존 이미지가 있으면 '그린 상태'로 간주
            };
        }
    }, [initialImage, canvasSize]);

    const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
    const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

    // 🚨 [픽스 2]: 유저가 아무것도 안 그렸으면 무조건 null 반환
    const exportImage = (): string | null => {
        if (!hasDrawn) return null; // 빈 도화지면 저장 안 함!
        
        const canvas = canvasRef.current;
        if (!canvas) return null;
        
        // 투명 배경을 하얀색으로 칠해서 내보내는 트릭 (저장용 캔버스 생성)
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);
            return tempCanvas.toDataURL('image/png');
        }
        return canvas.toDataURL('image/png');
    };

    useImperativeHandle(ref, () => ({
        exportImage,
    }));

    const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const coords = getCoordinates(event);
        if (!ctx || !canvas || !coords) return;

        const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setUndoStack((prev) => [...prev, currentImageData]);
        setRedoStack([]);

        setIsDrawing(true);
        setHasDrawn(true); // 🚨 유저가 마우스를 누르는 순간 '그림'으로 인식!
        
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
    };

    const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const coords = getCoordinates(event);
        if (!ctx || !coords) return;

        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        ctx.closePath();
        setIsDrawing(false);
    };

    const colors = ['#ff0000', '#0000ff', '#00ff00', '#000000', '#ffffff', '#ffff00'];
    const lineWidths = [1, 3, 5, 8, 12];

    return (
        <div className="sketchbook-container p-4 border rounded-lg bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4 p-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <Button type="button" variant="outline" size="icon" onClick={undo} disabled={undoStack.length === 0}>
                    <Undo2 className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={redo} disabled={redoStack.length === 0}>
                    <RotateCw className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                {colors.map((c) => (
                    // 🚨 [픽스 1]: 모든 컨트롤 버튼에 type="button" 명시!
                    <button
                        key={c}
                        type="button" 
                        onClick={() => { setColor(c); setLineWidth(lineWidth === 12 ? 3 : lineWidth); }}
                        className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-primary ring-2 ring-primary/20' : 'border-white dark:border-slate-900'} shadow-inner`}
                        style={{ backgroundColor: c }}
                    />
                ))}
                <Button type="button" variant={color === '#ffffff' && lineWidth === 12 ? "default" : "outline"} size="icon" onClick={() => { setColor('#ffffff'); setLineWidth(12); }} className="ml-1">
                    <Eraser className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                {lineWidths.map((w) => (
                    // 🚨 [픽스 1]: 굵기 조절 버튼에도 type="button" 명시!
                    <button
                        key={w}
                        type="button"
                        onClick={() => { setLineWidth(w); if (color === '#ffffff' && w !== 12) setColor('#ff0000'); }}
                        className={`w-7 h-7 rounded-full border flex items-center justify-center ${lineWidth === w ? 'border-primary bg-slate-100 dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700'}`}
                    >
                        <div style={{ width: w + 2, height: w + 2, backgroundColor: lineWidth === w ? color : '#cbd5e1', borderRadius: '50%' }} />
                    </button>
                ))}
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                <Button type="button" variant="outline" size="icon" onClick={clearCanvas}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                <Button type="button" variant="outline" size="icon" onClick={zoomIn}>
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={zoomOut}>
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs font-mono text-slate-500 w-12 text-center">{Math.round(scale * 100)}%</span>
            </div>

            <div className="canvas-wrapper relative border border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30 p-2 flex justify-center overflow-auto">
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-in-out' }}>
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        style={{ width: '600px', height: '400px', border: '1px solid #e2e8f0', display: 'block' }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="touch-none bg-white cursor-crosshair rounded shadow-md"
                    />
                </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
                ※ 마우스 혹은 터치펜을 사용하여 사고 상황을 시각적으로 묘사해 주세요.
            </p>
        </div>
    );
});
AccidentSketchbook.displayName = 'AccidentSketchbook';