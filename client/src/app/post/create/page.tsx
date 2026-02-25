import { CreatePostForm } from "@/components/features/post/CreatePostForm";

export default function CreatePostPage() {
  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">판결 요청하기</h1>
        <p className="text-muted-foreground">객관적인 시선이 필요한 블랙박스 영상을 공유해주세요.</p>
      </div>
      <CreatePostForm />
    </main>
  );
}