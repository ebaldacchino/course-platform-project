import { Button } from "@/components/ui/button";
import { canAccessAdminPages } from "@/features/permissions";
import { getCurrentUser } from "@/services/clerk";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { PropsWithChildren, Suspense } from "react";

function NavLink(props: PropsWithChildren<{ href: string }>) {
  const { children, href } = props;
  return (
    <Link className="hover:bg-accent/10 flex items-center px-2" href={href}>
      {children}
    </Link>
  );
}

async function AdminLink() {
  const user = await getCurrentUser();

  if (canAccessAdminPages(user)) {
    return <NavLink href="/admin">Admin</NavLink>;
  }
}

function Navbar() {
  return (
    <header className="flex h-12 shadow bg-background z-10">
      <nav className="flex gap-4 container">
        <Link
          className="mr-auto text-lg hover:underline flex items-center"
          href="/"
        >
          Web Dev Simplified
        </Link>
        <Suspense>
          <SignedIn>
            <AdminLink />
            <NavLink href="/courses">Courses</NavLink>
            <NavLink href="/purchases">Purchase History</NavLink>
            <div className="size-8 self-center">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: { width: "100%", height: "100%" },
                  },
                }}
              />
            </div>
          </SignedIn>
        </Suspense>
        <Suspense>
          <SignedOut>
            <Button className="self-center" asChild>
              <SignInButton>Sign In</SignInButton>
            </Button>
          </SignedOut>
        </Suspense>
      </nav>
    </header>
  );
}

export default function ConsumerLayout(props: Readonly<PropsWithChildren<{}>>) {
  return (
    <>
      <Navbar />
      {props.children}
    </>
  );
}
