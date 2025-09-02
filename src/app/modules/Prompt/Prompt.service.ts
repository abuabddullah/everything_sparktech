import { StatusCodes } from 'http-status-codes'
import { IPrompt } from './Prompt.interface'
import { Prompt } from './Prompt.model'
import QueryBuilder from '../../builder/QueryBuilder'
import unlinkFile from '../../../shared/unlinkFile'
import AppError from '../../../errors/AppError'
import { QuestionSet } from '../QuestionSet/QuestionSet.model'
import cron from 'node-cron'

const createPrompt = async (payload: IPrompt): Promise<IPrompt> => {
  const result = await Prompt.create(payload)
  if (!result) {
    payload.image && unlinkFile(payload.image!)
    throw new AppError(StatusCodes.NOT_FOUND, 'Prompt not found.')
  }
  return result
}

const getAllPrompts = async (
  query: Record<string, any>,
): Promise<{
  meta: { total: number; page: number; limit: number }
  result: IPrompt[]
}> => {
  const queryBuilder = new QueryBuilder(Prompt.find(), query)
  const result = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

const getAllUnpaginatedPrompts = async (): Promise<IPrompt[]> => {
  const result = await Prompt.find()
  return result
}

const updatePrompt = async (
  id: string,
  payload: Partial<IPrompt>,
): Promise<IPrompt | null> => {
  const isExist = await Prompt.findById(id)
  if (!isExist) {
    payload.image && unlinkFile(payload.image!)
    throw new AppError(StatusCodes.NOT_FOUND, 'Prompt not found.')
  }
  const updatedPrompt = await Prompt.findByIdAndUpdate(id, payload, {
    new: true,
  })
  if (!updatedPrompt) {
    payload.image && unlinkFile(payload.image!)
    throw new AppError(StatusCodes.NOT_FOUND, 'Prompt not found.')
  }

  // need to remove old image if payload.image is exist
  payload.image && isExist.image && unlinkFile(isExist.image!)
  // if payload.questionSet is exist then make push of those questionSets and pull old one
  if (payload.questionSet) {
    if (isExist.questionSet) {
      await QuestionSet.updateOne(
        { _id: isExist.questionSet },
        { $pull: { prompts: updatedPrompt._id } }, // Remove prompt from old question set
      )
    }
    await QuestionSet.updateOne(
      { _id: payload.questionSet },
      { $push: { prompts: updatedPrompt._id } },
    )
  }
  return updatedPrompt
}

const deletePrompt = async (id: string): Promise<IPrompt | null> => {
  const result = await Prompt.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Prompt not found.')
  }
  result.isDeleted = true
  result.deletedAt = new Date()
  await result.save()
  if (result.questionSet) {
    await QuestionSet.updateOne(
      { _id: result.questionSet },
      { $pull: { prompts: result._id } }, // Remove prompt from old question set
    )
  }
  return result
}

const hardDeletePrompt = async (id: string): Promise<IPrompt | null> => {
  const result = await Prompt.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Prompt not found.')
  }
  result.image && unlinkFile(result.image)
  if (result.questionSet) {
    await QuestionSet.updateOne(
      { _id: result.questionSet },
      { $pull: { prompts: result._id } }, // Remove prompt from old question set
    )
  }
  return result
}

const getPromptById = async (id: string): Promise<IPrompt | null> => {
  const result = await Prompt.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Prompt not found.')
  }
  return result
}

// Function to deactivate expired coupons
const autoDeleteUnReferencedPrompt = async () => {
  try {
    console.log('deleting un-referenced prompt..started..')
    // Find coupons where endDate is in the past and isActive is true
    await Prompt.deleteMany({
      questionSet: null,
    })
  } catch (error) {
    console.error('Error deleting un-referenced prompt:', error)
  }
}

// Function to initialize the cron job
export const scheduleAutoDeleteUnReferencedPrompt = () => {
  cron.schedule('0 * * * *', autoDeleteUnReferencedPrompt)
}

export const PromptService = {
  createPrompt,
  getAllPrompts,
  getAllUnpaginatedPrompts,
  updatePrompt,
  deletePrompt,
  hardDeletePrompt,
  getPromptById,
}
