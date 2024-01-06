"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCreatePlaygroundMutation } from "@/hooks/network/useCreatePlaygroundMutation";
import { useSession } from "next-auth/react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import React from "react";

type Props = {};

const UpgradePlayground = (props: Props) => {
  const createPlaygroundMutation = useCreatePlaygroundMutation();
  const router = useRouter();
  const params = useParams();
  const searchP = useSearchParams();
  const pathname = usePathname().split("/");

  const session = useSession();

  const isLoggedIn = !!session.data?.user;

  const { toast } = useToast();

  if (!isLoggedIn) {
    return;
  }

  if (searchP.get("playground-id")) {
    return;
  }

  if (!pathname.includes("visualizer")) {
    return;
  }
  return (
    <Button
      aria-label="convert-to-playground"
      className="min-w-fit mx-2"
      onClick={async () => {
        const url = new URL(window.location.href);

        const res = await createPlaygroundMutation.mutateAsync();

        url.searchParams.set("playground-id", String(res.playground.id));
        router.push(url.toString());
        toast({
          title: "Playground created!",
          description:
            "All changes will now be saved, you will always be able to see this playground when navigating to playgrounds",
        });
      }}
      variant={"outline"}
    >
      {createPlaygroundMutation.isLoading
        ? "Converting..."
        : "Convert to playground"}
    </Button>
  );
};

export default UpgradePlayground;
