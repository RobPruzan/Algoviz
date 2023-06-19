import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(request: Request) {
  const url = 'https://v8pzhr97t7.execute-api.us-east-1.amazonaws.com/dev/exec';
  if (!url) return;
  const globalVarSchema = z.record(z.array(z.string()));
  const codeSchema = z.object({ code: z.string(), globalVar: globalVarSchema });
  console.log('the reqest', request);
  const json = await request.json();
  const parsedJson = codeSchema.parse(json);
  const { code, globalVar } = parsedJson;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, globalVar }),
  });

  console.log('the res', res);

  const data = await res.json();

  console.log('the data', data);
  return NextResponse.json({ data });
}
