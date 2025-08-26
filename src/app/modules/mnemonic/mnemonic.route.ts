import express from 'express'
import { MnemonicController } from './mnemonic.controller'
import { MnemonicValidations } from './mnemonic.validation'
import validateRequest from '../../middleware/validateRequest'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.get('/', MnemonicController.getAllMnemonics)

router.get('/:id', MnemonicController.getSingleMnemonic)

router.get('/category/:categoryId', MnemonicController.getMnemonicByCategoryId)

router.post(
  '/',
  auth(USER_ROLES.ADMIN),

  validateRequest(MnemonicValidations.create),
  MnemonicController.createMnemonic,
)

router.delete('/:id', auth(USER_ROLES.ADMIN), MnemonicController.deleteMnemonic)

export const MnemonicRoutes = router
