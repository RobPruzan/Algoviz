import axios from "axios";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_CODE_RUNNER;
  const globalVarSchema = z.record(z.array(z.string()));
  const codeSchema = z.object({
    code: z.string(),
    globalVar: globalVarSchema,
    startNode: z.string().nullish(),
    endNode: z.string().nullish(),
  });
  const json = await request.json();
  const parsedJson = codeSchema.parse(json);
  const { code, globalVar, startNode, endNode } = parsedJson;
  try {
    if (url) {
      const res = await axios.post(url, {
        code,
        globalVar,
        startNode,
        endNode,
      });
      const data = res.data;

      return NextResponse.json({ data });
    } else {
      return NextResponse.json({
        msg: "could not find server exec url",
        status: 400,
      });
    }
  } catch (error) {
    return NextResponse.json(null, { status: 400 });
  }
}
