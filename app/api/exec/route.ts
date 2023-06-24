import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(request: Request) {
  // const url = 'https://v2wogsjzra.execute-api.us-east-1.amazonaws.com/dev/exec';
  const url = 'http://localhost:8000/exec';
  if (!url) return;
  const globalVarSchema = z.record(z.array(z.string()));
  const codeSchema = z.object({ code: z.string(), globalVar: globalVarSchema });
  const json = await request.json();
  const parsedJson = codeSchema.parse(json);
  const { code, globalVar } = parsedJson;

  console.log('code got from client', code);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: code, globalVar }),
  });
  const data = await res.json();
  console.log('Successfully execed code, result', data);
  return NextResponse.json({ data });
}
