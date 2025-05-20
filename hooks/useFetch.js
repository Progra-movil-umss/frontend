import { useEffect, useState } from 'react';

export const useFetch = (url, token) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          signal,
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const json = await response.json();
        setData(json);
      } catch (err) {
        if (err.name === 'AbortError') {
          // La petición fue cancelada, no actualizamos el estado ni mostramos error
          return;
        }
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup: abortar fetch si cambia url o se desmonta el componente
    return () => controller.abort();
  }, [url, token]);

  return { data, loading, error };
};
