import { useState } from "react"
import { Input, Button, VStack } from "@chakra-ui/react"
import { QuizzesService } from "../../client"

const JoinQuiz = () => {
  const [quizId, setQuizId] = useState("")

  const handleJoinQuiz = async () => {
    try {
      const response = await QuizzesService.joinQuiz({ quizId })
      console.log("Joined quiz successfully", response)
      console.log("Joined quiz successfully")
    } catch (error) {
      console.error("Failed to join quiz:", error)
    }
  }

  return (
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
  )
}

export default JoinQuiz
