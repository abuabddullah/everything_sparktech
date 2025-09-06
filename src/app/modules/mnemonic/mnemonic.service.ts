import { StatusCodes } from 'http-status-codes'
import { JwtPayload } from 'jsonwebtoken'
import { Types } from 'mongoose'
import ApiError from '../../../errors/ApiError'
import QueryBuilder from '../../builder/QueryBuilder'
import { Category } from '../category/category.model'
import { IMnemonic } from './mnemonic.interface'
import { Mnemonic } from './mnemonic.model'

const createMnemonic = async (
  user: JwtPayload,
  payload: IMnemonic,
): Promise<IMnemonic> => {
  try {
    const result = await Mnemonic.create(payload)
    if (!result) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Mnemonic, please try again with valid data.',
      )
    }

    return result
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found')
    }
    throw error
  }
}

// const getAllMnemonics = async (
//   user: JwtPayload,
//   filterables: IMnemonicFilterables,
//   pagination: IPaginationOptions,
// ) => {
//   const { searchTerm, ...filterData } = filterables
//   const { page, skip, limit, sortBy, sortOrder } =
//     paginationHelper.calculatePagination(pagination)

//   const andConditions = []

//   // Search functionality
//   if (searchTerm) {
//     andConditions.push({
//       $or: mnemonicSearchableFields.map(field => ({
//         [field]: {
//           $regex: searchTerm,
//           $options: 'i',
//         },
//       })),
//     })
//   }

//   // Filter functionality
//   if (Object.keys(filterData).length) {
//     andConditions.push({
//       $and: Object.entries(filterData).map(([key, value]) => ({
//         [key]: value,
//       })),
//     })
//   }

//   const whereConditions = andConditions.length ? { $and: andConditions } : {}

//   const [result, total] = await Promise.all([
//     Mnemonic.find(whereConditions)
//       .skip(skip)
//       .limit(limit)
//       .sort({ [sortBy]: sortOrder }),
//     Mnemonic.countDocuments(whereConditions),
//   ])

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//     },
//     data: result,
//   }
// }

const getAllMnemonics = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const queryBuilder = new QueryBuilder(Mnemonic.find(), query)
  const result = await queryBuilder
    .filter()
    .search(['title'])
    .sort()
    .paginate()
    .fields().modelQuery
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

const getSingleMnemonic = async (id: string): Promise<IMnemonic> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Mnemonic ID')
  }

  const result = await Mnemonic.findById(id)
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested mnemonic not found, please try again with valid id',
    )
  }

  return result
}

const getMnemonicByCategoryId = async (
  categoryId: string,
  query: Record<string, any>,
) => {
  const isExistCategory = await Category.findById(categoryId)
  if (!isExistCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found.')
  }

  const queryBuilder = new QueryBuilder(
    Mnemonic.find({ category: categoryId }),
    query,
  )
  const result = await queryBuilder
    .filter()
    .search(['title'])
    .sort()
    .paginate()
    .fields().modelQuery
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

const deleteMnemonic = async (id: string): Promise<IMnemonic> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Mnemonic ID')
  }

  const result = await Mnemonic.findByIdAndDelete(id)
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting mnemonic, please try again with valid id.',
    )
  }

  return result
}

export const MnemonicServices = {
  createMnemonic,
  getAllMnemonics,
  getSingleMnemonic,
  deleteMnemonic,
  getMnemonicByCategoryId,
}
