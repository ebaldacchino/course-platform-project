import { Badge } from "@/components/ui/badge";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import type { PropsWithChildren } from "react";

function NavLink(props: PropsWithChildren<{ href: string }>) {
  const { children, href } = props;
  return (
    <Link className="hover:bg-accent/10 flex items-center px-2" href={href}>
      {children}
    </Link>
  );
}

function Navbar() {
  return (
    <header className="flex h-12 shadow bg-background z-10">
      <nav className="flex gap-4 container">
        <div className="mr-auto flex items-center gap-2">
          <Link className="text-lg hover:underline" href="/admin">
            Web Dev Simplified
          </Link>
          <Badge>Admin</Badge>
        </div>
        <NavLink href="/admin/courses">Courses</NavLink>
        <NavLink href="/admin/products">Products</NavLink>
        <NavLink href="/admin/sales">Sales</NavLink>
        <div className="size-8 self-center">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: { width: "100%", height: "100%" },
              },
            }}
          />
        </div>
      </nav>
    </header>
  );
}

export default function AdminLayout(props: Readonly<PropsWithChildren<{}>>) {
  return (
    <>
      <Navbar />
      {props.children}
    </>
  );
}
