import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IQuestion } from './Question.interface';
import { Question } from './Question.model';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';

const createQuestion = async (payload: IQuestion): Promise<IQuestion> => {
     const result = await Question.create(payload);
     return result;
};

const getAllQuestions = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number; }; result: IQuestion[]; }> => {
     const queryBuilder = new QueryBuilder(Question.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedQuestions = async (): Promise<IQuestion[]> => {
     const result = await Question.find();
     return result;
};

const updateQuestion = async (id: string, payload: Partial<IQuestion>): Promise<IQuestion | null> => {
     const isExist = await Question.findById(id);
     if (!isExist) {
          unlinkFile(payload.image!);
          throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.');
     }

     unlinkFile(isExist.image!); // Unlink the old image
     return await Question.findByIdAndUpdate(id, payload, { new: true });
};

const deleteQuestion = async (id: string): Promise<IQuestion | null> => {
     const result = await Question.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteQuestion = async (id: string): Promise<IQuestion | null> => {
     const result = await Question.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.');
     }
     unlinkFile(result.image!);
     return result;
};

const getQuestionById = async (id: string): Promise<IQuestion | null> => {
     const result = await Question.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.');
     }
     return result;
};

export const QuestionService = {
     createQuestion,
     getAllQuestions,
     getAllUnpaginatedQuestions,
     updateQuestion,
     deleteQuestion,
     hardDeleteQuestion,
     getQuestionById
};
