import { insertUser } from "@/features/users/users.db";
import { syncClerkUserMetadata } from "@/services/clerk";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) return new Response("User not found", { status: 500 });

  if (typeof user.fullName !== "string") {
    return new Response("User name missing", { status: 500 });
  }

  if (typeof user.primaryEmailAddress?.emailAddress !== "string") {
    return new Response("User email missing", { status: 500 });
  }

  const dbUser = await insertUser({
    clerkUserId: user.id,
    name: user.fullName,
    email: user.primaryEmailAddress.emailAddress,
    imageUrl: user.imageUrl,
    role: user.publicMetadata.role ?? "user",
  });

  await syncClerkUserMetadata(dbUser);

  /*
   * Hack -> allowing time for clerk user meta data to be synced
   */
  await new Promise((res) => setTimeout(res, 100));

  return NextResponse.redirect(request.headers.get("referer") ?? "/");
}
