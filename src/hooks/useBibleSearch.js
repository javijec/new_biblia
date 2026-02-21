import { useState, useEffect, useCallback, useRef } from 'react';
import { useBible } from '../context/BibleContext';

export function useBibleSearch() {
  const { data } = useBible();
  const [isReady, setIsReady] = useState(false);
  const workerRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (data && !workerRef.current) {
      workerRef.current = new Worker(new URL('../workers/search.worker.js', import.meta.url), { type: 'module' });

      workerRef.current.postMessage({
        type: 'INIT',
        payload: data.bookIndex
      });

      setIsReady(true);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [data]);

  const searchAllBooks = useCallback((term, onProgress) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Search worker not initialized'));
        return;
      }

      const requestId = ++requestIdRef.current;

      const handleMessage = (e) => {
        const { type, requestId: responseRequestId, results, terms, elapsedMs, resultCount, count, total } = e.data;
        if (responseRequestId !== requestId) {
          return;
        }

        if (type === 'PROGRESS') {
          onProgress?.({ count, total, progress: total ? count / total : 0 });
          return;
        }

        if (type === 'COMPLETE') {
          workerRef.current.removeEventListener('message', handleMessage);
          resolve({ results, terms, elapsedMs, resultCount });
        }
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({ type: 'SEARCH', payload: { term, requestId } });
    });
  }, []);

  return { searchAllBooks, isReady };
}
