import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { ICourse } from './Course.interface';
import { Course } from './Course.model';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';

const createCourse = async (payload: ICourse): Promise<ICourse> => {
     const result = await Course.create(payload);
     return result;
};

const getAllCourses = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number; }; result: ICourse[]; }> => {
     const queryBuilder = new QueryBuilder(Course.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedCourses = async (): Promise<ICourse[]> => {
     const result = await Course.find();
     return result;
};

const updateCourse = async (id: string, payload: Partial<ICourse>): Promise<ICourse | null> => {
     const isExist = await Course.findById(id);
     if (!isExist) {
          unlinkFile(payload.image!);
          throw new AppError(StatusCodes.NOT_FOUND, 'Course not found.');
     }

     unlinkFile(isExist.image!); // Unlink the old image
     return await Course.findByIdAndUpdate(id, payload, { new: true });
};

const deleteCourse = async (id: string): Promise<ICourse | null> => {
     const result = await Course.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Course not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteCourse = async (id: string): Promise<ICourse | null> => {
     const result = await Course.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Course not found.');
     }
     unlinkFile(result.image!);
     return result;
};

const getCourseById = async (id: string): Promise<ICourse | null> => {
     const result = await Course.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Course not found.');
     }
     return result;
};

export const CourseService = {
     createCourse,
     getAllCourses,
     getAllUnpaginatedCourses,
     updateCourse,
     deleteCourse,
     hardDeleteCourse,
     getCourseById
};
