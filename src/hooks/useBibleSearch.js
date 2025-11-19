import { useCallback, useEffect, useRef, useState } from 'react';
import { useBible } from '../context/BibleContext';

export function useBibleSearch() {
  const { data } = useBible();
  const workerRef = useRef(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  useEffect(() => {
    // Initialize worker
    workerRef.current = new Worker(new URL('../workers/search.worker.js', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e) => {
      // Handle generic messages if needed
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (data?.bookIndex && workerRef.current) {
      workerRef.current.postMessage({ type: 'INIT', payload: data.bookIndex });
      setIsWorkerReady(true);
    }
  }, [data]);

  const searchAllBooks = useCallback((term) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isWorkerReady) {
        // Fallback or wait? For now resolve empty
        resolve([]);
        return;
      }

      const handleMessage = (e) => {
        const { type, results } = e.data;
        if (type === 'COMPLETE') {
          workerRef.current.removeEventListener('message', handleMessage);
          resolve(results);
        }
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({ type: 'SEARCH', payload: { term } });
    });
  }, [isWorkerReady]);

  return { searchAllBooks, isReady: isWorkerReady };
}
