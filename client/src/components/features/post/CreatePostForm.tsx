// app/components/features/post/CreatePostForm.tsx
"use client";

import { useCreatePost } from "@/hooks/useCreatePost";
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

export function CreatePostForm() {
  const { postData, handleInputChange, handleCategoryChange, handleSubmit, isLoading } = useCreatePost();

  return (
    <Card className="w-full max-w-2xl mx-auto bg-background text-foreground border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">사고 영상 등록</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
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
                <SelectItem value="SUDDEN_ACCEL">급발진 의심</SelectItem>
                <SelectItem value="YELLOW_LIGHT">딜레마존 (황색불)</SelectItem>
                <SelectItem value="DUI">음주운전</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 상세 설명 */}
          <div className="space-y-2">
            <Label htmlFor="content">상황 설명</Label>
            <Textarea 
              id="content"
              name="content"
              placeholder="당시의 상황을 객관적으로 적어주세요."
              value={postData.content}
              onChange={handleInputChange}
              className="min-h-[120px] bg-muted focus-visible:ring-primary"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-4">
          <Button type="button" variant="outline">취소</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "등록 중..." : "판결 요청하기"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}