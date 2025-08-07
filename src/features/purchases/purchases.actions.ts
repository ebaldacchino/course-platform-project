"use server";

import { db } from "@/drizzle/db";
import { revokeUserCourseAccess } from "@/features/courses/userCourseAccess.db";
import { getCurrentUser } from "@/services/clerk";
import { stripeClient } from "@/services/stripe/stripe.server";
import { updatePurchase } from "./purchases.db";
import { canRefundPurchases } from "./purchases.permissions";

export async function refundPurchase(id: string) {
  if (!canRefundPurchases(await getCurrentUser())) {
    return {
      error: true,
      message: "There was an error refunding this purchase",
    };
  }

  const data = await db.transaction(async (transaction) => {
    const refundedPurchase = await updatePurchase(
      id,
      { refundedAt: new Date() },
      transaction
    );

    const session = await stripeClient.checkout.sessions.retrieve(
      refundedPurchase.stripeSessionId
    );

    if (!session.payment_intent) {
      transaction.rollback();
      return {
        error: true,
        message: "There was an error refunding this purchase",
      };
    }

    try {
      await stripeClient.refunds.create({
        payment_intent:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id,
      });
      await revokeUserCourseAccess(refundedPurchase, transaction);
    } catch {
      transaction.rollback();
      return {
        error: true,
        message: "There was an error refunding this purchase",
      };
    }
  });

  return data ?? { error: false, message: "Successfully refunded purchase" };
}
