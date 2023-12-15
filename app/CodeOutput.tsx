import { useCodeMutation } from "@/hooks/useCodeMutation";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import React from "react";

export const CodeOutput = ({
  codeMutation,
  className,
}: {
  codeMutation: ReturnType<typeof useCodeMutation>["codeMutation"];
  className?: string;
}) => {
  return codeMutation.isLoading ? (
    <div className="w-full h-full flex items-center justify-center">
      <Loader className="animate-spin" />
    </div>
  ) : (
    <aside
      className={cn([
        "bg-black pl-2 text-white  rounded-lg text-sm font-mono w-full h-full",
        className,
      ])}
    >
      {codeMutation.data?.flattenedVis.type === "Validator" ||
        (codeMutation.data?.flattenedVis.type === "Visualizer" && (
          <div className="flex flex-col items-start justify-start text-sm text-white">
            {codeMutation.data?.flattenedVis.logs.slice(0, -1)}
          </div>
        ))}

      {codeMutation.data?.flattenedVis.type === "error" &&
        codeMutation.data?.flattenedVis.logs.map((log, index) => (
          <>
            <div key={index} className="flex px-3 items-center justify-start ">
              <div className="text-sm text-red-500">
                {JSON.stringify(log)
                  .replace(`"`, "")
                  .trim()
                  .slice(0, -1)
                  .split("\\n")

                  .map((l, idx) => {
                    return (
                      <div key={idx} className="mt-2">
                        {l}
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        ))}
    </aside>
  );
};
