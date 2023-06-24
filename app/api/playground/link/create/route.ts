import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const jwt = require('jsonwebtoken');

// This could be an environment variable
const jwtSecret = process.env.NEXTAUTH_SECRET;

function generateRoomUrl(roomId: string, permission: string) {
  // generates encrypted JWT
  const payload = {
    roomId,
    // This will make the JWT expire after 1 hour
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  const token = jwt.sign(payload, jwtSecret);
  console.log('token', token);

  return `${process.env.NEXTAUTH_URL}/visualizer?playground-id=${roomId}=&id=${token}`;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({
      msg: 'Must be signed in',
      status: 401,
    });

  const json = await request.json();
  const { roomId, permission } = json;

  const url = generateRoomUrl(roomId, permission);
  console.log('returned url', url);
  return NextResponse.json({
    url,
    status: 200,
  });
}
