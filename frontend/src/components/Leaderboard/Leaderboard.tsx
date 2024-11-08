import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
} from '@chakra-ui/react'
import {useEffect, useState} from "react";

type LeaderboardEntry = {
  rank: number
  user_id: string
  score: number
}

type LeaderboardProps = {
  quizId: string
  pollingInterval?: number
}

const Leaderboard = ({ quizId}: LeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)

  useEffect(() => {
    console.log(`Connecting to SSE for quiz ${quizId}`);
    setIsConnecting(true);

    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/v1/quiz-sessions/leaderboard/${quizId}/stream`
    );

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setIsConnecting(false);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received data:', data);
        setLeaderboard(data);
        setError(null);
      } catch (err) {
        console.error('Error parsing data:', err);
        setError('Failed to parse leaderboard data');
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      setError('Connection failed');
      setIsConnecting(false);
      eventSource.close();
    };

    return () => {
      console.log('Closing SSE connection');
      eventSource.close();
    };
  }, [quizId]);

  if (isConnecting) {
    return <Text>Connecting to leaderboard...</Text>;
  }

  if (error) {
    return <Text color="red.500">Error: {error}</Text>;
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
          {leaderboard.map((entry) => (
            <Tr key={entry.user_id}>
              <Td>{entry.rank}</Td>
              <Td>{entry.user_id}</Td>
              <Td isNumeric>{entry.score}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export default Leaderboard
