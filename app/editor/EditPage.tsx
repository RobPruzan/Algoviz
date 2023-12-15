"use client";
import { Algorithm, Preset } from "@prisma/client";
import React, {
  ComponentProps,
  Suspense,
  useContext,
  useRef,
  useState,
} from "react";
import { MainEditor } from "./MainEditor";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useGetAlgorithmsQuery } from "@/hooks/useGetAlgorithmsQuery";
import { useGetPresets } from "@/hooks/useGetPresets";
import Resizable from "../visualizer/Resizeable";
import { Button } from "@/components/ui/button";
import { AlgoContext } from "./algo-context";
import { Save, Trash } from "lucide-react";
import { useGetJoinedAlgos } from "./use-get-joined-algos";
import { cn, run } from "@/lib/utils";
import { Python } from "@/components/svgs/python";
import { ArrayItem, Percentage } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Command, CommandInput } from "@/components/ui/command";
import { CircleSlash } from "lucide-react";
import { XCircle } from "lucide-react";
import { CodeOutput } from "../CodeOutput";
import { useCodeMutation } from "@/hooks/useCodeMutation";

export const EditPage = () => {
  const { algo, setAlgo } = useContext(AlgoContext);
  const [search, setSearch] = useState("");

  const { codeMutation } = useCodeMutation();

  const joinedAlgos = useGetJoinedAlgos();
  const parent = useRef<HTMLDivElement | null>(null);
  const [editorHeight, setEditorHeight] = useState<Percentage | number>("68%");
  const [outputHeight, setOutputHeight] = useState<Percentage | number>("30%");
  return (
    <Resizable
      initialState={{
        divOneSize: "59.2%",
      }}
      className="border-2 prevent-select"
      leftDiv={
        <Resizable
          divOneSize={editorHeight}
          divTwoSize={outputHeight}
          setDiveOneSize={setEditorHeight}
          setDivTwoSize={setOutputHeight}
          topDiv={
            <>
              <div className="h-14 p-4 flex items-center font-bold justify-center text-lg border-b-2 ">
                <Button
                  className="font-bold text-base flex gap-x-4 justify-evenly"
                  variant={"outline"}
                >
                  Save <Save />
                </Button>
              </div>
              <MainEditor parentHeight={editorHeight} />
            </>
          }
          bottomDiv={
            <div className="h-full w-full bg-black">
              <CodeOutput className="w-full " codeMutation={codeMutation} />
            </div>
          }
          type="vertical"
        />
      }
      rightDiv={
        <div className="flex flex-col w-full h-full">
          <div className="'w-full h-14 p-2 gap-x-5 border-b flex items-center">
            <Search
              value={search}
              onValueChange={setSearch}
              className="w-full h-full "
            />
            {algo && (
              <div className="flex items-center gap-x-2 font-bold text-lg border rounded-md py-1 px-2">
                <Button
                  onClick={() => {
                    setAlgo(null);
                  }}
                  className="p-0 w-fit h-fit hover:scale-105 transition"
                  size={"sm"}
                >
                  <XCircle size={18} className="text-red-500" />
                </Button>

                {algo}
              </div>
            )}
          </div>
          <div className="grid p-4 auto-cols gap-x-[50px] gap-y-[50px] max-w-full overflow-y-scroll h-full">
            {joinedAlgos.map((joinedAlgo) => (
              <div
                key={joinedAlgo.id}
                className="rounded-md border h-32 w-full"
              >
                <Button
                  onClick={() => {
                    setAlgo(
                      joinedAlgo.type === "algo"
                        ? joinedAlgo.title
                        : joinedAlgo.name
                    );
                  }}
                  variant={"outline"}
                  className="h-[calc(100%-48px)] border-0 rounded-b-none w-full p-4 font-bold text-lg text-center"
                >
                  {run(() => {
                    switch (joinedAlgo.type) {
                      case "algo": {
                        return joinedAlgo.title.toUpperCase();
                      }
                      case "preset": {
                        return joinedAlgo.name.toUpperCase();
                      }
                    }
                    joinedAlgo satisfies never;
                  })}
                </Button>
                <div
                  className="
                h-12 border-t w-full flex items-center px-2 justify-evenly"
                >
                  <LanguageLogo joinedAlgo={joinedAlgo} />
                  <div className="px-2 rounded-lg font-bold border ">
                    {joinedAlgo.code?.split("\n").length} lines
                  </div>
                  <Button
                    size={"sm"}
                    className="border px-2"
                    variant={"outline"}
                  >
                    <Trash size={20} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      resizeBarClassName="border-x-2 border-y-0"
      type="horizontal"
    />
  );
};

const LanguageLogo = ({
  joinedAlgo,
}: {
  joinedAlgo: ArrayItem<ReturnType<typeof useGetJoinedAlgos>>;
}) => {
  switch (joinedAlgo.type) {
    case "algo": {
      switch (joinedAlgo.language.toLowerCase()) {
        case "python": {
          return <PythonLogo />;
        }
        default: {
          // return <Python />;
        }
      }
    }
    case "preset": {
      return <PythonLogo />;
    }
  }
};

const PythonLogo = () => (
  <div className="border rounded">
    <Python />
  </div>
);

const Search = (commandInputProps: ComponentProps<typeof CommandInput>) => {
  return (
    <>
      <Command className="rounded-lg border w-1/2 ">
        <CommandInput
          {...commandInputProps}
          className={cn(["h-full w-full", commandInputProps.className])}
        />
      </Command>
    </>
  );
};
