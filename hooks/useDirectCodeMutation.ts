import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { z } from "zod";

export const useDirectCodeMutation = () => {
  const { toast } = useToast();
  const simpleCodeMutation = useMutation({
    onError: (e) => {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: e instanceof Error ? e.message : null,
      });
    },
    mutationFn: async ({ code }: { code: string }) => {
      console.log("mutating");
      const result = await axios.post(
        process.env.NEXT_PUBLIC_DIRECT_EXECUTION,
        {
          code,
        }
      );

      console.log({ result });

      const codeSchema = z.object({
        stdout: z.string(),
        stderr: z.string(),
      });

      return codeSchema.parse(result.data);
    },
  });

  return simpleCodeMutation;
};
