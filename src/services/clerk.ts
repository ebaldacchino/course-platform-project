import { db } from "@/drizzle/db";
import { type UserRole, UserTable } from "@/drizzle/schema";
import { getUserIdTag } from "@/features/users/users.cache";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { redirect } from "next/navigation";

const client = await clerkClient();

export async function getCurrentUser({ allData = false } = {}) {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  const dbId = sessionClaims?.dbId;

  if (typeof userId === "string" && typeof dbId !== "string") {
    redirect("/api/clerk/syncUsers");
  }

  return {
    clerkUserId: userId,
    userId: dbId,
    role: sessionClaims?.role,
    user: allData && typeof dbId === "string" ? await getUser(dbId) : undefined,
    redirectToSignIn,
  };
}

interface User {
  id: string;
  clerkUserId: string;
  role: UserRole;
}

export function syncClerkUserMetadata(user: User) {
  const { clerkUserId, id: dbId, role } = user;
  return client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { dbId, role },
  });
}

async function getUser(id: string) {
  "use cache";
  cacheTag(getUserIdTag(id));

  return db.query.UserTable.findFirst({ where: eq(UserTable.id, id) });
}
