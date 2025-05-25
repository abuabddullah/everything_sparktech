export const mediaIcons = {
  facebook:
    'https://res.cloudinary.com/dozenwhei/image/upload/v1746418054/facebook.png',
  instrgram:
    'https://res.cloudinary.com/dozenwhei/image/upload/v1746417867/instagram.png',
  twitter:
    'https://res.cloudinary.com/dozenwhei/image/upload/v1746418019/twitter-x.png',
  linkedin:
    'https://res.cloudinary.com/dozenwhei/image/upload/v1746417986/linkedin.png',
};

export const paymentSuccess = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Success</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #f0fdf4;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    .icon {
      font-size: 60px;
      color: #10b981;
    }
    h1 {
      color: #10b981;
      margin-top: 10px;
    }
    p {
      font-size: 1.1rem;
      color: #4b5563;
    }
    a {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #10b981;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }
    a:hover {
      background-color: #059669;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✅</div>
    <h1>Payment Successful</h1>
    <p>Thank you for your purchase. Your payment has been processed successfully.</p>
    <a href="/">Return to Home</a>
  </div>
</body>
</html>
`;

export const paymentFailed = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Failed</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #fef2f2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    .icon {
      font-size: 60px;
      color: #ef4444;
    }
    h1 {
      color: #ef4444;
      margin-top: 10px;
    }
    p {
      font-size: 1.1rem;
      color: #4b5563;
    }
    a {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #ef4444;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }
    a:hover {
      background-color: #dc2626;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">❌</div>
    <h1>Payment Failed</h1>
    <p>Sorry, there was a problem processing your payment. Please try again.</p>
    <a href="/">Return to Home</a>
  </div>
</body>
</html>
`;
const date = new Date(Date.now());
export const serverHome = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Server Status</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4fdf8;
          color: #173616;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          text-align: center;
          flex-direction: column;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }
        p {
          font-size: 1.2rem;
          margin-top: 0;
        }
        .icon {
          font-size: 4rem;
        }
      </style>
    </head>
    <body>
      <div class="icon">🚀</div>
      <h1>Beep-beep! The server is alive and kicking.</h1>
      <p>🕒 ${date}</p>
    </body>
    </html>
  `;

export const successHTMLstripeConnection = (user: {
  name: string;
  email: string;
  profileImg: string;
}) => `
  <div style="
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f3f4f6;
  ">
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #ffffff;
      padding: 24px;
      border-radius: 12px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      text-align: center;
    ">
      <img src="${user.profileImg}" alt="${user.name}" style="
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #4f46e5;
        margin-bottom: 16px;
      " />
      <h2 style="color: #4f46e5; margin-bottom: 8px;">Welcome, ${user.name}!</h2>
      <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">
        Your Stripe connected account has been successfully created.
      </p>
      <div style="
        background-color: #e0e7ff;
        padding: 12px;
        border-radius: 8px;
        color: #1e3a8a;
        font-size: 14px;
        margin-bottom: 16px;
      ">
        <strong>Email:</strong> ${user.email}
      </div>
      <a href="https://dashboard.stripe.com" style="
        display: inline-block;
        background-color: #4f46e5;
        color: white;
        padding: 10px 20px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
        transition: background 0.3s ease;
      " target="_blank">
        Go to Stripe Dashboard
      </a>
    </div>
  </div>
`;
