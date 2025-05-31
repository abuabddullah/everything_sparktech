"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../app/modules/auth/auth.route");
const user_route_1 = require("../app/modules/user/user.route");
const vehicle_route_1 = require("../app/modules/app_modules/vehicle_modules/vehicle.route");
const extraService_route_1 = require("../app/modules/app_modules/extraServices_modules/extraService.route");
const location_route_1 = require("../app/modules/app_modules/location_modules/location.route");
const booking_route_1 = require("../app/modules/app_modules/booking_modules/booking.route");
const review_routes_1 = require("../app/modules/app_modules/review/review.routes");
const client_route_1 = require("../app/modules/app_modules/client_modules/client.route");
const cms_route_1 = require("../app/modules/app_modules/cms_modules/cms.route");
const router = express_1.default.Router();
const apiRoutes = [
    {
        path: '/user',
        route: user_route_1.UserRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
    {
        path: '/vehicle',
        route: vehicle_route_1.VehicleRoutes,
    },
    {
        path: '/extra-service',
        route: extraService_route_1.ExtraServiceRoutes,
    },
    {
        path: '/location',
        route: location_route_1.LocationRoutes,
    },
    {
        path: '/booking',
        route: booking_route_1.BookingRoutes,
    },
    {
        path: '/client',
        route: client_route_1.ClientRoutes,
    },
    {
        path: '/review',
        route: review_routes_1.ReviewRoutes,
    },
    {
        path: '/company-cms',
        route: cms_route_1.companyCMSRoutes,
    },
];
apiRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
