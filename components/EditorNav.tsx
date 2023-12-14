import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

type Props = {};

export const EditorNav = (props: Props) => {
  return (
    <Link href="/editor">
      <Button className="mx-2" variant="outline">
        Editor
      </Button>
    </Link>
  );
};
