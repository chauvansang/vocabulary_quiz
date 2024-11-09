import { useLeaderboard } from '../../contexts/LeaderboardContext';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { QuizzesService } from '../../client';  // Ensure this import is correct

type LeaderboardProps = {
  quizId: string;
};

const Leaderboard = ({ quizId }: LeaderboardProps) => {
  const { leaderboards, error } = useLeaderboard();
  const [cachedData, setCachedData] = useState(leaderboards[quizId] || []); // Initialize state based on context
  const [loading, setLoading] = useState(true); // New loading state

  // Update cached data when the leaderboard data changes in context
  useEffect(() => {
    setCachedData(leaderboards[quizId] || []);
  }, [leaderboards, quizId]);

  // Fetch initial leaderboard data from the API on mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await QuizzesService.getLeaderboard(quizId);
        setCachedData(response); // Initial data from API
        setLoading(false); // Stop loading
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false); // Stop loading even if error occurs
      }
    };

    fetchLeaderboard();
  }, [quizId]); // Only fetch when quizId changes

  // Handle loading state
  if (loading) {
    return <Alert status="info">Loading leaderboard...</Alert>; // Display loading state
  }

  // Handle error state
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <TableContainer>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>Rank</Th>
            <Th>User</Th>
            <Th isNumeric>Score</Th>
          </Tr>
        </Thead>
        <Tbody>
          {cachedData.length === 0 ? (
            <Tr>
              <Td colSpan={3}>
                <Text textAlign="center">No entries yet</Text>
              </Td>
            </Tr>
          ) : (
            cachedData.map((entry) => (
              <Tr key={entry.user_id}>
                <Td>{entry.rank}</Td>
                <Td>{entry.user_id}</Td>
                <Td isNumeric>{entry.score}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default Leaderboard;
