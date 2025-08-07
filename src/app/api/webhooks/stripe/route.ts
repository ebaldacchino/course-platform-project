import { env } from "@/data/env/server";
import { db } from "@/drizzle/db";
import { ProductTable, UserTable } from "@/drizzle/schema";
import { addUserCourseAccess } from "@/features/courses/userCourseAccess.db";
import { insertPurchase } from "@/features/purchases/purchases.db";
import { stripeClient } from "@/services/stripe/stripe.server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getUser(id: string) {
  return db.query.UserTable.findFirst({
    columns: { id: true },
    where: eq(UserTable.id, id),
  });
}

function getProduct(id: string) {
  return db.query.ProductTable.findFirst({
    columns: {
      id: true,
      priceInDollars: true,
      name: true,
      description: true,
      imageUrl: true,
    },
    where: eq(ProductTable.id, id),
    with: {
      courseProducts: { columns: { courseId: true } },
    },
  });
}

async function processStripeCheckout(checkoutSession: Stripe.Checkout.Session) {
  const userId = checkoutSession.metadata?.userId;
  const productId = checkoutSession.metadata?.productId;

  if (!userId || !productId) {
    throw new Error("Missing metadata");
  }

  const [product, user] = await Promise.all([
    getProduct(productId),
    await getUser(userId),
  ]);

  if (!product) throw new Error("Product not found");
  if (!user) throw new Error("User not found");

  const courseIds = product.courseProducts.map((cp) => cp.courseId);
  db.transaction(async (trx) => {
    try {
      await addUserCourseAccess({ userId: user.id, courseIds }, trx);
      await insertPurchase(
        {
          stripeSessionId: checkoutSession.id,
          pricePaidInCents:
            checkoutSession.amount_total || product.priceInDollars * 100,
          productDetails: product,
          userId: user.id,
          productId,
        },
        trx
      );
    } catch (error) {
      trx.rollback();
      throw error;
    }
  });

  return productId;
}

export async function GET(request: NextRequest) {
  const stripeSessionId = request.nextUrl.searchParams.get("stripeSessionId");

  if (!stripeSessionId) {
    redirect("/products/purchase-failure");
  }

  let redirectUrl: string;

  try {
    const checkoutSession = await stripeClient.checkout.sessions.retrieve(
      stripeSessionId,
      { expand: ["line_items"] }
    );
    const productId = await processStripeCheckout(checkoutSession);

    redirectUrl = `/products/${productId}/purchase/success`;
  } catch {
    redirectUrl = "/products/purchase-failure";
  }

  return NextResponse.redirect(new URL(redirectUrl, request.url));
}

export async function POST(request: NextRequest) {
  const event = await stripeClient.webhooks.constructEvent(
    await request.text(),
    request.headers.get("stripe-signature") as string,
    env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      try {
        await processStripeCheckout(event.data.object);
      } catch {
        return new Response(null, { status: 500 });
      }
    }
  }
  return new Response(null, { status: 200 });
}
