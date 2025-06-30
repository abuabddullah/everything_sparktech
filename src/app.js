const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const routes = require("./routes");
const morgan = require("morgan");
const logger = require("./helpers/logger");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
require("./strategies/passport.js");
require("dotenv").config();
const app = express();

const {
  notFoundHandler,
  errorHandler,
  errorConverter,
} = require("./middlewares/errorHandler");

// Configure helmet for security
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Static folder
app.use(express.static("public"));

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable CORS
app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// Configure i18next for translation
const i18next = require("i18next");
const i18nextMiddleware = require("i18next-http-middleware");
const Backend = require("i18next-node-fs-backend");
const serverHomePage = require("./helpers/serverHomePage");

let translationPath = __dirname + "/translation/{{lng}}/translation.json";
if (process.env.NODE_ENV === "production") {
  translationPath = path.resolve(
    __dirname,
    "dist",
    "translation/{{lng}}/translation.json"
  );
}

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: translationPath,
    },
    detection: {
      order: ["header"],
      caches: ["cookie"],
    },
    preload: ["en", "de"],
    fallbackLng: process.env.API_RESPONCE_LANGUAGE,
  });

app.use(i18nextMiddleware.handle(i18next));

// Winston logger for HTTP requests
const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3].replace("ms", "").trim(),
        };

        // Log to ResponseTime.log
        logger.log({
          level: "info",
          message: "Response time log",
          ...logObject,
          label: "ResponseTime",
        });
      },
    },
  })
);

// enable session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      // domain: ".yourcaptureawards.com",
      // path: "/",
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Initialize API routes
app.use("/api/v1", routes);

// Health check route
app.get("/", async (req, res) => {
  try {
    const htmlContent = await serverHomePage(); // Wait for HTML generation
    res.send(htmlContent); // Send the generated HTML
  } catch (error) {
    console.error("Error generating the server home page:", error);
    res
      .status(500)
      .send("An error occurred while generating the server home page.");
  }
});

// app.get('/favicon.ico', (req, res) => res.status(204));

// Error handling setup
app.use(notFoundHandler); // Handle 404
app.use(errorConverter); // Convert errors to ApiError instances
app.use(errorHandler); // Main error handler

module.exports = app;
