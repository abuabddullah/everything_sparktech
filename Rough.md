* payment & dashboard data

for stripe payment

if bank
    * BookingService.createBookingToDB => db
if success
    * BookingService.createBookingToDB =>  paymentRoutes.get('/success', paymenController.successPage) => webhookHandler => handlePaymentSucceeded => paymentService.createPaymentService
if cancel
    * BookingService.createBookingToDB =>  paymentRoutes.get('/cancel', paymenController.cancelPage); => webhookHandler => handlePaymentSucceeded => paymentService.createPaymentService





i need to create a multi vendor all in one ecommerce website using mongoose, express, typescript 

i need to create product schema where will be fields for category, subCategory, variants

and this variants are differet based on the category and sub category like

suppose a shopwoner can have products like, pant,mobile,hotelRoom,rice,eggs,cars,pc,laptop

so each of thier category, subCategory, variants will be some degree of variation. like pant variant can be size, color,
phone color, ram, rom can be sold in quantity
hotel quality(1star, 2star,5star) sold in quantity
rice (cooked, non cooked) sold in kg
eggs sold in dozzens
laptop color, ram, rom , ssd
and the quantity price can be varied based on products and thier variants
so on my query is how can i make schema for these so that ordering and creating updating will be error free and flixible

also help me to get the controller and service and routes too
