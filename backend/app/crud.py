import uuid
from typing import Any, Type, Sequence

from sqlalchemy.orm import lazyload
from sqlmodel import Session, select, func

from app.core.security import get_password_hash, verify_password
from app.models import User, UserCreate, UserUpdate, Quiz, QuizSession, Leaderboard, Question, Answer, UserPublic


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def get_quizzes(*, session: Session, skip: int = 0, limit: int = 100) -> Sequence[Quiz]:
    statement = (
        select(Quiz)
        .options(
            lazyload(Quiz.questions).subqueryload(Question.answers)
        )
        .offset(skip)
        .limit(limit)
    )
    return session.exec(statement).all()


def get_quiz(*, session: Session, quiz_id: uuid.UUID) -> Quiz:
    statement = select(Quiz).where(Quiz.id == quiz_id).options(lazyload(Quiz.questions).subqueryload(Question.answers))
    return session.exec(statement).first()


def create_quiz(*, session: Session, name: str, questions: list[dict]) -> Quiz:
    db_quiz = Quiz(name=name)
    session.add(db_quiz)
    session.commit()
    _add_questions_and_answers(session, db_quiz.id, questions)
    session.refresh(db_quiz)
    return db_quiz


def update_quiz(*, session: Session, quiz_id: uuid.UUID, name: str, questions: list[dict]) -> Quiz | None:
    db_quiz = session.get(Quiz, quiz_id)
    if db_quiz:
        db_quiz.name = name

        # Clear existing questions and answers
        for question in db_quiz.questions:
            session.delete(question)

        # Commit deletions first
        session.commit()

        # Add updated questions and answers
        _add_questions_and_answers(session, db_quiz.id, questions)
        session.refresh(db_quiz)

    return db_quiz


def delete_quiz(*, session: Session, quiz_id: uuid.UUID) -> None:
    db_quiz = session.get(Quiz, quiz_id)
    if db_quiz:
        session.delete(db_quiz)
        session.commit()


def _add_questions_and_answers(session: Session, quiz_id: uuid.UUID, questions: list[dict]) -> None:
    for question_data in questions:
        question = Question(quiz_id=quiz_id, text=question_data["text"])
        session.add(question)

        # Committing the question to obtain its ID before adding answers
        session.commit()
        for answer_data in question_data["answers"]:
            answer = Answer(
                question_id=question.id,
                text=answer_data["text"],
                is_correct=answer_data["is_correct"],
            )
            session.add(answer)

    # Commit all answers at once after loop for efficiency
    session.commit()


def create_question(*, session: Session, quiz_id: uuid.UUID, question_data: dict) -> Question:
    question = Question(quiz_id=quiz_id, text=question_data["text"])
    session.add(question)
    session.commit()
    for answer_data in question_data["answers"]:
        answer = Answer(
            question_id=question.id,
            text=answer_data["text"],
            is_correct=answer_data["is_correct"],
        )
        session.add(answer)
    session.commit()
    session.refresh(question)
    return question


def create_answer(*, session: Session, question_id: uuid.UUID, answer_data: dict) -> Answer:
    answer = Answer(
        question_id=question_id,
        text=answer_data["text"],
        is_correct=answer_data["is_correct"],
    )
    session.add(answer)
    session.commit()
    session.refresh(answer)
    return answer


def update_quiz_score(*, session: Session, session_id: uuid.UUID, score: int) -> QuizSession | None:
    db_session = session.get(QuizSession, session_id)
    if db_session:
        db_session.score = score
        session.add(db_session)
        session.commit()
        session.refresh(db_session)
    return db_session


def get_leaderboard(*, session: Session, quiz_id: uuid.UUID) -> list[Leaderboard]:
    statement = (
        select(
            QuizSession.user_id,
            QuizSession.score,
            func.rank().over(order_by=QuizSession.score.desc()).label("rank")
        )
        .where(QuizSession.quiz_id == quiz_id)
        .order_by(QuizSession.score.desc())
    )
    results = session.exec(statement).all()

    leaderboard = [
        Leaderboard(rank=result[2], user_id=result[0], score=result[1])
        for result in results
    ]

    return leaderboard


def join_quiz_session(*, session: Session, quiz_id: uuid.UUID, user_id: uuid.UUID) -> QuizSession:
    quiz_session = QuizSession(quiz_id=quiz_id, user_id=user_id)
    session.add(quiz_session)
    session.commit()
    session.refresh(quiz_session)
    return quiz_session
