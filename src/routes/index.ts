import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { EventRoutes } from '../app/modules/event/event.route';
import { GroupRoutes } from '../app/modules/group/group.route';
import { MessageRoutes } from '../app/modules/message/message.route';
import { InfoRoutes } from '../app/modules/info/info.route';
import { OrganizationsRoutes } from '../app/modules/organizations/organizations.route';
import { JobRoutes } from '../app/modules/job/job.route';
import { ApplicantRoutes } from '../app/modules/applicant/applicant.route';
import { PackageRoutes } from '../app/modules/package/package.route';
import { SubscriptionRoutes } from '../app/modules/subscription/subscription.route';
import { FaqRoutes } from '../app/modules/faq/faq.route';
import { TermsAndConditionsRoutes } from '../app/modules/termsAndConditions/termsAndConditions.route';
import { ReviewRoutes } from '../app/modules/review/review.route';

const router = express.Router();

const apiRoutes = [
{
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/event',
    route: EventRoutes,
  },
  {
    path: '/group',
    route: GroupRoutes,
  },
  {
    path: '/message',
    route: MessageRoutes,
  },
  {
    path: '/info',
    route: InfoRoutes,
  },
  {
    path: '/organizations',
    route: OrganizationsRoutes,
  },
  {
    path: '/job',
    route: JobRoutes,
  },
  {
    path: '/applicant',
    route: ApplicantRoutes,
  },
  {
    path: '/package',
    route: PackageRoutes,
  },
  {
    path: '/subscription',
    route: SubscriptionRoutes,
  },
  {
    path: '/faq',
    route: FaqRoutes,
  },
  {
    path: '/termsAndConditions',
    route: TermsAndConditionsRoutes,
  },
  {
    path: '/review',
    route: ReviewRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
