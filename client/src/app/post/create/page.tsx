import { CreatePostForm } from "@/components/features/post/CreatePostForm";
// ✅ 방금 만든 스케치북 컴포넌트 불러오기 (경로는 본인 프로젝트에 맞게 확인)
import { AccidentSketchbook } from "@/components/features/post/AccidentSketchbook";

export default function CreatePostPage() {
  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-4 gap-8">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold mb-2">판결 요청하기</h1>
        <p className="text-muted-foreground">객관적인 시선이 필요한 블랙박스 영상을 공유해주세요.</p>
      </div>

      {/* 🚀 테스트용 스케치북 부착 (폼 위에 임시로 배치) */}
      <div className="w-full max-w-3xl">
        <AccidentSketchbook />
      </div>

      <div className="w-full max-w-3xl">
        <CreatePostForm />
      </div>
    </main>
  );
}