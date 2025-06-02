import { StatusCodes } from 'http-status-codes';
import { TContact } from './contactus.interface';
import { Contact } from './contactus.model';
import ApiError from '../../../../errors/ApiError';
import { emailHelper } from '../../../../helpers/emailHelper';
import QueryBuilder from '../../../builder/QueryBuilder';
import { emailTemplate } from '../../../../shared/emailTemplate';

const createContactToDB = async (contactData: TContact) => {
     const result = await Contact.create(contactData);
     if (!result) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create contact');
     }
     //   Todo: send email\
     const contactEmailData = {
          email: result.email,
          name: result.name,
          subject: result.subject,
          message: result.message,
     };
     const contactEmailTemplate = emailTemplate.contact(contactEmailData);
     emailHelper.sendEmail(contactEmailTemplate);
     return result;
};
const getAllContactsFromDB = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(Contact.find({}), query);
     const contacts = await queryBuilder.paginate().fields().paginate().search(['name']).modelQuery.exec();
     const meta = await queryBuilder.getPaginationInfo();
     return {
          contacts,
          meta,
     };
};
const getSingleContactFromDB = async (id: string) => {
     const result = await Contact.findById(id);
     if (!result) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Contact not found');
     }
     return result;
};
export const ContactService = {
     createContactToDB,
     getAllContactsFromDB,
     getSingleContactFromDB,
};
