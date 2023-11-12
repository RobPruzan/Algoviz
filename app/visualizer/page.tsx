import ContentWrapper from "./ContentWrapper";
import { prisma } from "@/lib/prisma";
import { PickedPlayground } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/auth-options";
import { z } from "zod";
const jwt = require("jsonwebtoken");

export const metadata = {};

type Discriminate =
  | { type: "NO_VERIFICATION_NEEDED"; data: null }
  | {
      type: "IS_OWNER";
      data: PickedPlayground;
    }
  | { type: "VALID_LINK"; data: PickedPlayground }
  | { type: "DENIED"; data: null }
  | { type: "NO_PLAYGROUND_FOUND"; data: null };

const jwtSecret = process.env.NEXTAUTH_SECRET;
const jsonSchema = z.object({
  playgroundID: z.number().optional(),
  shareID: z.string().optional(),
});

const getCases = async ({
  playgroundID,
  shareID,
}: {
  playgroundID?: number;
  shareID?: string;
}): Promise<Discriminate> => {
  const session = await getServerSession(authOptions);
  // const json = await request.json();
  // const parsedJSON = jsonSchema.parse(json);

  if (!playgroundID) {
    return { type: "NO_VERIFICATION_NEEDED", data: null };
  }

  let playgrounds = session?.user.id
    ? ({
        type: "signed_in",
        data: await prisma.playground.findMany({
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
            circles: true,
            validatorLens: true,
            lines: true,
            pencil: true,
            userId: true,
          },
        }),
      } as const)
    : ({
        type: "linked",
        data: await prisma.playground.findUnique({
          where: {
            id: playgroundID,
          },
          select: {
            id: true,
            circles: true,
            lines: true,
            validatorLens: true,
            pencil: true,
            userId: true,
          },
        }),
      } as const);

  switch (playgrounds.type) {
    case "signed_in":
      const playground = playgrounds.data?.find(
        (playground) => playground.id === playgroundID
      );
      if (playground) {
        return { type: "IS_OWNER", data: playground };
      }
      break;
    case "linked":
      try {
        if (!playgrounds.data) {
          return { type: "NO_PLAYGROUND_FOUND", data: null };
        }
        jwt.verify(shareID, jwtSecret);
        return { type: "VALID_LINK", data: playgrounds.data };
      } catch (error) {
        return { type: "DENIED", data: null };
      }
    default:
      return { type: "DENIED", data: null };
  }

  return { type: "DENIED", data: null };
};

type Props = {
  searchParams?: {
    ["playground-id"]?: string;
    ["share-id"]?: string;
  };
};

const page = async ({ searchParams }: Props) => {
  const shareID = searchParams?.["share-id"];
  const playgroundID = searchParams?.["playground-id"];
  const body = shareID
    ? playgroundID
      ? { shareID, playgroundID: +playgroundID }
      : { shareID }
    : playgroundID
    ? { playgroundID: +playgroundID }
    : {};

  const pattern = await getCases(body);

  return (
    <div className=" w-screen h-[95%] flex items-display overflow-y-hidden ">
      <div className="h-full w-full py-[10px] px-[25px] flex flex-col items-center justify-center">
        <ContentWrapper data={pattern.data} />
      </div>
    </div>
  );
};

export default page;
