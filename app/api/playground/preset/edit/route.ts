import { algorithmSchema, presetSchema } from "@/app/zodSchemas";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function POST(request: Request) {
  const editPresetSchema = z.object({
    newPreset: presetSchema,
  });

  const json = await request.json();
  const { newPreset } = editPresetSchema.parse(json);

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({
      msg: "Not logged in",
      status: 401,
    });
  }

  if (!(session?.user.email === process.env.NEXT_PUBLIC_GOD_MODE)) {
    return NextResponse.json({
      msg: "Must be admin to edit preset",
      status: 403,
    });
  }

  
    

  try {
    const preset = await prisma.preset.update({
      where: {
        id: newPreset.id,
      },
      data: {
        code: newPreset.code,
      },
    });

    return NextResponse.json({
      preset,
      status: 200,
    });
  } catch (e) {
    console.error("error is", e);
  }
}
