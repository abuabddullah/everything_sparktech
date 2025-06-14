import { StatusCodes } from 'http-status-codes';
import { TContact } from './contactus.interface';
import { Contact } from './contactus.model';
import ApiError from '../../../../errors/ApiError';
import { emailHelper } from '../../../../helpers/emailHelper';
import QueryBuilder from '../../../builder/QueryBuilder';
import { emailTemplate } from '../../../../shared/emailTemplate';
import { User } from '../../user/user.model';
import { USER_ROLES } from '../../../../enums/user';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPE } from '../notification_modules/notification.constant';
import { sendNotifications } from '../../../../helpers/notificationsHelper';

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

     // get all the admin users from the database
     const adminUsers = await User.find({ role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] } })
     const adminUserIds = adminUsers.map(user => user._id);
     // create notification data
     const notificationData = {
          text: `You have a new Query From user ${result.name}`,
          receiver: adminUserIds, // Send to all admin users
          read: false,
          referenceId: result._id,
          category: NOTIFICATION_CATEGORIES.CONTACT,
          type: NOTIFICATION_TYPE.ADMIN,
     };
     sendNotifications(notificationData);
     return result;
};
const getAllContactsFromDB = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(Contact.find({}), query);
     const contacts = await queryBuilder.paginate().fields().paginate().search(['name']).modelQuery.exec();
     const meta = await queryBuilder.getPaginationInfo();
     return {
          meta,
          contacts,
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
