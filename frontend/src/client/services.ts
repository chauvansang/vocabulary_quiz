import type { CancelablePromise } from "./core/CancelablePromise"
import { OpenAPI } from "./core/OpenAPI"
import { request as __request } from "./core/request"

import type {
  Body_login_login_access_token,
  Message,
  NewPassword,
  Token,
  UserPublic,
  UpdatePassword,
  UserCreate,
  UserRegister,
  UsersPublic,
  UserUpdate,
  UserUpdateMe,
  ItemCreate,
  ItemPublic,
  ItemsPublic,
  ItemUpdate,
  Quiz,
  QuizzesPublic, QuizSession, Leaderboard, Answer, Question,
} from "./models"

export type TDataLoginAccessToken = {
  formData: Body_login_login_access_token
}

export type TDataReadQuizzes = {
  limit?: number
  skip?: number
}

export type TDataUpdateQuiz = {
  id: string,
  name: string,
  questions: { text: string, answers: { text: string, is_correct: boolean }[] }[]
}

export type TDataCreateQuiz = {
  name: string
  questions: { text: string, answers: { text: string, is_correct: boolean }[] }[]
}

export type TDataDeleteQuiz = {
  id: string
}

export type TDataJoinQuiz = {
  quizId: string
}

export type TDataUpdateLeaderBoard = {
  quizId: string
  score: number
}

export class QuestionsService {
  /**
   * Create Question
   * Create a new question.
   * @returns Question Successful Response
   * @throws ApiError
   */
  public static createQuestion(
    data: { quizId: string, text: string, answers: { text: string, is_correct: boolean }[] },
  ): CancelablePromise<Question> {
    return __request(OpenAPI, {
      method: "POST",
      url: `/api/v1/quizzes/${data.quizId}/questions`,
      body: data,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Question
   * Update an existing question.
   * @returns Question Successful Response
   * @throws ApiError
   */
  public static updateQuestion(
    data: { questionId: string, text: string, answers: { text: string, is_correct: boolean }[] },
  ): CancelablePromise<Question> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: `/api/v1/questions/${data.questionId}`,
      body: data,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export class AnswersService {
  /**
   * Create Answer
   * Create a new answer.
   * @returns Answer Successful Response
   * @throws ApiError
   */
  public static createAnswer(
    data: { questionId: string, text: string, is_correct: boolean },
  ): CancelablePromise<Answer> {
    return __request(OpenAPI, {
      method: "POST",
      url: `/api/v1/questions/${data.questionId}/answers`,
      body: data,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Answer
   * Update an existing answer.
   * @returns Answer Successful Response
   * @throws ApiError
   */
  public static updateAnswer(
    data: { answerId: string, text: string, is_correct: boolean },
  ): CancelablePromise<Answer> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: `/api/v1/answers/${data.answerId}`,
      body: data,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export class QuizzesService {
  /**
   * Read Quizzes
   * Retrieve quizzes.
   * @returns QuizzesPublic Successful Response
   * @throws ApiError
   */
  public static readQuizzes(
    data: TDataReadQuizzes = {},
  ): CancelablePromise<QuizzesPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/quizzes/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Quiz
   * Retrieve a specific quiz by ID.
   * @returns Quiz Successful Response
   * @throws ApiError
   */
  public static readQuiz(
    id: string,
  ): CancelablePromise<Quiz> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/quizzes/${id}`,
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Quiz
   * Update an existing quiz.
   * @returns Quiz Successful Response
   * @throws ApiError
   */
  public static updateQuiz(
    data: TDataUpdateQuiz,
  ): CancelablePromise<Quiz> {
    const { id, ...body } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: `/api/v1/quizzes/${id}`,
      body: body,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Quiz
   * Create new quiz.
   * @returns Quiz Successful Response
   * @throws ApiError
   */
  public static createQuiz(
    data: TDataCreateQuiz,
  ): CancelablePromise<Quiz> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/quizzes/",
      body: data,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Quiz
   * Delete an existing quiz.
   * @returns void
   * @throws ApiError
   */
  public static deleteQuiz(
    data: TDataDeleteQuiz,
  ): CancelablePromise<void> {
    const { id } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/api/v1/quizzes/${id}`,
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Join Quiz
   * Join a quiz session.
   * @returns QuizSession Successful Response
   * @throws ApiError
   */
  public static joinQuiz(
    data: TDataJoinQuiz,
  ): CancelablePromise<QuizSession> {
    const { quizId } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/quizzes/join",
      body: { quiz_id: quizId },
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Get Leaderboard
   * Get the leaderboard for a quiz.
   * @returns Leaderboard[] Successful Response
   * @throws ApiError
   */
  public static getLeaderboard(
    quizId: string,
  ): CancelablePromise<Leaderboard[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/leaderboards/${quizId}`,
      errors: {
        422: `Validation Error`,
      },
    })
  }

    /**
   * Update Quiz Score
   * Update the score for a quiz session.
   * @returns QuizSession Successful Response
   * @throws ApiError
   */
  public static updateQuizScore(
    data: { sessionId: string, score: number },
  ): CancelablePromise<QuizSession> {
    const { sessionId, score } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: `/api/v1/quiz-sessions/${sessionId}/score`,
      body: { score },
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }



  public static updateLeaderBoard(
    data: TDataUpdateLeaderBoard): CancelablePromise<void> {
        const { quizId, score } = data
        return __request(OpenAPI, {
          method: "POST",
          url: `/api/v1/leaderboards/${quizId}/score`,
          body: { score },
          mediaType: "application/json",
          errors: {
            422: `Validation Error`,
          },
        })
    }
}

export type TDataRecoverPassword = {
  email: string
}
export type TDataResetPassword = {
  requestBody: NewPassword
}
export type TDataRecoverPasswordHtmlContent = {
  email: string
}

export class LoginService {
  /**
   * Login Access Token
   * OAuth2 compatible token login, get an access token for future requests
   * @returns Token Successful Response
   * @throws ApiError
   */
  public static loginAccessToken(
    data: TDataLoginAccessToken,
  ): CancelablePromise<Token> {
    const { formData } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/access-token",
      formData: formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Test Token
   * Test access token
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static testToken(): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/test-token",
    })
  }

  /**
   * Recover Password
   * Password Recovery
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static recoverPassword(
    data: TDataRecoverPassword,
  ): CancelablePromise<Message> {
    const { email } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Reset Password
   * Reset password
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static resetPassword(
    data: TDataResetPassword,
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/reset-password/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Recover Password Html Content
   * HTML Content for Password Recovery
   * @returns string Successful Response
   * @throws ApiError
   */
  public static recoverPasswordHtmlContent(
    data: TDataRecoverPasswordHtmlContent,
  ): CancelablePromise<string> {
    const { email } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery-html-content/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataReadUsers = {
  limit?: number
  skip?: number
}
export type TDataCreateUser = {
  requestBody: UserCreate
}
export type TDataUpdateUserMe = {
  requestBody: UserUpdateMe
}
export type TDataUpdatePasswordMe = {
  requestBody: UpdatePassword
}
export type TDataRegisterUser = {
  requestBody: UserRegister
}
export type TDataReadUserById = {
  userId: string
}
export type TDataUpdateUser = {
  requestBody: UserUpdate
  userId: string
}
export type TDataDeleteUser = {
  userId: string
}

export class UsersService {
  /**
   * Read Users
   * Retrieve users.
   * @returns UsersPublic Successful Response
   * @throws ApiError
   */
  public static readUsers(
    data: TDataReadUsers = {},
  ): CancelablePromise<UsersPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create User
   * Create new user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static createUser(
    data: TDataCreateUser,
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read User Me
   * Get current user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserMe(): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/me",
    })
  }

  /**
   * Delete User Me
   * Delete own user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteUserMe(): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/me",
    })
  }

  /**
   * Update User Me
   * Update own user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUserMe(
    data: TDataUpdateUserMe,
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Password Me
   * Update own password.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static updatePasswordMe(
    data: TDataUpdatePasswordMe,
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me/password",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Register User
   * Create new user without the need to be logged in.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static registerUser(
    data: TDataRegisterUser,
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/signup",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read User By Id
   * Get a specific user by id.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserById(
    data: TDataReadUserById,
  ): CancelablePromise<UserPublic> {
    const { userId } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update User
   * Update a user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUser(
    data: TDataUpdateUser,
  ): CancelablePromise<UserPublic> {
    const { requestBody, userId } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete User
   * Delete a user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteUser(data: TDataDeleteUser): CancelablePromise<Message> {
    const { userId } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataTestEmail = {
  emailTo: string
}

export class UtilsService {
  /**
   * Test Email
   * Test emails.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static testEmail(data: TDataTestEmail): CancelablePromise<Message> {
    const { emailTo } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/utils/test-email/",
      query: {
        email_to: emailTo,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Health Check
   * @returns boolean Successful Response
   * @throws ApiError
   */
  public static healthCheck(): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/utils/health-check/",
    })
  }
}

export type TDataReadItems = {
  limit?: number
  skip?: number
}
export type TDataCreateItem = {
  requestBody: ItemCreate
}
export type TDataReadItem = {
  id: string
}
export type TDataUpdateItem = {
  id: string
  requestBody: ItemUpdate
}
export type TDataDeleteItem = {
  id: string
}

export class ItemsService {
  /**
   * Read Items
   * Retrieve items.
   * @returns ItemsPublic Successful Response
   * @throws ApiError
   */
  public static readItems(
    data: TDataReadItems = {},
  ): CancelablePromise<ItemsPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/items/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Item
   * Create new item.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static createItem(
    data: TDataCreateItem,
  ): CancelablePromise<ItemPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/items/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Item
   * Get item by ID.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static readItem(data: TDataReadItem): CancelablePromise<ItemPublic> {
    const { id } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Item
   * Update an item.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static updateItem(
    data: TDataUpdateItem,
  ): CancelablePromise<ItemPublic> {
    const { id, requestBody } = data
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Item
   * Delete an item.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteItem(data: TDataDeleteItem): CancelablePromise<Message> {
    const { id } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}
