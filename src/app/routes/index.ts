import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { InvestRoutes } from '../modules/AppSystem/Routes/invest.route';
import { RankRoutes } from '../modules/AppSystem/Routes/rank.route';
import { FameRoutes } from '../modules/AppSystem/Routes/fame.route';
import { RufflesRoutes } from '../modules/AppSystem/Routes/ruffles.route';
import { FAQTCRoutes } from '../modules/AppSystem/Routes/FAQTC.route';
import { StripeRoutes } from '../modules/AppSystem/Routes/stripe.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  
  //AppSystem routes
  {
    path: '/invest',
    route: InvestRoutes,
  },
  {
    path: '/ranks',
    route: RankRoutes,
  },
  {
    path: '/fame',
    route: FameRoutes,
  },
  {
    path: '/ruffles',
    route: RufflesRoutes,
  },
  {
    path: '/about',
    route: FAQTCRoutes,
  },
  {
    path: '/payments',
    route: StripeRoutes,
  },

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
