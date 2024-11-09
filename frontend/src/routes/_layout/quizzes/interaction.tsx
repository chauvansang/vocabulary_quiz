import {useEffect, useState} from "react"
import {useNavigate} from "@tanstack/react-router"
import {createFileRoute, useSearch} from "@tanstack/react-router"
import {useQueryClient} from "@tanstack/react-query"
import {Button, Container, Heading, Radio, RadioGroup, Stack, Text,} from "@chakra-ui/react"
import {Question, QuizzesService} from "../../../client"

const QuizInteraction = () => {
  const { quizId, sessionId } = useSearch({ from: Route.id })
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [score, setScore] = useState(0)
  const queryClient = useQueryClient()

  useEffect(() => {
    const fetchQuiz = async () => {
      const quiz = await QuizzesService.readQuiz(quizId)
      setQuestions(quiz.questions)
    }
    fetchQuiz()
  }, [quizId])

  const handleNext = async () => {
    if (selectedAnswer) {
      const currentQuestion = questions[currentQuestionIndex]
      const correctAnswer = currentQuestion.answers.find(
        (answer) => answer.is_correct
      )
      if (correctAnswer && correctAnswer.id === selectedAnswer) {
        const newScore = score + 1
        setScore(newScore)

        await QuizzesService.updateLeaderBoard({quizId, score: newScore})
      }
      setSelectedAnswer("")
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const navigate = useNavigate()

  const handleFinish = async () => {
    await queryClient.invalidateQueries({ queryKey: ['leaderboard', quizId] })
    await QuizzesService.updateQuizScore({ sessionId, score: score })
    await navigate({to: `/leaderboard`})
  }

  if (currentQuestionIndex >= questions.length) {
    return (
      <Container>
        <Heading>Quiz Completed</Heading>
        <Text>Your score: {score}</Text>
        <Button onClick={handleFinish}>Finish</Button>
      </Container>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <Container>
      <Heading>{currentQuestion.text}</Heading>
      <RadioGroup onChange={setSelectedAnswer} value={selectedAnswer}>
        <Stack>
          {currentQuestion.answers.map((answer) => (
            <Radio key={answer.id} value={answer.id}>
              {answer.text}
            </Radio>
          ))}
        </Stack>
      </RadioGroup>
      <Button onClick={handleNext} isDisabled={!selectedAnswer}>
        Next
      </Button>
    </Container>
  )
}

// @ts-ignore
export const Route = createFileRoute("/_layout/quizzes/interaction")({
  component: QuizInteraction,
})

export default QuizInteraction
