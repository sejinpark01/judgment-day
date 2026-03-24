// app/components/features/post/CreatePostForm.tsx

"use client";

import { useRef } from "react"; // ✅ useRef 추가
import { useCreatePost } from "@/hooks/useCreatePost";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";


// ✅ 우리가 만든 스케치북 컴포넌트와 타입 불러오기 - Ver 2026.03.10
import { AccidentSketchbook, SketchbookRef } from "./AccidentSketchbook";

export function CreatePostForm() {
  //구조 분해 할당
  const { postData, handleInputChange, handleCategoryChange, handleToggleChange, handleSubmit, isLoading, error } = useCreatePost();
  const router = useRouter();

  // 🚀 스케치북에 접근할 수 있는 리모컨(Ref) 생성
  const sketchbookRef = useRef<SketchbookRef>(null);

  // 🚀 폼 제출 이벤트를 가로채서 그림 데이터를 추가로 넘겨주는 래퍼 함수
  const onSubmitWrap = (e: React.FormEvent) => {
    e.preventDefault();
    // 스케치북에서 Base64 문자열을 뽑아옵니다 (안 그렸으면 null)
    const sketchUrl = sketchbookRef.current?.exportImage() || null;

    // 기존 커스텀 훅의 handleSubmit에 그림 데이터를 함께 넘겨줍니다!
    handleSubmit(e, sketchUrl);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-background text-foreground border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">사고 영상 등록</CardTitle>
      </CardHeader>

      {/* ✅ 기존 handleSubmit 대신 onSubmitWrap 연결 */}
      <form onSubmit={onSubmitWrap}>
        <CardContent className="space-y-6">
          {/* 유튜브 링크 입력 */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl">유튜브 링크 (URL)</Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              value={postData.videoUrl}
              onChange={handleInputChange}
              required
              className="bg-muted focus-visible:ring-primary"
            />
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <Label htmlFor="category">사고 카테고리</Label>
            <Select onValueChange={handleCategoryChange} value={postData.category}>
              <SelectTrigger className="w-full bg-muted">
                <SelectValue placeholder="사고 유형을 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">🚗 일반 사고(차선변경 등)</SelectItem>
                <SelectItem value="SUDDEN_ACCEL">🚨 급발진/페달오조작</SelectItem>
                <SelectItem value="DILEMMA_ZONE">🚥 딜레마존</SelectItem>
                <SelectItem value="JAYWALKING">🚶 무단횡단 사고</SelectItem>
                <SelectItem value="RECKLESS_DRIVING">💢 보복/난폭운전</SelectItem>
                <SelectItem value="SCHOOL_ZONE">🚸 스쿨존 사고</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 🚀 신규 추가: 투표 활성화/비활성화 토글 UI - Ver 2026.03.20 */}
          <div className="flex items-center justify-between space-y-2 p-4 border border-border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-foreground">투표 활성화</Label>
              <p className="text-sm text-muted-foreground">다른 사용자들이 과실 비율을 투표할 수 있도록 허용합니다. (단순 제보 시 해제)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={postData.isVoteEnabled}
                onChange={handleToggleChange}
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* 상세 설명 */}
          <div className="space-y-2">
            <Label htmlFor="content">상황 설명</Label>
            <Textarea
              id="content"
              name="content"
              placeholder={"첫 줄은 게시글의 '제목'으로 표시됩니다.\n이후 당시의 상황을 객관적이고 상세하게 적어주세요."}
              value={postData.content}
              onChange={handleInputChange}
              className="min-h-[120px] bg-muted focus-visible:ring-primary"
            />
          </div>

          {/* 🎨 대망의 스케치북 컴포넌트 부착 */}
          <div className="space-y-2 pt-4 border-t border-border">
            <AccidentSketchbook ref={sketchbookRef} />
          </div>

          {/* 에러 발생 시 빨간색 경고 메시지 출력 */}
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        </CardContent>

        <CardFooter className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push('/')}>취소</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "등록 중..." : "판결 요청하기"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}