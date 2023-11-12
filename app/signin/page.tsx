import { Button } from "@/components/ui/button";
import { NextAuthOptions } from "next-auth";

import { signIn } from "next-auth/react";
import React from "react";

import { authOptions } from "../api/auth/[...nextauth]/auth-options";
import SignIn from "./SignIn";
import PageWrapper from "./PageWrapper";

type Props = {};

const page = () => {
  return <PageWrapper />;
};

export default page;
