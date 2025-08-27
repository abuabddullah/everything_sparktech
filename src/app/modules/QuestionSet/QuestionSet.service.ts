import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IQuestionSet } from './QuestionSet.interface';
import { QuestionSet } from './QuestionSet.model';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';

const createQuestionSet = async (payload: IQuestionSet): Promise<IQuestionSet> => {
     const result = await QuestionSet.create(payload);
     return result;
};

const getAllQuestionSets = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number; }; result: IQuestionSet[]; }> => {
     const queryBuilder = new QueryBuilder(QuestionSet.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedQuestionSets = async (): Promise<IQuestionSet[]> => {
     const result = await QuestionSet.find();
     return result;
};

const updateQuestionSet = async (id: string, payload: Partial<IQuestionSet>): Promise<IQuestionSet | null> => {
     const isExist = await QuestionSet.findById(id);
     if (!isExist) {
          unlinkFile(payload.image!);
          throw new AppError(StatusCodes.NOT_FOUND, 'QuestionSet not found.');
     }

     unlinkFile(isExist.image!); // Unlink the old image
     return await QuestionSet.findByIdAndUpdate(id, payload, { new: true });
};

const deleteQuestionSet = async (id: string): Promise<IQuestionSet | null> => {
     const result = await QuestionSet.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'QuestionSet not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteQuestionSet = async (id: string): Promise<IQuestionSet | null> => {
     const result = await QuestionSet.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'QuestionSet not found.');
     }
     unlinkFile(result.image!);
     return result;
};

const getQuestionSetById = async (id: string): Promise<IQuestionSet | null> => {
     const result = await QuestionSet.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'QuestionSet not found.');
     }
     return result;
};

export const QuestionSetService = {
     createQuestionSet,
     getAllQuestionSets,
     getAllUnpaginatedQuestionSets,
     updateQuestionSet,
     deleteQuestionSet,
     hardDeleteQuestionSet,
     getQuestionSetById
};
