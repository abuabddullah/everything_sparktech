* payment & dashboard data

for stripe payment

if bank
    * BookingService.createBookingToDB => db
if success
    * BookingService.createBookingToDB =>  paymentRoutes.get('/success', paymenController.successPage) => webhookHandler => handlePaymentSucceeded => paymentService.createPaymentService
if cancel
    * BookingService.createBookingToDB =>  paymentRoutes.get('/cancel', paymenController.cancelPage); => webhookHandler => handlePaymentSucceeded => paymentService.createPaymentService








router.patch('/:id', (req: Request, res: Response, next: NextFunction) => {
    // Handle updating a vehicle by ID
});
router.patch('/:id/last-maintenance', (req: Request, res: Response, next: NextFunction) => {
    // Handle updating a vehicle's last maintenance date by ID
});
router.patch('/:status', (req: Request, res: Response, next: NextFunction) => {
    // Handle updating a vehicle's status AVAILABLE = 'AVAILABLE',RENTED = 'RENTED',MAINTENANCE = 'MAINTENANCE',SOLD = 'SOLD',
});
router.put('/:status', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ExtraServiceController.updateStatus);
router.route('/team-member/:id').patch(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),UserController.updateTeamMember)
router.route('/team-member/:id').delete(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),UserController.deleteTeamMember)
.patch(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),UserController.updateAdmin)




<!-- totaly new -->
contact us post req: https://www.figma.com/design/c2h3gyujinpAf3H1HbC4x8/Car-Rental?node-id=32-4870&t=N30y5ib0qqf4poXw-4
get for dashboard overview : https://www.figma.com/design/c2h3gyujinpAf3H1HbC4x8/Car-Rental?node-id=187-2477&t=N30y5ib0qqf4poXw-4

