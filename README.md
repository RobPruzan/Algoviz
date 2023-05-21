# NextJS 13 Startup Repository

This repo is designed to help you get started quickly with a new project using the NextJS 13 app dir with prisma, and next-auth configured.

## Prerequisites

Ensure that you have Node.js (v16 or higher) and npm (v7 or higher) installed on your system. You can check your current versions by running the following commands:

```bash
node -v
npm -v
```

## Installation

1. Select "Use this template" to start a new project

![image](https://user-images.githubusercontent.com/97781863/236640684-53278a1e-0b0a-4be0-b4e9-2e9dfabdff72.png)

2. Clone and enter the repo

```bash
git clone <repo-url>
cd <repo-name>
```

3. Install the required dependencies:

```bash
npm install
```

## Configuration

1. Rename the `.env.example` file to `.env`:
- If you would prefer using vercel postgres, delete the database related env variables and follow the setup here- https://www.google.com/search?q=vercel+postgres&sourceid=chrome&ie=UTF-8

```bash
mv .env.example .env
```

2. Obtain the necessary credentials for authentication and database setup, and update the `.env` file accordingly. You'll need to provide the following:

- Client IDs and secrets
- Database URLs

## Database Setup

1. Run the Prisma migration to set up the database schema:

```bash
npx prisma migrate dev
```
2. Generate prisma client
```bash
npx prisma generate
```

## Running the Development Server

1. Start the development server on port 3000:

```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000` to view your NextJS 13 application.
