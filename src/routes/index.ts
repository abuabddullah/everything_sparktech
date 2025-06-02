import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { VehicleRoutes } from '../app/modules/app_modules/vehicle_modules/vehicle.route';
import { ExtraServiceRoutes } from '../app/modules/app_modules/extraServices_modules/extraService.route';
import { LocationRoutes } from '../app/modules/app_modules/location_modules/location.route';
import { BookingRoutes } from '../app/modules/app_modules/booking_modules/booking.route';
import { ReviewRoutes } from '../app/modules/app_modules/review/review.routes';
import { ClientRoutes } from '../app/modules/app_modules/client_modules/client.route';
import { companyCMSRoutes } from '../app/modules/app_modules/cms_modules/cms.route';
import { paymentRoutes } from '../app/modules/app_modules/payment/payment.route';
import { ContactRoutes } from '../app/modules/app_modules/contcatus/contactus.route';
import { DashboardRoutes } from '../app/modules/app_modules/dasboard/dasboard.route';
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
    path: '/vehicle',
    route: VehicleRoutes,
  },
  {
    path: '/extra-service',
    route: ExtraServiceRoutes,
  },
  {
    path: '/location',
    route: LocationRoutes,
  },
  {
    path: '/booking',
    route: BookingRoutes,
  },
  {
    path: '/client',
    route: ClientRoutes,
  },
  {
    path: '/review',
    route: ReviewRoutes,
  },
  {
    path: '/company-cms',
    route: companyCMSRoutes,
  },
  {
    path: '/payment',
    route: paymentRoutes,
  },
  {
    path: '/contact',
    route: ContactRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
