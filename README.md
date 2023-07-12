# AlgoViz

## Setup

### Environment Variables

Begin by making a copy of the `.env.example` file and renaming it to `.env`. This file will contain the environment variables necessary for the project. Fill in the values of these variables accordingly. Here is a list of the environment variables you'll need:

For the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, you'll need to set up a Google OAuth provider. You can follow the official Google documentation to get these credentials: `https://developers.google.com/identity/protocols/oauth2`

To generate a secret for `NEXTAUTH_SECRET`, you can use the OpenSSL command. Run the following command in your terminal:

```
openssl rand -hex 32
```

### Building the Application

The `IS_TAURI_BUILD` environment variable is used to instruct Next.js on how to build the application for the desktop. When deploying to production, ensure this variable is properly set.

### Code Execution Server

The `NEXT_PUBLIC_CODE_EXEC_URL` environment variable is used to specify the environment your app will utilize for code execution. This should be set to an API endpoint.

In the current production setup, an AWS Lambda function is used. To achieve this, you can deploy `/server/app.js` as a Lambda function using the Serverless framework.

If you wish to use Serverless, you can follow the official documentation here: `https://www.serverless.com/framework/docs/`

Alternatively, you can run the code execution server locally. To do this, navigate to `<repo-dir>/server` and run the command `npm run start`.

### WebSocket Server

Navigate to `<repo-dir>/websocket` and run the command `npm run start` to start the WebSocket server. This server enables live collaboration in the application.

Both the code execution and WebSocket servers will hot-reload with Nodemon.

## Running the Application

You can start the Next.js application with the command `npm run dev`.

For type checking, use the command `npm run dev:ts`.

To build the app for production, use `npm run build`.

## Deployment

For information on how to deploy the Next.js application, refer to the Vercel documentation here: `https://vercel.com/docs`

## Prerequisites

To run this application, you will need Node.js installed on your system.

## Final Notes

Remember to fill in the environment variables in the `.env` file before running the application. Enjoy the power of real-time collaboration and code execution in this application!
