"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCreatePlaygroundMutation } from "@/hooks/useCreatePlaygroundMutation";
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
      <div className="bg-white border-red-500 text-black">
        <button
          className="border rounded-md"
          onClick={() =>
            setItems((prev) => [
              ...prev,
              { name: crypto.randomUUID().slice(0, 10) },
            ])
          }
        >
          add
        </button>
        {items.map((item, idx) => (
          <div key={item.name}>
            <p>{item.name}</p>
            <button
              className="border rounded-md"
              onClick={() =>
                setItems((prev) => prev.filter((i) => i.name !== item.name))
              }
            >
              delete
            </button>
            <textarea className="rounded-lg border-4 text-white" />
          </div>
        ))}
      </div>

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
