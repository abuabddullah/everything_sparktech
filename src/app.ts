import cors from 'cors'
import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import path from 'path'

import router from './routes'
import { Morgan } from './shared/morgan'
import cookieParser from 'cookie-parser'
import globalErrorHandler from './app/middleware/globalErrorHandler'
import passport from './app/modules/auth/passport.auth/config/passport'
import { scheduleAutoDeleteUnReferencedQuestionSet } from './app/modules/QuestionSet/QuestionSet.service'
import { scheduleAutoDeleteUnReferencedPrompt } from './app/modules/Prompt/Prompt.service'
import { scheduleAutoDeleteUnReferencedQuestion } from './app/modules/Question/Question.service'

const app = express()

//morgan
app.use(Morgan.successHandler)
app.use(Morgan.errorHandler)
//body parser
app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
)
app.use(express.json())
app.use(passport.initialize())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
//file retrieve
app.use(express.static('uploads'))

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

//router
app.use('/api/v1', router)

//live response
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: radial-gradient(circle at top left, #1e003e, #5e00a5);
      color: #fff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      text-align: center;
      padding: 2rem;
    ">
      <div>
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">
          🛑 Whoa there, hacker man.
        </h1>
        <p style="font-size: 1.4rem; line-height: 1.6;">
          You really just typed <code style="color:#ffd700;">'/'</code> in your browser and expected magic?<br><br>
          This isn’t Hogwarts, and you’re not the chosen one. 🧙‍♂️<br><br>
          Honestly, even my 404 page gets more action than this route. 💀
        </p>
        <p style="margin-top: 2rem; font-size: 1rem; opacity: 0.7;">
          Now go back... and try something useful. Or not. I’m just a server.
        </p>
      </div>
    </div>
  `)
})

//global error handle
app.use(globalErrorHandler)

app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Lost, are we?',
    errorMessages: [
      {
        path: req.originalUrl,
        message:
          "Congratulations, you've reached a completely useless API endpoint 👏",
      },
      {
        path: '/docs',
        message: 'Hint: Maybe try reading the docs next time? 📚',
      },
    ],
    roast: '404 brain cells not found. Try harder. 🧠❌',
    timestamp: new Date().toISOString(),
  })
})

// handling cronjobs
scheduleAutoDeleteUnReferencedQuestionSet()
scheduleAutoDeleteUnReferencedPrompt()
scheduleAutoDeleteUnReferencedQuestion()

export default app
