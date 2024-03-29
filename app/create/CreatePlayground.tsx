"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCreatePlaygroundMutation } from "@/hooks/network/useCreatePlaygroundMutation";
import { SerializedPlayground } from "@/lib/types";
import { API_URL, serializedPlaygroundSchema } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ky from "ky";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { z } from "zod";

const CreatePlayground = () => {
  const createPlaygroundMutation = useCreatePlaygroundMutation();

  const [items, setItems] = useState<Array<{ name: string }>>([]);
  return (
    <>
      <Card className="w-72 h-64 ml-5 mt-5 border-dashed flex items-center justify-center">
        <Button
          disabled={createPlaygroundMutation.isLoading}
          onClick={async () => {
            await createPlaygroundMutation.mutateAsync();
            // queryClient.invalidateQueries(['getPlaygrounds']);
          }}
          variant="outline"
          className="flex items-center justify-evenly w-48"
        >
          <Plus size={20} />
          Create Playground
        </Button>

        <div className="bg-gray-800 h-1/4"></div>
      </Card>
      {createPlaygroundMutation.isLoading && (
        <Card className="w-72 h-64 ml-5 mt-5 animate-pulse transition" />
      )}
    </>
  );
};

export default CreatePlayground;
