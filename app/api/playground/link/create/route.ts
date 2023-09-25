import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const jwt = require('jsonwebtoken');

const jwtSecret = process.env.NEXTAUTH_SECRET;

function generateRoomUrl(roomId: string, permission: string, headers: Headers) {
  // generates encrypted JWT
  const payload = {
    roomId,
    // This will make the JWT expire after 1 hour
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  const token = jwt.sign(payload, jwtSecret);

  return `${
    process.env.NODE_ENV === 'production' ? 'https' : 'http'
  }://${headers.get(
    'host'
  )}/visualizer?playground-id=${roomId}&share-id=${token}`;
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
  console.log('the host', request.headers.get('host'));
  const url = generateRoomUrl(roomId, permission, request.headers);
  return NextResponse.json({
    url,
    status: 200,
  });
}
