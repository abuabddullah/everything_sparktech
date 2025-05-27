# Project Name
its *_car_rental_* dead line : **june 10 7 pm**
<br/>
This is a template project for backend development using Typescript, Node.js, Express, Mongoose, Bcrypt, JWT, NodeMailer, Multer, ESLint, and Prettier. The aim is to reduce setup time for new backend projects.


## Features

- **Authentication API:** Complete authentication system using JWT for secure token-based authentication and bcrypt for password hashing.
- **File Upload:** Implemented using Multer with efficient file handling and short-term storage.
- **Data Validation:** Robust data validation using Zod and Mongoose schemas.
- **Code Quality:** Ensured code readability and quality with ESLint and Prettier.
- **Email Service:** Sending emails through NodeMailer.
- **File Handling:** Efficient file deletion using `fs.unlink`.
- **Environment Configuration:** Easy configuration using a `.env` file.
- **Logging:** Logging with Winston and file rotation using DailyRotateFile.
- **API Request Logging:** Logging API requests using Morgan.

## Tech Stack

- Typescript
- Node.js
- Express
- Mongoose
- Bcrypt
- JWT
- NodeMailer
- Multer
- ESLint
- Prettier
- Winston
- Daily-winston-rotate-file
- Morgen
- Socket

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Ensure you have the following installed:

- Node.js
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/your-repository.git
   cd your-repository
   ```

2. **Install dependencies:**

   Using npm:

   ```bash
   npm install
   ```

   Using yarn:

   ```bash
   yarn install
   ```

3. **Create a `.env` file:**

   In the root directory of the project, create a `.env` file and add the following variables. Adjust the values according to your setup.

   ```env
   # Basic
   NODE_ENV=development
   DATABASE_URL=mongodb://127.0.0.1:27017/project_name
   IP_ADDRESS=192.0.0.0
   PORT=5000

   # Bcrypt
   BCRYPT_SALT_ROUNDS=12

   # JWT
   JWT_SECRET=jwt_secret
   JWT_EXPIRE_IN=1d

   # Email
   EMAIL_FROM=email@gmail.com
   EMAIL_USER=email@gmail.com
   EMAIL_PASS=mkqcfjeqloothyax
   EMAIL_PORT=587
   EMAIL_HOST=smtp.gmail.com


   ***********************

   # IP_ADDRESS= 10.0.70.30
   DATABASE_URL= mongodb://localhost:27017/car_rental
   NODE_ENV= development
   PORT= 5000
   BCRYPT_SALT_ROUNDS= 12
   JWT_SECRET= 3a7b5c9d2e1f8a6b4c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9
   JWT_EXPIRE_IN= 7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=asifaowadud@gmail.com
   EMAIL_FROM=email@gmail.com
   EMAIL_PASS=bginhzrjdefhhfxh
   EMAIL_PORT=587
   SUPER_ADMIN_EMAIL=admin@gmail.com
   SUPER_ADMIN_PASSWORD=00000000
   DEFAULT_ADMIN_PASSWORD=00000000
   COMPANY_DEFAULT_PASSWORD=00000000
   COMPANY_NAME=MyCompany
   COMPANY_DOMAIN=mycompany.com
   ```

4. **Run the project:**

   Using npm:

   ```bash
   npm run dev
   ```

   Using yarn:

   ```bash
   yarn run dev
   ```

### Running the Tests

Explain how to run the automated tests for this system.

```bash
npm test
```
