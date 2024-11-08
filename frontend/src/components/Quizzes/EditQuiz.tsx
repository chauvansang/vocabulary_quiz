import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Checkbox,
} from "@chakra-ui/react"
import { Quiz, QuizzesService } from "../../client"

interface EditQuizProps {
  quiz: Quiz
  isOpen: boolean
  onClose: () => void
}

const EditQuiz = ({ quiz, isOpen, onClose }: EditQuizProps) => {
  const [name, setName] = useState(quiz.name)
  const [questions, setQuestions] = useState(
    quiz.questions.map((q) => ({
      text: q.text,
      answers: q.answers.map((a) => ({
        text: a.text,
        is_correct: a.is_correct,
      })),
    }))
  )

  const queryClient = useQueryClient()

  const handleSave = async () => {
    try {
      await QuizzesService.updateQuiz({
        id: quiz.id,
        name: name,
        questions: questions,
      })
      console.log("Quiz updated successfully")
      await queryClient.invalidateQueries({queryKey: ["quizzes"]})
      onClose()
    } catch (error) {
      console.error("Failed to update quiz:", error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Quiz</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Quiz Name"
            mb={4}
          />
          {questions.map((question, qIndex) => (
            <div key={qIndex}>
              <Input
                value={question.text}
                onChange={(e) => {
                  const newQuestions = [...questions]
                  newQuestions[qIndex].text = e.target.value
                  setQuestions(newQuestions)
                }}
                placeholder={`Question ${qIndex + 1}`}
                mb={2}
              />
              {question.answers.map((answer, aIndex) => (
                <div key={aIndex}>
                  <Input
                    value={answer.text}
                    onChange={(e) => {
                      const newQuestions = [...questions]
                      newQuestions[qIndex].answers[aIndex].text = e.target.value
                      setQuestions(newQuestions)
                    }}
                    placeholder={`Answer ${aIndex + 1}`}
                    mb={2}
                  />
                  <Checkbox
                    isChecked={answer.is_correct}
                    onChange={(e) => {
                      const newQuestions = [...questions]
                      newQuestions[qIndex].answers[aIndex].is_correct = e.target.checked
                      setQuestions(newQuestions)
                    }}
                  >
                    Correct
                  </Checkbox>
                </div>
              ))}
              <Button
                onClick={() => {
                  const newQuestions = [...questions]
                  newQuestions[qIndex].answers.push({ text: "", is_correct: false })
                  setQuestions(newQuestions)
                }}
              >
                Add Answer
              </Button>
            </div>
          ))}
          <Button
            onClick={() => setQuestions([...questions, { text: "", answers: [{ text: "", is_correct: false }] }])}
          >
            Add Question
          </Button>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditQuiz
