import { useState } from "react"
import { Container, Heading, Input, Button, VStack } from "@chakra-ui/react"
import { QuizzesService } from "../../../client"

const JoinQuizRoute = () => {
  const [quizId, setQuizId] = useState("")
  const navigate = useNavigate()

  const handleJoinQuiz = async () => {
    const trimmedQuizId = quizId.trim()
    if (trimmedQuizId) {
      try {
        const response = await QuizzesService.joinQuiz({ quizId: trimmedQuizId })
        console.log("Joined quiz successfully", response)
        await navigate({to: `/quizzes/interaction`, search: {quizId, sessionId: response.id}})
      } catch (error) {
        console.error("Failed to join quiz:", error)
      }
    }
  }

  return (
    <Container>
      <Heading>Join a Quiz</Heading>
      <VStack spacing={4}>
        <Input
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
          placeholder="Enter Quiz ID"
        />
        <Button onClick={handleJoinQuiz} colorScheme="blue">
          Join Quiz
        </Button>
      </VStack>
    </Container>
  )
}

import {createFileRoute, useNavigate} from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/quizzes/join")({
  component: JoinQuizRoute,
})

export default JoinQuizRoute
