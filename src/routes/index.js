const express = require('express');

const router = express.Router();

const authRoutes = require('../modules/Auth/auth.route');
const userRoutes = require('../modules/User/user.route');
const reviewRoutes = require('../modules/Review/review.route');
const feedbackRoutes = require('../modules/Feedback/feedback.route');
const paymentDataRoutes = require('../modules/PaymentData/paymentData.route');

// routes for load, load request, truck details
const loadRoutes = require('../modules/Load/load.route');
const truckDetailsRoutes = require('../modules/TruckDetails/truckDetails.route');
const mapRoutes = require('../modules/Map/map.route');

// routes for chat, message and notification 
const chatRoutes = require('../modules/Chat/chat.route');
const messageRoutes = require('../modules/Message/message.route');
const notificationRoutes = require('../modules/Notification/notification.route');

// routes for subscription and my subscription
const subscriptionRoutes = require('../modules/Subscription/subscription.route');
const mySubscriptionRoutes = require('../modules/MySubscription/mySubscription.route');

// routes for privacy policy, terms and conditions, about us, contact us etc.
const staticContentRoutes = require('../modules/StaticContent/staticContent.route');
// Load and Load Request routes
const loadsRoutes = require('../modules/Load/load.route');  
// Load and Load Request routes
const loadRequestRoutes = require('../modules/LoadRequest/loadRequest.route');  

// Shipment routes
const shipmentRoutes = require('../modules/Shipment/shipment.route');

// Preferred Driver routes  
const preferredDriverRoutes = require('../modules/PreferredDriver/preferredDriver.route');




const moduleRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/loads',
    route: loadsRoutes,
  },
  {
    path: '/shipment',
    route: shipmentRoutes,
  },
  {
    path: '/loads-request',
    route: loadRequestRoutes,
  },
  {
    path: '/preferred-driver',
    route: preferredDriverRoutes,
  },
  {
    path: '/truck-details',
    route: truckDetailsRoutes,
  },
  {
    path: '/maps',
    route: mapRoutes,
  },
  {
    path: '/static-contents',
    route: staticContentRoutes,
  },
  {
    path: '/reviews',
    route: reviewRoutes,
  },
  {
    path: '/feedbacks',
    route: feedbackRoutes,
  },
  {
    path: '/payment-data',
    route: paymentDataRoutes,
  },
  {
    path: '/notifications',
    route: notificationRoutes,
  },
  {
    path: '/chats',
    route: chatRoutes,
  },
  {
    path: '/messages',
    route: messageRoutes,
  },
  {
    path: '/subscriptions',
    route: subscriptionRoutes,
  },
  {
    path: '/my-subscriptions',
    route: mySubscriptionRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

module.exports = router;