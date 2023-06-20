import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(request: Request) {
  // const url = 'https://v2wogsjzra.execute-api.us-east-1.amazonaws.com/dev/exec';
  const url = 'http://localhost:8000/exec';
  if (!url) return;
  const globalVarSchema = z.record(z.array(z.string()));
  const codeSchema = z.object({ code: z.string(), globalVar: globalVarSchema });
  // console.log('the reqest', request);
  const json = await request.json();
  // console.log('request json', json);
  const parsedJson = codeSchema.parse(json);
  const { code, globalVar } = parsedJson;
  // console.log('the global var', globalVar);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: code + `algorithm(globalVar);`, globalVar }),
  });
  console.log('the res', res);
  const data = await res.json();
  console.log('the res data json', data);

  console.log('the data', data);
  return NextResponse.json({ data });
}
