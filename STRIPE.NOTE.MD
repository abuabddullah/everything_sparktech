# stripe for subscription payment (recursieve payment system)
* যখনি কোন user / client create হচ্ছে তখনি সাথে সাথে তাদের email & name দিয়ে stripe এর server এ stripe customer create করা হচ্ছে। যা আমাদেরকে একটা id(stripe server এর থেকে generated) return করছে সেটা আমরা user collection এ saved করে রাখছি

*src\app\modules\user\user.service.ts*
```

     let stripeCustomer;
     try {
          stripeCustomer = await stripe.customers.create({
               email: createUser.email,
               name: createUser.name,
          });
     } catch (error) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create Stripe customer');
     }

     createUser.stripeCustomerId = stripeCustomer.id;
     await User.findOneAndUpdate({ _id: createUser._id }, { $set: { authentication, stripeCustomerId: stripeCustomer.id } });
     return createUser;
```


* যখন কোন package create করব তাঁর আগে সেই package এর title,description,duration,price দিয়ে *createSubscriptionProduct* এ *stripe.products.create ও stripe.prices.create* create করে নিতে হবে ও stripe server থেকে প্রাপ্ত *productId ও priceId* সহ *PackageModel* এ package create করতে হবে

*src\app\modules\package\package.service.ts*
```

const createPackageToDB = async (payload: IPackage): Promise<IPackage | null> => {
     const productPayload = {
          title: payload.title,
          description: payload.description,
          duration: payload.duration,
          price: Number(payload.price),
     };

     const product = await createSubscriptionProduct(productPayload);

     if (!product) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create subscription product');
     }

     if (product) {
          payload.priceId = product.priceId;
          payload.productId = product.productId;
     }

     const result = await Package.create(payload);
     if (!result) {
          await stripe.products.del(product.productId);
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to created Package');
     }

     return result;
};
```

*src\helpers\stripe\createSubscriptionProductHelper.ts*
```

export const createSubscriptionProduct = async (payload: Partial<IPackage>): Promise<{ productId: string; priceId: string } | null> => {
     // Create Product in Stripe
     const product = await stripe.products.create({
          name: payload.title as string,
          description: payload.description as string,
     });

     let interval: 'month' | 'year' = 'month'; // Default to 'month'
     let intervalCount = 1; // Default to every 1 month

     // Map duration to interval_count
     switch (payload.duration) {
          case '1 month':
               interval = 'month';
               intervalCount = 1;
               break;
          case '3 months':
               interval = 'month';
               intervalCount = 3;
               break;
          case '6 months':
               interval = 'month';
               intervalCount = 6;
               break;
          case '1 year':
               interval = 'year';
               intervalCount = 1;
               break;
          default:
               interval = 'month';
               intervalCount = 1;
     }

     // Create Price for the Product
     const price = await stripe.prices.create({
          product: product.id,
          unit_amount: Number(payload.price) * 100, // in cents
          currency: 'usd', // or your chosen currency
          recurring: { interval, interval_count: intervalCount },
     });

     if (!price) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create price in Stripe');
     }

     // Create a Payment Link
     // const paymentLink = await stripe.paymentLinks.create({
     //     line_items: [
     //         {
     //             price: price.id,
     //             quantity: 1,
     //         },
     //     ],
     //     after_completion: {
     //         type: 'redirect',
     //         redirect: {
     //             url: `${config.stripe.frontend_url}`, // Redirect URL on successful payment
     //         },
     //     },
     //     metadata: {
     //         productId: product.id,
     //     },
     // });

     // if (!paymentLink.url) {
     //     throw new AppError(StatusCodes.BAD_REQUEST, "Failed to create payment link");
     // }

     return { productId: product.id, priceId: price.id };
};
```

<!-- things to know -->
- - stripe price : recurring এ আর কি কি আছে?

* যখন কোন package._id দিয়ে একটা package কে upadate করব তহন, packageModel থেকে exact package কে নিয়ে এসে আগে তাঁর stripe সার্ভেরের যে subscription create করে রেখেছিলাম create package এ সেই info কে edit করব অর্থাৎ আবারো নতুন এ payload data দিয়ে *stripe.products.create ও stripe.prices.create* create করে নিতে হবে ও stripe server থেকে প্রাপ্ত *updatedProduct ও newPriceId* সহ সহ *PackageModel* এ package updated করতে হবে

*src\app\modules\package\package.service.ts*
```
const updatePackageToDB = async (id: string, payload: IPackage): Promise<IPackage | null> => {
     const isExistPackage: any = await Package.findById(id);
     if (!isExistPackage) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
     }

     const updatedProduct = await updateSubscriptionInfo(isExistPackage.productId, payload);

     if (!updatedProduct) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update subscription product in Stripe');
     }

     payload.priceId = updatedProduct.priceId;
     payload.productId = updatedProduct.productId;

     const updatedPackage = await Package.findByIdAndUpdate(id, payload, {
          new: true,
          runValidators: true,
     });

     if (!updatedPackage) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update package');
     }

     return updatedPackage;
};
```
*src\helpers\stripe\updateSubscriptionProductInfo.ts*
```

export const updateSubscriptionInfo = async (productId: string, payload: Partial<IPackage>): Promise<{ productId: string; priceId: string }> => {
     const updatedProduct = await stripe.products.update(productId, {
          name: (payload.title as string) || undefined,
          description: (payload.description as string) || undefined,
     });

     if (!updatedProduct) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update product in Stripe');
     }

     let interval: 'month' | 'year' = 'month';
     let intervalCount = 1;

     switch (payload.duration) {
          case '1 month':
               interval = 'month';
               intervalCount = 1;
               break;
          case '3 months':
               interval = 'month';
               intervalCount = 3;
               break;
          case '6 months':
               interval = 'month';
               intervalCount = 6;
               break;
          case '1 year':
               interval = 'year';
               intervalCount = 1;
               break;
          default:
               interval = 'month';
               intervalCount = 1;
     }

     const newPrice = await stripe.prices.create({
          product: productId,
          unit_amount: Number(payload.price) * 100,
          currency: 'usd',
          recurring: { interval, interval_count: intervalCount },
     });

     if (!newPrice) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create new price in Stripe');
     }

     // Step 3: Return the updated product and price IDs
     return { productId: updatedProduct.id, priceId: newPrice.id };
};
```

<!-- things to know -->
- - stripe price : recurring এ আর কি কি আছে?


* যখন কোন package._id দিয়ে একটা package কে delete করব তহন, pakage এর যে stripe server এর product id দিয়ে stripe server এ এই product id এর against এ যতগুলো price এর data আছে তাদের price.active কে false করে দিব; একই সাথে stripe server এ এই product id এর against এ যতগুলো product এর data আছে তাদের prouct.active কে false করে দিব + metadata তে deleting informations save করে রাখব; এর পর package._id দিয়ে packageModel থেকে exact package কে delet করে দিব
*src\app\modules\package\package.service.ts*
```

const deletePackageToDB = async (id: string): Promise<IPackage | null> => {
     const isExistPackage: any = await Package.findById(id);
     if (!isExistPackage) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
     }

     try {
          // Get all prices for the Stripe product
          const prices = await stripe.prices.list({ product: isExistPackage.productId });

          // Deactivate all prices associated with the product
          for (const price of prices.data) {
               if (price.active) {
                    await stripe.prices.update(price.id, { active: false });
               }
          }

          // Archive the product instead of deleting it
          // This is the recommended approach when you have associated prices
          await stripe.products.update(isExistPackage.productId, {
               active: false,
               metadata: {
                    deleted_at: new Date().toISOString(),
                    deleted_by: 'system', // or pass user info if available
               },
          });

          // Update the package status in your DB
          const result = await Package.findByIdAndUpdate(
               { _id: id },
               {
                    status: 'inactive',
                    isDeleted: true,
                    deletedAt: new Date(), // Add timestamp for when it was deleted
               },
               { new: true },
          );

          if (!result) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete Package');
          }

          return result;
     } catch (stripeError: any) {
          // Handle Stripe-specific errors
          if (stripeError.type === 'StripeInvalidRequestError') {
               // If the product doesn't exist in Stripe, just update the DB
               console.warn(`Stripe product ${isExistPackage.productId} not found, updating DB only`);

               const result = await Package.findByIdAndUpdate(
                    { _id: id },
                    {
                         status: 'inactive',
                         isDeleted: true,
                         deletedAt: new Date(),
                    },
                    { new: true },
               );

               return result;
          }

          // Re-throw other errors
          throw new AppError(StatusCodes.BAD_REQUEST, `Failed to delete package: ${stripeError.message}`);
     }
};
```

* package যেগুলো  বানানো হয়েছে সেগুলোতে subscribe করার জন্য, req.params এ package._id আসবে ও req.user থেকে user._id নিয়ে *createSubscriptionCheckoutSession* service এ packageModel থেকে package এর data ও userModel থেকে user এর data(user এর stripe server এর customerId সহ) বের করে এনে *stripe.checkout.sessions.create* দিয়ে session বানাতে হবে ও package._id কে session এর subscriptionId তে সেট করে এরপর তার ভিতরে *cancel_url ও success_url* define করে দিতে হবে ও *url ও sessionId* response করে দিতে হবে

*src\app\modules\subscription\subscription.service.ts*
```

const createSubscriptionCheckoutSession = async (userId: string, packageId: string) => {
     const isExistPackage = await Package.findOne({
          _id: packageId,
          status: 'active',
     });
     if (!isExistPackage) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
     }
     const user = await User.findById(userId).select('+stripeCustomerId');
     if (!user || !user.stripeCustomerId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
     }

     // Convert Mongoose String types to primitive strings
     const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          customer: String(user.stripeCustomerId),
          line_items: [
               {
                    price: String(isExistPackage.priceId),
                    quantity: 1,
               },
          ],
          metadata: {
               userId: String(userId),
               subscriptionId: String(isExistPackage._id),
          },
          // ${config.frontend_url}
          success_url: `http://10.0.60.110:7000/api/v1/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `http://10.0.60.110:7000/subscription/cancel`,
     });
     return {
          url: session.url,
          sessionId: session.id,
     };
};
```
<!-- things to know -->
- - stripe mode : subscription বাদে আর কি কি আছে?

* এর পর subscription creation *succes ও cancel* এর জন্য *src\app\modules\subscription\subscription.routes.ts* এর *succes ও cancel* route এর flow দেখে বুঝে নিতে হবে

```
router.get('/success', SubscriptionController.orderSuccess);
router.get('/cancel', SubscriptionController.orderCancel);
```
* এবার subscription update করার জন্য req.params এ package._id আসবে ও req.user থেকে user._id নিয়ে *upgradeSubscriptionToDB* service এ SubscriptionModel থেকে findone করব যে এই user এর already কোন subscription active আছে কিনা? যদি থাকে তাহলে package._id দিয়ে PackageMOdel থেকে package data findOne করব; তারপর user._id দিয়ে userModel থেকে use কে *stripeCustomerId* সহ findone করব; এরপর সেই active subscription data এর ভতরে যে reffered subscriptionId(i.e pakcage._id) সেটা দিয়ে stripe server থেকে subscription এর data retirive করে আনব; তারপর এটা কে console.log করে দেখব; যদি সবঠিক থাকে তাহলে stripe.subscriptions.update করে দিব; এর পর আবারো সেশন create করে তাঁর url কে return করে দিব

*src\app\modules\subscription\subscription.service.ts*

```

const upgradeSubscriptionToDB = async (userId: string, packageId: string) => {
     const activeSubscription = await Subscription.findOne({
          userId,
          status: 'active',
     });

     if (!activeSubscription || !activeSubscription.subscriptionId) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'No active subscription found to upgrade');
     }

     const packageDoc = await Package.findById(packageId);

     if (!packageDoc || !packageDoc.priceId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found or missing Stripe Price ID');
     }

     const user = await User.findById(userId).select('+stripeCustomerId');

     if (!user || !user.stripeCustomerId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
     }

     const stripeSubscription = await stripe.subscriptions.retrieve(activeSubscription.subscriptionId);
     console.log(stripeSubscription, 'this is stripe subscription existing');

     await stripe.subscriptions.update(activeSubscription.subscriptionId, {
          items: [
               {
                    id: stripeSubscription.items.data[0].id,
                    price: packageDoc.priceId,
               },
          ],
          proration_behavior: 'create_prorations',
          metadata: {
               userId,
               packageId: packageDoc._id.toString(),
          },
     });
     console.log(' thsi is stripe subscription updated');
     const portalSession = await stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId,
          return_url: config.frontend_url,
          flow_data: {
               type: 'subscription_update',
               subscription_update: {
                    subscription: activeSubscription.subscriptionId,
               },
          },
     });

     return {
          url: portalSession.url,
     };
};
```

* এবার user এর যেকোন active subscription কে cancel বা deactive করতে চাইলে, req.user._id দিয়ে SubscriptionModel থেকে user এর active subscription কে findone করব ; এর পর stripe database থেকে subscription.subscriptionId(যেই package subscribed ছিল তাঁর pakage._id) দিয়ে *stripe.subscriptions.cancel* করে দিব; আবারো req.user._id দিয়ে SubscriptionModel থেকে user এর active subscription কে findone তা active কে false করে দিব
*src\app\modules\subscription\subscription.service.ts*
```

const cancelSubscriptionToDB = async (userId: string) => {
     const activeSubscription = await Subscription.findOne({
          userId,
          status: 'active',
     });
     if (!activeSubscription || !activeSubscription.subscriptionId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No active subscription found to cancel');
     }

     await stripe.subscriptions.cancel(activeSubscription.subscriptionId);

     await Subscription.findOneAndUpdate({ userId, status: 'active' }, { status: 'canceled' }, { new: true });

     return { success: true, message: 'Subscription canceled successfully' };
};
```

* need to understand *handleStripeWebhook*