import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = async () => {
  // const session = await getServerSession(authOptions);
  // if (!session?.user) {

  //   const data = await prisma.preset.findMany({
  //     where: {

  //     }
  //   });
  //   return NextResponse.json({
  //     msg: 'Must be signed in',
  //     status: 401,
  //   });
  // }

  const data = await prisma.preset.findMany();

  return NextResponse.json({
    presets: data,
  });
};
