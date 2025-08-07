import { env } from "@/data/env/server";
import { deleteUser, insertUser, updateUser } from "@/features/users/users.db";
import { syncClerkUserMetadata } from "@/services/clerk";
import type { UserJSON, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

function getErrorMessage(error: unknown, defaultMessage = "Unknown error") {
  return error instanceof Error ? error.message : defaultMessage;
}

function cleanAndValidateUser(data: UserJSON) {
  const email = data.email_addresses.find(
    (email) => email.id === data.primary_email_address_id
  )?.email_address;
  const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();

  if (!email) throw new Error("Email is required");
  if (!name) throw new Error("Name is required");

  if (name.length < 3)
    throw new Error("Name must be at least 3 characters long");

  // TODO: Improve email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Invalid email format");

  return {
    email,
    name,
    role: data.public_metadata.role,
    clerkUserId: data.id,
    imageUrl: data.image_url,
  };
}

async function getSvixHeaders() {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error("Error occurred -- no svix headers");
  }

  return { svixId, svixTimestamp, svixSignature };
}

export async function POST(req: Request) {
  let event: WebhookEvent;

  try {
    const { svixId, svixSignature, svixTimestamp } = await getSvixHeaders();

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response(getErrorMessage(err), { status: 400 });
  }

  try {
    switch (event.type) {
      case "user.created": {
        const data = cleanAndValidateUser(event.data);
        const user = await insertUser({ ...data, role: "user" });
        await syncClerkUserMetadata(user);
        break;
      }
      case "user.updated": {
        const { clerkUserId, ...data } = cleanAndValidateUser(event.data);
        await updateUser({ clerkUserId }, data);
        break;
      }
      case "user.deleted": {
        if (typeof event.data.id === "string") {
          await deleteUser({ clerkUserId: event.data.id });
        }
        break;
      }
      default:
        throw new Error(`Unhandled event type: ${event.type}`);
    }
  } catch (error: unknown) {
    return new Response(getErrorMessage(error), { status: 400 });
  }

  return new Response(null, { status: 200 });
}
