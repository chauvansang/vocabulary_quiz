import React, {createContext, useContext, useEffect, useState} from 'react';
import {Leaderboard} from '../client';

type LeaderboardData = {
  [quizId: string]: Leaderboard[];
};

type LeaderboardContextType = {
  leaderboards: LeaderboardData;
  isConnected: boolean;
  error: string | null;
};

const LeaderboardContext = createContext<LeaderboardContextType>({
  leaderboards: {},
  isConnected: false,
  error: null,
});

export const LeaderboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaderboards, setLeaderboards] = useState<LeaderboardData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/v1/leaderboards/all/stream`
    );

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.quiz_id && data.leaderboard) {
          // Update existing leaderboard while keeping previous data
          setLeaderboards(prev => {
            return {
              ...prev,
              [data.quiz_id]: data.leaderboard // Overwrite leaderboard for specific quiz ID
            };
          });
        }
      } catch (err) {
        console.error('Error parsing data:', err);
        setError('Failed to parse leaderboard data');
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      setError('Connection failed');
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <LeaderboardContext.Provider value={{ leaderboards, isConnected, error }}>
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = () => useContext(LeaderboardContext);
