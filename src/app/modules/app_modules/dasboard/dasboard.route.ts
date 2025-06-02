import { Router } from 'express';
import { BookingModel } from '../booking_modules/booking.model';
import { Vehicle } from '../vehicle_modules/vehicle.model';
import { PaymentModel } from '../payment/payment.model';
import { VEHICLE_STATUS } from '../../../../enums/vehicle';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import { PAYMENT_STATUS } from '../../../../enums/payment';

const router = Router();

router.get('/', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        // Total Reservations
        const totalReservationsPromise = await BookingModel.countDocuments();

        // Active Cars (available or rented)
        const activeCarsPromise = await Vehicle.countDocuments({ status: { $in: [VEHICLE_STATUS.AVAILABLE, VEHICLE_STATUS.RENTED, VEHICLE_STATUS.MAINTENANCE] } });

        // Total Revenue
        const totalRevenuePromise = PaymentModel.aggregate([
            { $match: { status: PAYMENT_STATUS.PAID } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Total Bookings By Month (current year)
        const totalBookingsByMonthPromise = BookingModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                        $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Fleet Overview
        const fleetOverviewPromise = Vehicle.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Revenue Analytics By Month (current year)
        const revenueAnalyticsByMonthPromise = PaymentModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                        $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Await all promises in parallel
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

        // Prepare totalRevenue
        const totalRevenue = totalRevenueAgg[0]?.total || 0;

        // Prepare totalBookingsByMonth (fill missing months with 0)
        const totalBookingsByMonth = Array(12).fill(0);
        totalBookingsByMonthAgg.forEach(item => {
            totalBookingsByMonth[item._id - 1] = item.count;
        });

        // Prepare revenueAnalyticsByMonth (fill missing months with 0)
        const revenueAnalyticsByMonth = Array(12).fill(0);
        revenueAnalyticsByMonthAgg.forEach(item => {
            revenueAnalyticsByMonth[item._id - 1] = item.total;
        });

        // Prepare fleetOverview
        const fleetOverview = {
            available: 0,
            rented: 0,
            maintenance: 0
        };
        fleetOverviewAgg.forEach(item => {
            if (item._id === VEHICLE_STATUS.AVAILABLE) fleetOverview.available = item.count;
            if (item._id === VEHICLE_STATUS.RENTED) fleetOverview.rented = item.count;
            if (item._id === VEHICLE_STATUS.MAINTENANCE) fleetOverview.maintenance = item.count;
        });

        // Month names for mapping
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

        // Convert totalBookingsByMonth array to object with month names
        const totalBookingsByMonthObj = monthNames.reduce((acc, month, idx) => {
            acc[month] = totalBookingsByMonth[idx] || 0;
            return acc;
        }, {} as Record<string, number>);

        // Convert revenueAnalyticsByMonth array to object with month names
        const revenueAnalyticsByMonthObj = monthNames.reduce((acc, month, idx) => {
            acc[month] = revenueAnalyticsByMonth[idx] || 0;
            return acc;
        }, {} as Record<string, number>);

        res.json({
            totalReservations,
            activeCars,
            totalRevenue,
            totalBookingsByMonth: totalBookingsByMonthObj,
            fleetOverview,
            revenueAnalyticsByMonth: revenueAnalyticsByMonthObj
        });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

export const DashboardRoutes = router;