# bitespeed-Assignment Task Backend

This is the backend implementation showcasing my skills in restfull api using nodejs. The submitted data is stored in a postgresql database and can be viewed by administrators via a dashboard.

---

## Directory Structure

```
project/
├── prisma/
│   ├── schema.prisma
├── src/
│   ├── config/
│   │   ├── prisma.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── contactController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   ├── routes/
│   │   ├── authRoute.ts
│   ├── services/
│   │   ├── contactService.ts
│   ├── types/
│   │   ├── express.d.ts
│   ├── utils/
│   │   ├── auth.ts
│   │ 
│   ├── server.ts
│
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
```

---


## Tech Stack

- **Node.js**
- **Express.js**
- **PostgreSQL** (with Prisma)
- **JSON Web Tokens (JWT)** (for admin authentication)
- **Cookies** (for storing token)

---

## Setup Instructions


### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```env
   PORT=3000
   DATABASE_URL=<your_postgreSql_database_uri>
   JWT_SECRET=<your_jwt_secret>
   ```
   
4.  Run Migrations (Prisma):
   ```bash
   npx prisma migrate dev
   ```

5. Start the server:
   ```bash
   npm run dev
   ```
   The backend will be available at `http://localhost:3000`.

---

## API Endpoints

#### POST `/identify`
Create or update contact.

- **Request Body:**
  ```json
  {
    "email":"<email>",
    "phoneNumber":"<phoneNumber>"
  }
  ```

- **Response:**
  ```json
    {
        "id": "<id>",
        "name": "<name>",
        "status": "<status>",
        "decommissionedAt": null
    }
  ```


### User Authentication

#### POST `/auth/signup`
create user

- **Request Body:**
  ```json
  {
    "email": "<email>",
    "password": "<password>"
  }
  ```

- **Response:**
  ```json
    {
        "user": {
            "id": "<id>",
            "email": "<email>",
            "password": "<hashedPassword>",
            "createdAt": "<createdAt>",
            "updatedAt": "<updatedAt>"
        },
    }
  ```

#### POST `/auth/login`
Authenticate user using credentials.

- **Request Body:**
  ```json
  {
    "email": "<email>",
    "password": "<password>"
  }
  ```

- **Response:**
  ```json
    {
        "user": {
            "id": "<id>",
            "email": "<email>",
            "password": "<hashedPassword>",
            "createdAt": "<createdAt>",
            "updatedAt": "<updatedAt>"
        },
        "token": "<token>"
    }
  ```

  #### POST `/auth/logout`

- **Response:**
  ```json
  {
    "message": "Logged Out Successfully"
  }
  ```

---

## Deployed Links

**Backend Url** -  `https://bitespeed-assignment-five.vercel.app/`

---
