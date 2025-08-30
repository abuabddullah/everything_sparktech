import { StatusCodes } from 'http-status-codes'
import { IQuestion } from './Question.interface'
import { Question } from './Question.model'
import QueryBuilder from '../../builder/QueryBuilder'
import AppError from '../../../errors/AppError'
import { QuestionSet } from '../QuestionSet/QuestionSet.model'
import { UserProgressHistory } from '../UserProgressHistory/UserProgressHistory.model'

const createQuestion = async (payload: IQuestion): Promise<IQuestion> => {
  const result = await Question.create(payload)
  return result
}

const getAllQuestions = async (
  query: Record<string, any>,
): Promise<{
  meta: { total: number; page: number; limit: number }
  result: IQuestion[]
}> => {
  const queryBuilder = new QueryBuilder(Question.find(), query)
  const result = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

const getAllUnpaginatedQuestions = async (): Promise<IQuestion[]> => {
  const result = await Question.find()
  return result
}

const updateQuestion = async (
  id: string,
  payload: Partial<IQuestion>,
): Promise<IQuestion | null> => {
  const isExist = await Question.findById(id)
  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.')
  }

  const updatedQuestion = await Question.findByIdAndUpdate(id, payload, {
    new: true,
  })

  if (!updatedQuestion) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.')
  }

  if (payload.questionSet) {
    if (isExist.questionSet) {
      await QuestionSet.updateOne(
        { _id: isExist.questionSet },
        { $pull: { questions: updatedQuestion._id } }, // Remove prompt from old question set
      )
    }
    await QuestionSet.updateOne(
      { _id: payload.questionSet },
      { $push: { questions: updatedQuestion._id } },
    )
  }

  return updatedQuestion
}

const deleteQuestion = async (id: string): Promise<IQuestion | null> => {
  const result = await Question.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.')
  }
  result.isDeleted = true
  result.deletedAt = new Date()
  await result.save()
  return result
}

const hardDeleteQuestion = async (id: string): Promise<IQuestion | null> => {
  const result = await Question.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.')
  }
  if (result.questionSet) {
    await QuestionSet.updateOne(
      { _id: result.questionSet },
      { $pull: { questions: result._id } }, // Remove prompt from old question set
    )
  }
  return result
}

const getQuestionById = async (id: string): Promise<IQuestion | null> => {
  const result = await Question.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.')
  }
  return result
}

const upsertUserProgressHistoryTrackingOnAnsweringQuestion = async (
  userId: string,
  questionId: string,
  userAnswer: number | number[],
) => {
  /**
   * find is exist question and populate the correctAnswerOption+slNoOfCorrectAnswers+questionType
   *  * if questionType is "radio / true / dropdown / short answer" then go for correctAnswerOption to populate
   *  * if questionType is "mcq / rearrange" then go for slNoOfCorrectAnswers to populate
   * check if the question is correct or not
   * find the userProgressHistory.answeredQuestions and usert the fields "question+userAnswer+isCorrectlyAnswered"
   */
  const isExistQuestion = await Question.findById(questionId)
  if (!isExistQuestion) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.')
  }
  // Define isCorrectlyAnswered flag
  let isCorrectlyAnswered: boolean = false

  // Check question types and handle user answer validation accordingly
  if (
    isExistQuestion.questionType === 'radio' ||
    isExistQuestion.questionType === 'true' ||
    isExistQuestion.questionType === 'dropdown' ||
    isExistQuestion.questionType === 'short answer'
  ) {
    await isExistQuestion.populate('correctAnswerOption') // Populate the correct answer
    // For these question types, userAnswer is a single value (not an array)
    isCorrectlyAnswered = isExistQuestion.correctAnswerOption === userAnswer
  } else if (isExistQuestion.questionType === 'mcq') {
    await isExistQuestion.populate('slNoOfCorrectAnswers') // Populate the correct answers for MCQ

    // Check if userAnswer is an array and validate that all elements are in slNoOfCorrectAnswers
    if (Array.isArray(userAnswer)) {
      isCorrectlyAnswered =
        userAnswer.every((answer: number) =>
          isExistQuestion.slNoOfCorrectAnswers.includes(answer),
        ) && userAnswer.length === isExistQuestion.slNoOfCorrectAnswers.length
    } else {
      // If userAnswer is not an array, this is an invalid case for MCQ
      isCorrectlyAnswered = false
    }
  } else if (isExistQuestion.questionType === 'rearrange') {
    await isExistQuestion.populate('options') // Populate the options for rearrange question

    // Ensure the sequence of the options is the same as the correct answer
    if (Array.isArray(userAnswer)) {
      isCorrectlyAnswered =
        isExistQuestion.options.map((option: any) => option.value).join('') ===
        userAnswer.join('')
    } else {
      // If userAnswer is not an array, this is an invalid case for rearrange
      isCorrectlyAnswered = false
    }
  }

  // upsert user progress history steps,
  // 1. find user progress history by user id and select the answeredQuestions only
  // 2. if user progress history is not found then create a new one
  // 3. in the answeredQuestions array filed and find the question id if found then update the userAnswer and isCorrectlyAnswered and answeredAt else push the new question to the answeredQuestions array if not found create a new document inside answeredQuestions array
  // Upsert user progress history (Find or create new)
  const userProgressHistory = await UserProgressHistory.findOneAndUpdate(
    { user: userId, isDeleted: false },
    {
      $set: {
        'answeredQuestions.$[elem].userAnswer': userAnswer,
        'answeredQuestions.$[elem].isCorrectlyAnswered': isCorrectlyAnswered,
        'answeredQuestions.$[elem].answeredAt': new Date(),
      },
    },
    {
      new: true, // Return updated document
      upsert: true, // Create a new document if not found
      arrayFilters: [
        {
          'elem.question': questionId, // Targeting the specific question
        },
      ],
    },
  )

  // If the question was not found in answeredQuestions, add it
  if (!userProgressHistory) {
    await UserProgressHistory.findOneAndUpdate(
      { user: userId, isDeleted: false },
      {
        $push: {
          answeredQuestions: {
            question: questionId,
            userAnswer,
            isCorrectlyAnswered,
            answeredAt: new Date(),
          },
        },
      },
      { upsert: true },
    )
  }
}

export const QuestionService = {
  createQuestion,
  getAllQuestions,
  getAllUnpaginatedQuestions,
  updateQuestion,
  deleteQuestion,
  hardDeleteQuestion,
  getQuestionById,
  upsertUserProgressHistoryTrackingOnAnsweringQuestion,
}
