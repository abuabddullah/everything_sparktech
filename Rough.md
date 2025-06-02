* payment & dashboard data

for stripe payment

if bank
    * BookingService.createBookingToDB => db
if success
    * BookingService.createBookingToDB =>  paymentRoutes.get('/success', paymenController.successPage) => webhookHandler => handlePaymentSucceeded => paymentService.createPaymentService
if cancel
    * BookingService.createBookingToDB =>  paymentRoutes.get('/cancel', paymenController.cancelPage); => webhookHandler => handlePaymentSucceeded => paymentService.createPaymentService







router.route('/team-member/:id').patch(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),UserController.updateTeamMember)
router.route('/team-member/:id').delete(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),UserController.deleteTeamMember)




<!-- totaly new -->
get for dashboard overview : https://www.figma.com/design/c2h3gyujinpAf3H1HbC4x8/Car-Rental?node-id=187-2477&t=N30y5ib0qqf4poXw-4

