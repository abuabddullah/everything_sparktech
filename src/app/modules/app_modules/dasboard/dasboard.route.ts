import { Request, Response, Router } from 'express';
import { BookingModel } from '../booking_modules/booking.model';
import { Vehicle } from '../vehicle_modules/vehicle.model';
import { PaymentModel } from '../payment/payment.model';
import { VEHICLE_STATUS } from '../../../../enums/vehicle';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import { PAYMENT_STATUS } from '../../../../enums/payment';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import ApiError from '../../../../errors/ApiError';

const router = Router();
/* 
router.get('/', auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN), catchAsync(async (req: Request, res: Response) => {
    // Get total reservations
    const totalReservationsPromise = BookingModel.countDocuments();

    // Get active cars (available, rented, or in maintenance)
    const activeCarsPromise = Vehicle.countDocuments({
        status: {
            $in: [
                VEHICLE_STATUS.AVAILABLE,
                VEHICLE_STATUS.RENTED,
                VEHICLE_STATUS.UNDER_MAINTENANCE
            ]
        }
    });

    // Get total revenue from paid payments
    const totalRevenuePromise = PaymentModel.aggregate([
        {
            $match: {
                status: PAYMENT_STATUS.PAID
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);

    // Get bookings grouped by year and month
    const totalBookingsByMonthPromise = BookingModel.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                '_id.year': -1,
                '_id.month': 1
            }
        }
    ]);

    // Get fleet overview - count of vehicles by status
    const fleetOverviewPromise = Vehicle.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Get revenue analytics grouped by year and month
    const revenueAnalyticsByMonthPromise = PaymentModel.aggregate([
        {
            $match: {
                status: PAYMENT_STATUS.PAID
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                total: { $sum: '$amount' }
            }
        },
        {
            $sort: {
                '_id.year': -1,
                '_id.month': 1
            }
        }
    ]);

    // Execute all promises in parallel
    const [
        totalReservations,
        activeCars,
        totalRevenueAgg,
        totalBookingsByMonthAgg,
        fleetOverviewAgg,
        revenueAnalyticsByMonthAgg
    ] = await Promise.all([
        totalReservationsPromise,
        activeCarsPromise,
        totalRevenuePromise,
        totalBookingsByMonthPromise,
        fleetOverviewPromise,
        revenueAnalyticsByMonthPromise
    ]);

    // Extract total revenue or default to 0
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Month names for consistent mapping
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    // Initialize empty month data for a year
    const getEmptyMonthData = () => {
        return monthNames.reduce((months, month) => {
            months[month] = 0;
            return months;
        }, {} as Record<string, number>);
    };

    // Transform bookings data by year and month
    const totalBookingsByMonth = totalBookingsByMonthAgg.reduce((acc, item) => {
        const year = item._id.year;
        const monthIndex = item._id.month - 1;

        if (!acc[year]) {
            acc[year] = getEmptyMonthData();
        }

        acc[year][monthNames[monthIndex]] = item.count;
        return acc;
    }, {} as Record<number, Record<string, number>>);

    // Transform revenue data by year and month
    const revenueAnalyticsByMonth = revenueAnalyticsByMonthAgg.reduce((acc, item) => {
        const year = item._id.year;
        const monthIndex = item._id.month - 1;

        if (!acc[year]) {
            acc[year] = getEmptyMonthData();
        }

        acc[year][monthNames[monthIndex]] = Number(item.total.toFixed(2));
        return acc;
    }, {} as Record<number, Record<string, number>>);

    // Transform fleet overview data
    const fleetOverview = {
        available: 0,
        rented: 0,
        maintenance: 0
    };

    fleetOverviewAgg.forEach(item => {
        switch (item._id) {
            case VEHICLE_STATUS.AVAILABLE:
                fleetOverview.available = item.count;
                break;
            case VEHICLE_STATUS.RENTED:
                fleetOverview.rented = item.count;
                break;
            case VEHICLE_STATUS.UNDER_MAINTENANCE:
                fleetOverview.maintenance = item.count;
                break;
        }
    });

    // Ensure at least current year exists in data
    const currentYear = new Date().getFullYear();
    if (!totalBookingsByMonth[currentYear]) {
        totalBookingsByMonth[currentYear] = getEmptyMonthData();
    }
    if (!revenueAnalyticsByMonth[currentYear]) {
        revenueAnalyticsByMonth[currentYear] = getEmptyMonthData();
    }

    // Send response
    res.json({
        totalReservations,
        activeCars,
        totalRevenue,
        fleetOverview,
    });
}));
 */

router.get('/:month', auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN), catchAsync(async (req: Request, res: Response) => {
    console.log({ month: req.params.month });
    // Get month from params or use current month
    const targetDate = req.params.month ? new Date(req.params.month) : new Date();
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    // Get start of current day for fleet overview
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Get total reservations for the month
    const totalReservationsPromise = BookingModel.countDocuments({
        createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
    });

    // Get active cars for the month
    const activeCarsPromise = Vehicle.countDocuments({
        status: {
            $in: [
                VEHICLE_STATUS.AVAILABLE,
                VEHICLE_STATUS.RENTED,
                VEHICLE_STATUS.UNDER_MAINTENANCE
            ]
        },
        createdAt: {
            $lte: endOfMonth
        }
    });

    // Get total revenue from paid payments for the month
    const totalRevenuePromise = PaymentModel.aggregate([
        {
            $match: {
                status: PAYMENT_STATUS.PAID,
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);


    // Get fleet overview - count of vehicles by status
    const fleetOverviewPromise = Vehicle.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Execute all promises in parallel
    const [
        totalReservations,
        activeCars,
        totalRevenueAgg,
        fleetOverviewAgg
    ] = await Promise.all([
        totalReservationsPromise,
        activeCarsPromise,
        totalRevenuePromise,
        fleetOverviewPromise
    ]);

    // Extract total revenue or default to 0
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Transform fleet overview data to match required structure
    const fleetOverview = {
        available: 0,
        rented: 0,
        maintenance: 0
    };

    fleetOverviewAgg.forEach(item => {
        switch (item._id) {
            case VEHICLE_STATUS.AVAILABLE:
                fleetOverview.available = item.count;
                break;
            case VEHICLE_STATUS.RENTED:
                fleetOverview.rented = item.count;
                break;
            case VEHICLE_STATUS.UNDER_MAINTENANCE:
                fleetOverview.maintenance = item.count;
                break;
        }
    });

    // Send response in required format
    res.json({
        totalReservations,
        activeCars,
        totalRevenue,
        fleetOverview
    });
}));

router.get('/booking/:year', auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN), catchAsync(async (req, res) => {
    const year = parseInt(req.params.year);

    if (isNaN(year)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid year provided');
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    const bookings = await BookingModel.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lt: endDate }
            }
        },
        {
            $group: {
                _id: { month: { $month: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.month': 1 }
        }
    ]);

    const totalBookingsByMonth = monthNames.reduce((acc, month) => {
        acc[month] = 0;
        return acc;
    }, {} as Record<string, number>);

    bookings.forEach(b => {
        const monthKey = monthNames[b._id.month - 1];
        totalBookingsByMonth[monthKey] = b.count;
    });

    res.json({ totalBookingsByMonth });
}));

router.get('/revenue/:year', auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN), catchAsync(async (req, res) => {
    const year = parseInt(req.params.year);

    if (isNaN(year)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid year provided');
    }

    const startDate = new Date(year, 0, 1); // Jan 1
    const endDate = new Date(year + 1, 0, 1); // Jan 1 of next year

    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    const revenue = await PaymentModel.aggregate([
        {
            $match: {
                status: PAYMENT_STATUS.PAID,
                createdAt: { $gte: startDate, $lt: endDate }
            }
        },
        {
            $group: {
                _id: { month: { $month: '$createdAt' } },
                total: { $sum: '$amount' }
            }
        },
        {
            $sort: { '_id.month': 1 }
        }
    ]);

    const revenueAnalyticsByMonth = monthNames.reduce((acc, month) => {
        acc[month] = 0;
        return acc;
    }, {} as Record<string, number>);

    revenue.forEach(r => {
        const monthKey = monthNames[r._id.month - 1];
        revenueAnalyticsByMonth[monthKey] = parseFloat(r.total.toFixed(2));
    });

    res.json({ revenueAnalyticsByMonth });
}));

export const DashboardRoutes = router;