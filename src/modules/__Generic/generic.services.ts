import { StatusCodes } from 'http-status-codes';
import ApiError from '../../errors/ApiError';
import { PaginateOptions } from '../../types/paginate';
import { Model, Mongoose } from 'mongoose';

export class GenericService<  ModelType , InterfaceType> {
  model: ModelType | any; 

  constructor(model: ModelType ) {
    this.model = model;
  }

  async create(data:InterfaceType) : Promise<InterfaceType> {
   
      return await this.model.create(data);
  }

  async createAndPopulateSpecificFields(data:InterfaceType, populateOptions?: (string | any)[]) : Promise<InterfaceType> {
    // Create the document
    const createdObject = await this.model.create(data);
    
    // If populate options are provided, fetch and populate
    if (populateOptions && populateOptions.length > 0) {
        return await this.getById(createdObject._id.toString(), populateOptions);
    }
    
    return createdObject;
  }

  async getAll() {
    return await this.model.find({isDeleted : false}).select('-__v');
  }

  async getAllWithPagination(
    filters: any, // Partial<INotification> // FixMe : fix type
    options: PaginateOptions,
    populateOptions?: any,
    select ? : string | string[]
  ) {

    const result = await this.model.paginate(filters, options, populateOptions, select);

    /*
    const result = await this.model.paginate(
       filters, // ISSUE :  may be issue thakte pare .. Test korte hobe .. 
      { ...filters, isDeleted : false },
      options);
    */
    return result;
  }
  
  async getById(id: string, populateOptions?: (string | any)[]) : Promise<InterfaceType | null> {
    /********************
        const object = await this.model.findById(id).populate(needToPopulate).select('-__v');
        if (!object) {
          // throw new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded');
          return null;
        }
        return object;
    ******************** */

    // INFO : populateOptions can be an array of strings or objects 

    /*****************
      
      populateOptions example : 

      const populateOptions = [
        {
            path: 'attachments',
            select: 'attachment'
        },
        //'siteId' // This will populate all fields for siteId
        {
          path: 'siteId',
          select: 'name address'
        }
      ];
    
     * **************** */

    let query = this.model.findById(id);
    
    if (populateOptions && populateOptions.length > 0) {
        
        /**************** 🟢 working perfectly 
        populateOptions.forEach(option => {
            if (typeof option === 'string') {
                query = query.populate(option);
            } else {
                query = query.populate(option);
            }
        });


        ************* */

        /*************
         * 
         * // If you want to keep backward compatibility with your old getById method
         * 
         * *********** */

        // Check if it's the old format (array of strings)
        if (typeof populateOptions[0] === 'string') {
            // Old format: ['attachments', 'siteId']
            populateOptions.forEach(field => {
                query = query.populate(field as string);
            });
        } else {
            // New format: [{path: 'attachments', select: 'filename'}, ...]
            populateOptions.forEach(option => {
                query = query.populate(option);
            });
        }
    }
    
    const object = await query.select('-__v');
    if (!object) {
        return null;
    }
    return object;

  }

  
  async updateById(id: string, data: InterfaceType) {
    const object = await this.model.findById(id).select('-__v');
    if (!object) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No Object Found');
      //   return null;
    }

    return await this.model.findByIdAndUpdate(id, data, { new: true }).select('-__v');
  }

  async deleteById(id: string) {
    return await this.model.findByIdAndDelete(id).select('-__v');
  }

  // TODO :  need to use this service .. 
  async aggregate(pipeline: any[]) {
    return await this.model.aggregate(pipeline);
  }

  async softDeleteById(id: string) {
    return await this.model.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
  }
}
