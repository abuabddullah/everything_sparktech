export const calculateAmount = (amount) => {
  return Number(amount) * 100;
};
import Stripe from "stripe";

const stripe = new Stripe(
  "sk_test_51P4idwCjdDPhGLVk4wkUW1mZfjsMslXcOxsjFhOH03fVzYHiwvotf0nmwFnDRb6TgNk5gGJMdGMkrgsSkjlNPr2o002S03JXYb",
  {
    apiVersion: "2024-12-18.acacia",
    typescript: true,
  }
);

export const createCheckoutSession = async (payload) => {
  const { _id, subcriptionId, amount, subcriptionName, subscriptionData } =
    payload;

  const { duration, noOfDispatches } = subscriptionData;

  let paymentGatewayData;
  if (_id && subcriptionId && amount) {
    paymentGatewayData = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: subcriptionName,
              description: "Please,fill up your information",
              images: payload?.images,
            },
            unit_amount: payload.amount * 100,
          },
          quantity: 1,
        },
      ],

      // success_url: `https://google.com`,
      // success_url: `http://10.0.70.87:8030/api/v1/payment-requests/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&userId=${_id}&amount=${amount}&subcriptionId=${subcriptionId}&duration=${duration}&noOfDispatches=${noOfDispatches}`,

      success_url: `https://api.ootms.com/api/v1/payment-requests/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&userId=${_id}&amount=${amount}&subcriptionId=${subcriptionId}&duration=${duration}&noOfDispatches=${noOfDispatches}`,

      cancel_url: `https://api.ootms.com/api/v1/payments/cancel?paymentId=${"paymentDummy"}`,
      mode: "payment",

      invoice_creation: {
        enabled: true,
      },
    });
  } else {
    return res.status("200").json(
      response({
        status: "Success",
        statusCode: "200",
        type: "payment",
        message: req.t("payment-list"),
        data: paymentResult,
      })
    );
  }

  console.log(paymentGatewayData, "paymentGatewayData");



  return paymentGatewayData.url;
};
