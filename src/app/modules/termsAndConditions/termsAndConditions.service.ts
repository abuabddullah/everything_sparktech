import { StatusCodes } from 'http-status-codes';
  import ApiError from '../../../errors/ApiError';
  import { TermsAndConditions } from './termsAndConditions.model';
  import { ITermsAndConditions } from './termsAndConditions.interface';
  
  const createTermsAndConditions = async (payload: ITermsAndConditions): Promise<ITermsAndConditions> => {
  
    const result = await TermsAndConditions.create(payload);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create termsAndConditions!');
    }
    return result;
  };
  
 const getAllTermsAndConditionss = async (queryFields: Record<string, any>): Promise<ITermsAndConditions[]> => {
  const { search, page, limit } = queryFields;
    const query = search ? { $or: [{ description: { $regex: search, $options: 'i' } }] } : {};
    let queryBuilder = TermsAndConditions.find(query);
  
    if (page && limit) {
      queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
    }else{
      queryBuilder = queryBuilder.skip(0).limit(10);
    
    }
    delete queryFields.search;
    delete queryFields.page;
    delete queryFields.limit;
    queryBuilder.find(queryFields);
    return await queryBuilder;
  };
  
  
  const getTermsAndConditionsById = async (id: string): Promise<ITermsAndConditions | null> => {
    const result = await TermsAndConditions.findById(id);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'TermsAndConditions not found!');
    }
    return result;
  };
  
  const updateTermsAndConditions = async (id: string, payload: ITermsAndConditions): Promise<ITermsAndConditions | null> => {
   
    const isExistTermsAndConditions = await getTermsAndConditionsById(id);
    if (!isExistTermsAndConditions) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'TermsAndConditions not found!');
    }
    
    const result = await TermsAndConditions.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update termsAndConditions!');
    }
    return result;
  };
  
  const deleteTermsAndConditions = async (id: string): Promise<ITermsAndConditions | null> => {
    const isExistTermsAndConditions = await getTermsAndConditionsById(id);
    if (!isExistTermsAndConditions) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'TermsAndConditions not found!');
    }
        
    const result = await TermsAndConditions.findByIdAndDelete(id);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete termsAndConditions!');
    }
    return result;
  };
  
  export const TermsAndConditionsService = {
    createTermsAndConditions,
    getAllTermsAndConditionss,
    getTermsAndConditionsById,
    updateTermsAndConditions,
    deleteTermsAndConditions,
  };
