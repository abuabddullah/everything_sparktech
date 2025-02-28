import { StatusCodes } from 'http-status-codes';
  import ApiError from '../../../errors/ApiError';
  import { Faq } from './faq.model';
  import { IFaq } from './faq.interface';
  
  const createFaq = async (payload: IFaq): Promise<IFaq> => {
  
    const result = await Faq.create(payload);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create faq!');
    }
    return result;
  };
  
 const getAllFaqs = async (queryFields: Record<string, any>): Promise<IFaq[]> => {
  const { search, page, limit } = queryFields;
    const query = search ? { $or: [{ question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } }] } : {};
    let queryBuilder = Faq.find(query);
  
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
  
  
  const getFaqById = async (id: string): Promise<IFaq | null> => {
    const result = await Faq.findById(id);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Faq not found!');
    }
    return result;
  };
  
  const updateFaq = async (id: string, payload: IFaq): Promise<IFaq | null> => {
   
    const isExistFaq = await getFaqById(id);
    if (!isExistFaq) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Faq not found!');
    }
    
    const result = await Faq.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update faq!');
    }
    return result;
  };
  
  const deleteFaq = async (id: string): Promise<IFaq | null> => {
    const isExistFaq = await getFaqById(id);
    if (!isExistFaq) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Faq not found!');
    }
        
    const result = await Faq.findByIdAndDelete(id);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete faq!');
    }
    return result;
  };
  
  export const FaqService = {
    createFaq,
    getAllFaqs,
    getFaqById,
    updateFaq,
    deleteFaq,
  };
