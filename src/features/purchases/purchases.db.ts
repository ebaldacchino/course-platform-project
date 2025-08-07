import { db } from "@/drizzle/db";
import { PurchaseTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePurchaseCache } from "./purchases.cache";

export async function insertPurchase(
  data: typeof PurchaseTable.$inferInsert,
  transaction: Omit<typeof db, "$client"> = db
) {
  const details = data.productDetails;

  const [newPurchase] = await transaction
    .insert(PurchaseTable)
    .values({
      ...data,
      productDetails: {
        name: details.name,
        description: details.description,
        imageUrl: details.imageUrl,
      },
    })
    /*
     * Hack -> we redirect the user to the page and save the purchase, then later stripe sends us a web hook to save the same purchase
     */
    .onConflictDoNothing()
    .returning();

  if (!!newPurchase) revalidatePurchaseCache(newPurchase);

  return newPurchase;
}

export async function updatePurchase(
  id: string,
  data: Partial<typeof PurchaseTable.$inferInsert>,
  transaction: Omit<typeof db, "$client"> = db
) {
  const details = data.productDetails;

  const [updatedPurchase] = await transaction
    .update(PurchaseTable)
    .set({
      ...data,
      productDetails: details
        ? {
            name: details.name,
            description: details.description,
            imageUrl: details.imageUrl,
          }
        : undefined,
    })
    .where(eq(PurchaseTable.id, id))
    .returning();

  if (!updatedPurchase) throw new Error("Failed to update purchase");

  revalidatePurchaseCache(updatedPurchase);

  return updatedPurchase;
}
