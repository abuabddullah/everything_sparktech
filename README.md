# My NCLEX Prep — API Reference

A concise, developer-friendly API reference for the My NCLEX Prep backend. Share this with frontend engineers — it contains base URL, headers, and one concrete request example per endpoint.

---

## Table of contents

- [Base URL & env](#base-url--env)
- [Global headers](#global-headers)
- [Content types & file uploads](#content-types--file-uploads)
- [Quick auth examples](#quick-auth-examples)
- [One example per endpoint](#one-example-per-endpoint)
  - [Auth](#auth)
  - [User](#user)
  - [Category](#category)
  - [Community](#community)
  - [Exam](#exam)
  - [Lesson](#lesson)
  - [Mnemonic](#mnemonic)
  - [Onboarding screens](#onboarding-screens)
  - [Study material](#study-material)
  - [Study schedule](#study-schedule)
  - [Notifications](#notifications)
  - [Review](#review)
  - [Public (FAQ / Contact)](#public-faq--contact)
  - [Support](#support)
- [Full payload examples (required + optional fields)](#full-payload-examples-required--optional-fields)

---

## Base URL & env

Set these env values on the frontend (or replace when building requests):

```
IP_ADDRESS = your_ip_address
PORT = your_port
BASE_URL = http://IP_ADDRESS:PORT/api/v1
```

Example full URL: `http://IP_ADDRESS:PORT/api/v1/auth/login`


## Global headers

- Authorization: `Bearer <ACCESS_TOKEN>` (for protected routes)
- Content-Type: `application/json` (use `multipart/form-data` for files)

When sending files use `multipart/form-data`; for JSON bodies use `application/json`.


## Content types & file uploads

- Use `multipart/form-data` for routes that accept files (profile, category image, study material doc, stems images).
- When an endpoint expects a JSON array together with files (e.g. `stems`), send the array as a JSON string in a form field:
  - Example form field: `stems = JSON.stringify([...])`
  - Files go in the `image` or `doc` fields as required by the route.


## Quick auth examples

Sign up

```json
POST /auth/signup
Content-Type: application/json
{
  "email": "jane@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "phone": "+1234567890",
  "role": "student"
}
```

Login

```json
POST /auth/login
Content-Type: application/json
{ "email": "jane@example.com", "password": "password123" }
```


---

## One example per endpoint

Each entry: method, relative path (`/api/v1/...`), headers, and one concrete request example.

### Auth

**POST** ` /auth/signup`

Headers: `Content-Type: application/json`

Body:
```json
{
  "email": "jane@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "phone": "+1234567890",
  "role": "student"
}
```

---

**POST** `/auth/login`

Headers: `Content-Type: application/json`

Body:
```json
{ "email": "jane@example.com", "password": "password123" }
```

---

**POST** `/auth/admin-login`

Headers: `Content-Type: application/json`

Body:
```json
{ "email": "admin@example.com", "password": "adminPass" }
```

---

**GET** `/auth/google`

- OAuth redirect — open in browser. No body.

---

**POST** `/auth/verify-account`

Headers: `Content-Type: application/json`

Body:
```json
{ "email": "jane@example.com", "oneTimeCode": "123456" }
```

---

**POST** `/auth/forget-password`

Headers: `Content-Type: application/json`

Body:
```json
{ "email": "jane@example.com" }
```

---

**POST** `/auth/reset-password`

Headers: `Content-Type: application/json`

Body:
```json
{ "newPassword": "newPass123", "confirmPassword": "newPass123" }
```

---

**POST** `/auth/change-password` (protected)

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

Body:
```json
{ "currentPassword": "oldPass", "newPassword": "newPass123", "confirmPassword": "newPass123" }
```

---

**DELETE** `/auth/delete-account` (protected)

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

Body:
```json
{ "password": "currentPassword" }
```

---

**POST** `/auth/refresh-token`

Headers: `Content-Type: application/json`

Body:
```json
{ "refreshToken": "refresh-token-value" }
```

---

### User

**GET** `/user/profile`

Headers: `Authorization: Bearer <token>`

No body.

---

**PATCH** `/user/profile`

Headers: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

Form-data example (send as multipart):
- `name`: "Jane Updated"
- `phone`: "+1234567890"
- `profile`: (file)

---

**DELETE** `/user/profile`

Headers: `Authorization: Bearer <token>`

No body.

---

**GET** `/user/` (admin)

Headers: `Authorization: Bearer <admin-token>`

No body.

---

**GET** `/user/:userId` (admin)

Headers: `Authorization: Bearer <admin-token>`

---

**PATCH** `/user/:userId` (admin)

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: application/json`

Body:
```json
{ "status": "active" }
```

---

### Category

**GET** `/category/`

Public — no headers required.

---

**GET** `/category/:id`

Public — no headers required.

---

**POST** `/category/` (admin)

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: multipart/form-data`

Form-data:
- `name`: "Cardiology"
- `description`: "Heart topics"
- `image`: (file)

---

**PATCH** `/category/:id` (admin)

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: multipart/form-data`

Form-data example:
- `name`: "Updated Category"

---

**DELETE** `/category/:id` (admin)

Headers: `Authorization: Bearer <admin-token>`

---

### Community

**GET** `/community/`

Public — no headers.

---

**GET** `/community/:id`

Public — no headers.

---

**POST** `/community/` (auth)

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

Body:
```json
{
  "userId": "64b8a7e0f0a0000000000000",
  "question": "How to interpret ECG?",
  "details": "Short details",
  "tags": ["cardiology","ecg"]
}
```

---

**PATCH** `/community/:id` (auth)

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

Body:
```json
{ "question": "Updated question text" }
```

---

**DELETE** `/community/:id` (auth)

Headers: `Authorization: Bearer <token>`

---

**POST** `/community/:communityId/answers` (auth)

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

Body:
```json
{ "comments": "Here is the answer details" }
```

---

**PATCH** `/community/:communityId/answers/:answerId` (auth)

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

Body:
```json
{ "comments": "Updated answer text" }
```

---

**DELETE** `/community/:communityId/answers/:answerId` (auth)

Headers: `Authorization: Bearer <token>`

---

### Exam

**POST** `/exam/stems` (admin)

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: multipart/form-data`

Form-data:
- `stems`: JSON.stringify([{ "stemTitle": "Case 1", "stemDescription": "Patient with chest pain", "table": [{ "key": "age", "value": 65 }] }])
- `image`: (file or files)

---

**POST** `/exam/questions` (admin)

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: application/json`

Body:
```json
{
  "questions": [
    {
      "type": "radio",
      "questionText": "What is normal heart rate?",
      "options": [
        { "label": "50-60 bpm", "value": "50-60" },
        { "label": "60-100 bpm", "value": "60-100" }
      ],
      "correctAnswer": 1,
      "points": 1
    }
  ]
}
```

---

**GET** `/exam/` (admin)

Headers: `Authorization: Bearer <admin-token>`

---

**POST** `/exam/` (admin)

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: application/json`

Body:
```json
{
  "category": "readiness",
  "name": "Readiness Exam 1",
  "code": "R-001",
  "description": "Short description",
  "durationMinutes": 120,
  "passMark": 50,
  "createdBy": "64b8a7e0f0a0000000000000"
}
```

---

**GET** `/exam/readiness`

Headers: `Authorization: Bearer <token>`

---

**GET** `/exam/standalone`

Headers: `Authorization: Bearer <token>`

---

**GET** `/exam/:id` (admin)

Headers: `Authorization: Bearer <admin-token>`

---

**DELETE** `/exam/:id` (admin)

Headers: `Authorization: Bearer <admin-token>`

---

**GET** `/exam/:examId/questions`

Headers: `Authorization: Bearer <token>`

---

### Lesson

**POST** `/lesson/stems` (admin)

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: multipart/form-data`

Form-data: `stems` (JSON string) + `image` files

---

**POST** `/lesson/questions` (admin)

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: application/json`

Body: same shape as exam questions example above.

---

**GET** `/lesson/` (admin)

Headers: `Authorization: Bearer <admin-token>`

---

**POST** `/lesson/` (admin)

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: application/json`

Body:
```json
{
  "category": "theory",
  "name": "Lesson 1",
  "description": "Lesson description",
  "isPublished": true,
  "durationMinutes": 40
}
```

---

**GET** `/lesson/next_gen`

Headers: `Authorization: Bearer <token>`

---

**GET** `/lesson/case_study`

Headers: `Authorization: Bearer <token>`

---

**GET** `/lesson/:id` (admin)

Headers: `Authorization: Bearer <admin-token>`

---

**DELETE** `/lesson/:id` (admin)

Headers: `Authorization: Bearer <admin-token>`

---

**GET** `/lesson/:lessonId/questions`

Headers: `Authorization: Bearer <token>`

---

### Mnemonic

**GET** `/mnemonic/`

Public — no headers.

---

**GET** `/mnemonic/:id`

Public — no headers.

---

**POST** `/mnemonic/` (admin)

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: application/json`

Body:
```json
{ "title": "ABC Rule", "content": "Airway, Breathing, Circulation" }
```

---

**DELETE** `/mnemonic/:id` (admin)

Headers: `Authorization: Bearer <admin-token>`

---

### Onboarding screens

**GET** `/onboardingscreen/`

Public — no headers.

---

**GET** `/onboardingscreen/:id`

Public — no headers.

---

**POST** `/onboardingscreen/` (admin)

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: multipart/form-data`

Form-data:
- `title`: "Welcome"
- `description`: "Welcome to the app"
- `order`: 1
- `image`: (file)

---

**DELETE** `/onboardingscreen/:id` (admin)

Headers: `Authorization: Bearer <admin-token>`

---

### Study material

**GET** `/studymaterial/`

Headers: `Authorization: Bearer <token>`

---

**GET** `/studymaterial/study-guide`

Headers: `Authorization: Bearer <token>`

---

**GET** `/studymaterial/:id`

Headers: `Authorization: Bearer <token>`

---

**POST** `/studymaterial/` (admin)

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: multipart/form-data`

Form-data:
- `name`: "NCLEX Guide"
- `category`: "guides"
- `type`: "pdf"
- `doc`: (file)

---

**DELETE** `/studymaterial/:id` (admin)

Headers: `Authorization: Bearer <admin-token>`

---

### Study schedule

**GET** `/studyschedule/by-date`

Headers: `Authorization: Bearer <token>`

---

**GET** `/studyschedule/`

Headers: `Authorization: Bearer <token>`

---

**GET** `/studyschedule/:id`

Headers: `Authorization: Bearer <token>`

---

**POST** `/studyschedule/`

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

Body:
```json
{ "calendar": "2025-09-01", "title": "Morning study", "description": "Chapters 1-3" }
```

---

**PATCH** `/studyschedule/:id`

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

Body:
```json
{ "title": "Updated title" }
```

---

**DELETE** `/studyschedule/:id`

Headers: `Authorization: Bearer <token>`

---


### Notifications

**GET** `/notifications/`

Headers: `Authorization: Bearer <token>`

---

**GET** `/notifications/:id`

Headers: `Authorization: Bearer <token>`

---

**GET** `/notifications/all`

Headers: `Authorization: Bearer <token>`

---

### Review

**GET** `/review/`

Headers: `Authorization: Bearer <token>`

---

**POST** `/review/`

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

Body:
```json
{ "reviewee": "64b8a7e0f0a0000000000000", "rating": 5, "review": "Excellent" }
```

---

**GET** `/review/:id`

Headers: `Authorization: Bearer <token>`

---

**PATCH** `/review/:id`

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

Body:
```json
{ "rating": 4 }
```

---

**DELETE** `/review/:id`

Headers: `Authorization: Bearer <token>`

---

### Public (FAQ / Contact)

**POST** `/public/`

Headers: `Content-Type: application/json`

Body:
```json
{ "content": "Site privacy policy", "type": "privacy-policy" }
```

---

**GET** `/public/:type`

Public — no headers.

---

**POST** `/public/contact`

Headers: `Content-Type: application/json`

Body:
```json
{ "name": "John", "email": "john@example.com", "phone": "+1234567890", "country": "Bangladesh", "message": "Help with billing" }
```

---

**POST** `/public/faq` (admin)

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: application/json`

Body:
```json
{ "question": "How to reset password?", "answer": "Use forget password flow" }
```

---

### Support

**GET** `/support/`

Headers: `Authorization: Bearer <admin-token>`

---

**GET** `/support/:id`

Headers: `Authorization: Bearer <admin-token>`

---

**POST** `/support/`

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

Body:
```json
{ "subject": "Payment failed", "message": "Payment failed while checking out", "attachments": [] }
```

---

**PATCH** `/support/:id`

Headers: `Authorization: Bearer <admin-token>`, `Content-Type: application/json`

Body:
```json
{ "status": "in_progress" }
```

---

**DELETE** `/support/:id`

Headers: `Authorization: Bearer <admin-token>`

---

## Full payload examples (required + optional fields)

This section provides one complete request example per endpoint that includes both required and optional fields found in the repository's Zod validation schemas and models. Use these examples as canonical payloads for frontend forms and API calls.

Notes:
- Fields labeled `required` in the schema are present. Optional fields are included with example values (you can omit them in real requests).
- For multipart/form-data endpoints the examples show non-file fields as JSON; upload files in `image` or `doc` fields accordingly.

### Auth

POST /auth/signup
- Required: email, password
- Optional: name, phone, address, role

```json
{
  "email": "jane@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "phone": "+1234567890",
  "address": {
    "city": "Dhaka",
    "permanentAddress": "House 1, Road 2",
    "presentAddress": "Flat 3B",
    "country": "Bangladesh",
    "postalCode": "1207"
  },
  "role": "student"
}
```

POST /auth/login
- Required: password and (email or phone) — both supported in schema

```json
{
  "email": "jane@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "deviceToken": "device-token-optional"
}
```

POST /auth/verify-account
- Required: oneTimeCode and (email or phone)

```json
{ "email": "jane@example.com", "oneTimeCode": "123456" }
```

POST /auth/forget-password

```json
{ "email": "jane@example.com", "phone": "+1234567890" }
```

POST /auth/reset-password

```json
{ "newPassword": "newPass123", "confirmPassword": "newPass123" }
```

POST /auth/resend-otp

```json
{ "email": "jane@example.com", "phone": "+1234567890", "authType": "createAccount" }
```

POST /auth/change-password (protected)

```json
{ "currentPassword": "oldPass", "newPassword": "newPass123", "confirmPassword": "newPass123" }
```

DELETE /auth/delete-account (protected)

```json
{ "password": "currentPassword" }
```

POST /auth/refresh-token

```json
{ "refreshToken": "refresh-token-value" }
```

POST /auth/social-login

```json
{ "appId": "social-app-id", "deviceToken": "device-token" }
```

---

### User

GET /user/profile — no body

PATCH /user/profile (multipart/form-data)
- Optional fields shown below (schema allows many optional fields)

Form-data (non-file fields shown as JSON):
```json
{
  "name": "Jane Updated",
  "phone": "+1234567890",
  "address": {
    "city": "Dhaka",
    "permanentAddress": "House 1, Road 2",
    "presentAddress": "Flat 3B",
    "country": "Bangladesh",
    "postalCode": "1207"
  },
  "image": ["https://example.com/profile1.png"]
}
```
- `profile` image should be uploaded as file field when sending multipart/form-data.

PATCH /user/:userId (admin)
```json
{
  "status": "active"
}
```

---

### Category

POST /category/ (admin) — multipart/form-data
- Required: name
- Optional: description, image

Form-data fields (non-file as JSON):
```json
{
  "name": "Cardiology",
  "description": "Topics on heart",
  "image": "https://s3.amazonaws.com/bucket/category-image.jpg"
}
```

PATCH /category/:id (admin)
```json
{ "name": "Cardio Updated", "description": "Updated description", "image": "https://..." }
```

---

### Community

POST /community/ (auth)
- Required: question
- Optional: userId, avatarUrl, details, answers, answersCount, likesCount, tags, status

```json
{
  "userId": "64b8a7e0f0a0000000000000",
  "avatarUrl": "https://example.com/avatar.png",
  "question": "How to interpret ECG?",
  "details": "Short details about the case",
  "answers": [
    { "userId": "64b8a7e0f0a0000000000001", "date": "2025-08-22T10:00:00.000Z", "comments": "First answer" }
  ],
  "answersCount": 1,
  "likesCount": 5,
  "tags": ["cardiology", "ecg"],
  "status": "open"
}
```

POST /community/:communityId/answers
- Required: comments

```json
{ "comments": "This is my detailed answer.", "userId": "64b8a7e0f0a0000000000001", "date": "2025-08-22T10:00:00.000Z" }
```

PATCH /community/:communityId/answers/:answerId

```json
{ "comments": "Updated answer text" }
```

---

### Exam

POST /exam/
- Required: category (enum: "readiness" | "standalone")
- Optional: name, code, description, isPublished, durationMinutes, passMark, stats, createdBy

```json
{
  "category": "readiness",
  "name": "Readiness Exam 1",
  "code": "R-001",
  "description": "Short description",
  "isPublished": false,
  "durationMinutes": 120,
  "passMark": 50,
  "stats": {
    "questionCount": 50,
    "attempts": 120,
    "avgHighestScore": 80,
    "avgScore": 65,
    "lastAttemptAt": "2025-08-22T09:00:00.000Z"
  },
  "createdBy": "64b8a7e0f0a0000000000000"
}
```

POST /exam/questions (admin)
- Each question includes many optional properties from schema

```json
{
  "questions": [
    {
      "type": "radio",
      "stems": ["64b8a7e0f0a000000000000f"],
      "questionText": "What is normal heart rate?",
      "options": [
        { "label": "50-60 bpm", "value": "50-60", "explanation": "Too slow", "mediaUrl": "https://..." },
        { "label": "60-100 bpm", "value": "60-100" }
      ],
      "allowMultiple": false,
      "numberAnswer": null,
      "correctAnswer": 1,
      "rearrangeItems": null,
      "correctOrder": null,
      "points": 1,
      "tags": ["cardiology"],
      "explanation": "Normal adult heart rate"
    }
  ]
}
```

POST /exam/stems (multipart/form-data)
- Example `stems` JSON string and `image` file(s)

Form field `stems`:
```json
[
  {
    "stemTitle": "Case 1",
    "stemDescription": "Patient with chest pain",
    "stemPicture": null,
    "table": [{ "key": "age", "value": 65, "type": "number" }]
  }
]
```

---

### Lesson

POST /lesson/ (admin)

```json
{
  "category": "theory",
  "name": "Lesson 1",
  "code": "L-001",
  "description": "Lesson description",
  "isPublished": true,
  "durationMinutes": 40,
  "passMark": 40,
  "stats": { "views": 100 }
}
```

POST /lesson/questions — same shape as `/exam/questions` example.

POST /lesson/stems — same pattern as `/exam/stems`.

---

### Mnemonic

POST /mnemonic/ (admin)
- Required: title, content

```json
{ "title": "ABC Rule", "content": "Airway, Breathing, Circulation" }
```

---

### Onboarding screens

POST /onboardingscreen/ (admin) — multipart/form-data
- Required: title, description, imageURL (server may accept file upload and convert to URL)
- Optional: order, actionText, skipEnabled, status

Form-data (non-file fields shown as JSON):
```json
{
  "title": "Welcome",
  "description": "Welcome to the app",
  "imageURL": "https://s3.amazonaws.com/bucket/onboard1.png",
  "order": 1,
  "actionText": "Get Started",
  "skipEnabled": true,
  "status": "active"
}
```

---

### Study material

POST /studymaterial/ (admin) — multipart/form-data
- Required: name, category
- Optional: doc, size, Date, type, fileUrl, uploadedBy

Form-data (non-file fields shown as JSON):
```json
{
  "name": "NCLEX Guide",
  "category": "guides",
  "type": "pdf",
  "size": "2MB",
  "Date": "2025-08-22T00:00:00.000Z",
  "fileUrl": "https://s3.amazonaws.com/bucket/guide.pdf",
  "uploadedBy": "64b8a7e0f0a0000000000000"
}
```

Upload the actual document file in the `doc` field.

---

### Study schedule

POST /studyschedule/
- Required: calendar (date string), title
- Optional: description

```json
{ "calendar": "2025-09-01", "title": "Morning study", "description": "Chapters 1-3" }
```

PATCH /studyschedule/:id
```json
{ "calendar": "2025-09-02T09:00:00.000Z", "title": "Updated", "description": "Updated notes", "createdBy": "64b8a7..." }
```

---


### Notifications

GET /notifications/ — no body (protected)

GET /notifications/:id — no body (protected)

GET /notifications/all — no body (protected)

(Controller details determine notification shape; include typical fields when sending to frontend: id, title, body, read, createdAt)

---

### Review

POST /review/
- Required: rating, review
- Optional: reviewee

```json
{ "reviewee": "64b8a7e0f0a0000000000000", "rating": 5, "review": "Excellent content" }
```

PATCH /review/:id
```json
{ "rating": 4, "review": "Updated review text" }
```

---

### Public (FAQ / Contact)

POST /public/
```json
{ "content": "Site privacy policy", "type": "privacy-policy" }
```

POST /public/contact
```json
{ "name": "John", "email": "john@example.com", "phone": "+1234567890", "country": "Bangladesh", "message": "Help with billing" }
```

POST /public/faq (admin)
```json
{ "question": "How to reset password?", "answer": "Use forget password flow" }
```

---

### Support

POST /support/
- Required: message
- Optional: userId, subject, status, attachments

```json
{ "userId": "64b8a7e0f0a0000000000000", "subject": "Payment failed", "message": "Payment failed while checking out", "status": "in_progress", "attachments": ["https://.../s1.png"] }
```

PATCH /support/:id
```json
{ "subject": "Payment failed - updated", "message": "Updated message", "status": "solved", "attachments": [] }
```

---

If you'd like, I can now:
1. Convert all of these examples into a Postman collection (imports ready) and save to `postman/`.
2. Generate example success responses per endpoint (inferred from controllers) and append them below each request example.

Which would you like next?
