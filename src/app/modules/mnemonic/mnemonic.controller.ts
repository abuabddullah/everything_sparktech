import { Request, Response } from 'express'
import { MnemonicServices } from './mnemonic.service'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'
import pick from '../../../shared/pick'
import { mnemonicFilterables } from './mnemonic.constants'
import { paginationFields } from '../../../interfaces/pagination'

const createMnemonic = catchAsync(async (req: Request, res: Response) => {
  const mnemonicData = req.body

  const result = await MnemonicServices.createMnemonic(req.user!, mnemonicData)

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Mnemonic created successfully',
    data: result,
  })
})

const getSingleMnemonic = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await MnemonicServices.getSingleMnemonic(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Mnemonic retrieved successfully',
    data: result,
  })
})

const getAllMnemonics = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, mnemonicFilterables)
  const pagination = pick(req.query, paginationFields)

  const result = await MnemonicServices.getAllMnemonics(
    req.user!,
    filterables,
    pagination,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Mnemonics retrieved successfully',
    data: result,
  })
})

const getMnemonicByCategoryId = catchAsync(
  async (req: Request, res: Response) => {
    const { categoryId } = req.params
    const result = await MnemonicServices.getMnemonicByCategoryId(categoryId)

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Mnemonics retrieved successfully',
      data: result,
    })
  },
)

const deleteMnemonic = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await MnemonicServices.deleteMnemonic(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Mnemonic deleted successfully',
    data: result,
  })
})

export const MnemonicController = {
  createMnemonic,
  getSingleMnemonic,
  getAllMnemonics,
  deleteMnemonic,
  getMnemonicByCategoryId,
}
