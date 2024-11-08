// _layout/leaderboard.tsx

import { useEffect, useState } from "react"
import { Container, Heading, Stack } from "@chakra-ui/react"
import { Quiz, QuizzesService } from "../../client"
import { createFileRoute } from "@tanstack/react-router"
import Leaderboard from "../../components/Leaderboard/Leaderboard"

const LeaderboardRoute = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizzesData = await QuizzesService.readQuizzes()
        setQuizzes(quizzesData.data)
      } catch (error) {
        console.error("Failed to fetch quizzes:", error)
      }
    }

    fetchQuizzes()
  }, [])

  return (
    <Container maxW="container.xl" py={6}>
      <Stack spacing={8}>
        <Heading>All Leaderboards</Heading>
        {quizzes.map((quiz) => (
          <Stack key={quiz.id} spacing={4}>
            <Heading size="md">{quiz.name}</Heading>
            <Leaderboard quizId={quiz.id} />
          </Stack>
        ))}
      </Stack>
    </Container>
  )
}

// @ts-ignore
export const Route = createFileRoute({ path: "/_layout/leaderboard" })({
  component: LeaderboardRoute,
})

export default LeaderboardRoute
