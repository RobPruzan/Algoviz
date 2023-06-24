import { NextResponse } from 'next/server';

const jwt = require('jsonwebtoken');

// This could be an environment variable
const jwtSecret = process.env.NEXTAUTH_SECRET;

export async function POST(request: Request) {
  const { token } = await request.json();
  try {
    const payload = jwt.verify(token, jwtSecret);

    // TODO: At this point, you'll want to check that the user associated with the userId in the
    // payload is actually authorized to access the roomId in the payload. This will depend on
    // your application's logic.

    // res.status(200).json({ success: true });
    return NextResponse.json({
      msg: 'Successfully validated jwt token',
      status: 200,
    });
  } catch (error) {
    // This will happen if the token has been tampered with or if it's expired
    return NextResponse.json({
      msg: 'Get outa here',
      status: 401,
    });
  }
}
