import { useState, useEffect } from 'react';

// Ver 2026.03.17: 파라미터에 category와 sort 추가
export function usePosts(initialPage = 1, category = 'ALL', sort = 'latest') {
    const [posts, setPosts] = useState<any[]>([]);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                // 🚀 URL 쿼리 파라미터에 category와 sort 전송 - Ver 2026.03.17
                const res = await fetch(`${API_BASE_URL}/api/posts?page=${page}&limit=6&category=${category}&sort=${sort}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);

                setPosts(data.posts);
                setTotalPages(data.totalPages);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [page, category, sort]); // 페이지가 바뀔 때마다 재실행!

    return { posts, page, setPage, totalPages, isLoading, error };
}