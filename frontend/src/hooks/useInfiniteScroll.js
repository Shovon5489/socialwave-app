import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for infinite scroll pagination using IntersectionObserver.
 *
 * @param {Function} fetchFn - Async function that accepts (page) and returns { data, hasMore }
 * @param {Object} options
 * @param {number} options.threshold - IntersectionObserver threshold (0-1)
 * @param {boolean} options.enabled - Whether the observer is active
 * @returns {{ items, loading, error, hasMore, loadMore, reset, sentinelRef }}
 */
export function useInfiniteScroll(fetchFn, { threshold = 0.1, enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (pageNum, append = true) => {
      if (loading || (!hasMore && append)) return;
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn(pageNum);
        if (!isMounted.current) return;
        const newItems = result.data || result.items || result || [];
        const more = result.hasMore ?? result.pagination?.hasNextPage ?? newItems.length > 0;
        setItems((prev) => (append ? [...prev, ...newItems] : newItems));
        setHasMore(more);
        setPage(pageNum);
      } catch (err) {
        if (isMounted.current) {
          setError(err.response?.data?.message || err.message || 'Failed to load data');
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [fetchFn, loading, hasMore]
  );

  // Initial load
  useEffect(() => {
    fetchData(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up IntersectionObserver on sentinel
  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          fetchData(page + 1, true);
        }
      },
      { threshold }
    );

    observerRef.current.observe(sentinelRef.current);
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [enabled, hasMore, loading, page, threshold, fetchData]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchData(page + 1, true);
    }
  };

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    fetchData(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, loading, error, hasMore, loadMore, reset, sentinelRef };
}

export default useInfiniteScroll;
