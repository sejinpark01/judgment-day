import { useState, useEffect } from 'react';

export function usePosts(initialPage = 1) {
    const [posts, setPosts] = useState<any[]>([]);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`http://localhost:4000/api/posts?page=${page}&limit=6`);
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