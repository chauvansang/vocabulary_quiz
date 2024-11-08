from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.models import Quiz, Leaderboard, QuizzesPublic, Question, Answer, QuizPublic, QuestionPublic, \
    AnswerPublic, QuizSession

router = APIRouter()


@router.get("/", response_model=QuizzesPublic)
def read_quizzes(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve quizzes.
    """
    quizzes = crud.get_quizzes(session=session, skip=skip, limit=limit)

    # Explicitly access relationships to ensure they're loaded
    for quiz in quizzes:
        _ = quiz.questions
        for question in quiz.questions:
            _ = question.answers

    return QuizzesPublic(
        data=[
            QuizPublic(
                id=quiz.id,
                name=quiz.name,
                questions=[
                    QuestionPublic(
                        id=question.id,
                        text=question.text,
                        quiz_id=question.quiz_id,
                        answers=[
                            AnswerPublic(
                                id=answer.id,
                                text=answer.text,
                                is_correct=answer.is_correct,
                                question_id=answer.question_id
                            )
                            for answer in question.answers
                        ]
                    )
                    for question in quiz.questions
                ]
            )
            for quiz in quizzes
        ],
        count=len(quizzes)
    )


@router.get("/{quiz_id}", response_model=QuizPublic)
def read_quiz(quiz_id: UUID, session: SessionDep) -> Any:
    """
    Retrieve a specific quiz by ID.
    """
    quiz = crud.get_quiz(session=session, quiz_id=quiz_id)

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return QuizPublic(
        id=quiz.id,
        name=quiz.name,
        questions=[
            QuestionPublic(
                id=question.id,
                text=question.text,
                quiz_id=question.quiz_id,
                answers=[
                    AnswerPublic(
                        id=answer.id,
                        text=answer.text,
                        is_correct=answer.is_correct,
                        question_id=answer.question_id
                    )
                    for answer in question.answers
                ]
            )
            for question in quiz.questions
        ]
    )


class QuizCreate(BaseModel):
    name: str
    questions: list[dict]


@router.post("/", response_model=Quiz)
def create_quiz(
        *, session: SessionDep, quiz_in: QuizCreate, current_user: CurrentUser
) -> Any:
    """
    Create a new quiz.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    quiz = crud.create_quiz(session=session, name=quiz_in.name, questions=quiz_in.questions)
    return quiz


@router.patch("/{quiz_id}", response_model=Quiz)
def update_quiz(
        *, session: SessionDep, quiz_id: UUID, quiz_in: QuizCreate, current_user: CurrentUser
) -> Any:
    """
    Update an existing quiz.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    quiz = crud.update_quiz(session=session, quiz_id=quiz_id, name=quiz_in.name, questions=quiz_in.questions)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


@router.delete("/{quiz_id}", response_model=None)
def delete_quiz(
        *, session: SessionDep, quiz_id: UUID, current_user: CurrentUser
) -> None:
    """
    Delete an existing quiz.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    crud.delete_quiz(session=session, quiz_id=quiz_id)


class QuestionCreate(BaseModel):
    text: str
    answers: list[dict]


@router.post("/{quiz_id}/questions", response_model=Question)
def create_question(
        *, session: SessionDep, quiz_id: UUID, question_in: QuestionCreate, current_user: CurrentUser
) -> Any:
    """
    Create a new question for a quiz.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    question = crud.create_question(session=session, quiz_id=quiz_id, question_data=question_in.dict())
    return question


class AnswerCreate(BaseModel):
    text: str
    is_correct: bool


class QuizSessionCreate(BaseModel):
    quiz_id: UUID


@router.post("/questions/{question_id}/answers", response_model=Answer)
def create_answer(
        *, session: SessionDep, question_id: UUID, answer_in: AnswerCreate, current_user: CurrentUser
) -> Any:
    """
    Create a new answer for a question.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    answer = crud.create_answer(session=session, question_id=question_id, answer_data=answer_in.dict())
    return answer


@router.post("/join", response_model=QuizSession)
def join_quiz(
        *, session: SessionDep, quiz_session_in: QuizSessionCreate, current_user: CurrentUser
) -> Any:
    """
    Join a quiz session.
    """
    # Initiate a new quiz session
    quiz_session = crud.join_quiz_session(session=session, quiz_id=quiz_session_in.quiz_id, user_id=current_user.id)
    session.add(quiz_session)
    session.commit()
    session.refresh(quiz_session)
    return quiz_session


@router.get("/{quiz_id}/leaderboard", response_model=list[Leaderboard])
def get_leaderboard(
        *, session: SessionDep, quiz_id: UUID
) -> Any:
    """
    Get the leaderboard for a quiz.
    """
    leaderboard = crud.get_leaderboard(session=session, quiz_id=quiz_id)
    return leaderboard
