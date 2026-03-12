import { useState, useEffect } from 'react';

export function usePosts(initialPage = 1) {
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
                const res = await fetch(`${API_BASE_URL}/api/posts?page=1&limit=6`);
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
    }, [page]); // 페이지가 바뀔 때마다 재실행!

    return { posts, page, setPage, totalPages, isLoading, error };
}