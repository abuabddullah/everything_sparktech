* payment & dashboard data

for stripe payment

if bank
    * BookingService.createBookingToDB => db
if success
    * BookingService.createBookingToDB =>  paymentRoutes.get('/success', paymenController.successPage) => webhookHandler => handlePaymentSucceeded => paymentService.createPaymentService
if cancel
    * BookingService.createBookingToDB =>  paymentRoutes.get('/cancel', paymenController.cancelPage); => webhookHandler => handlePaymentSucceeded => paymentService.createPaymentService