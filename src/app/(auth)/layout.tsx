import type { PropsWithChildren } from "react";
import "./auth.css";

export default async function AuthLayout(props: PropsWithChildren<{}>) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      {props.children}
    </div>
  );
}
