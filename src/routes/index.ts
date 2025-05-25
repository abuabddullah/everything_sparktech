import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { VehicleRoutes } from '../app/modules/app_modules/vehicle_modules/vehicle.route';
import { ExtraServiceRoutes } from '../app/modules/app_modules/extraServices_modules/extraService.route';
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
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
