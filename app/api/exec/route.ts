import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(request: Request) {
  const url = process.env.SERVERLESS_EXEC_ROUTE;
  const globalVarSchema = z.record(z.array(z.string()));
  const codeSchema = z.object({
    code: z.string(),
    globalVar: globalVarSchema,
    startNode: z.string(),
    endNode: z.string(),
  });
  const json = await request.json();
  const parsedJson = codeSchema.parse(json);
  const { code, globalVar, startNode, endNode } = parsedJson;

  if (url) {
    console.log('sending this out', { code, globalVar, startNode, endNode });
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, globalVar, startNode, endNode }),
    });
    const data = await res.json();
    return NextResponse.json({ data });
  } else {
    return NextResponse.json({
      msg: 'could not find server exec url',
      status: 400,
    });
  }
}
