import { useState, useCallback } from 'react';
import { Buffer } from 'buffer';
import axios from 'axios';

const genRandomNum = () => Math.floor(Math.random() * 1000);

export const useAvatar = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvatar = useCallback(async () => {
  setError(null);
  setIsLoading(true);

  try {
    const seed = genRandomNum();
    const AVATAR_API = `https://api.dicebear.com/8.x/bottts/svg?seed=${seed}`;
    const response = await axios.get(AVATAR_API, {
      responseType: 'text',
    });

    if (response?.data) {
      const result = Buffer.from(response.data);
      return result.toString('base64');
    }
  } catch (e) {
    setError(e?.response?.data || e);
  } finally {
    setIsLoading(false);
  }
}, []);


  return { error, isLoading, fetchAvatar };
};