import { db } from "@/drizzle/db";
import {
  CourseProductTable,
  ProductTable,
  PurchaseTable,
} from "@/drizzle/schema";
//  import { getPurchaseUserTag } from "@/features/purchases/purchases.cache";
import { and, eq, isNull } from "drizzle-orm";
import { revalidateProductCache } from "./products.cache";
// import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export async function userOwnsProduct({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) {
  "use cache";
  // cacheTag(getPurchaseUserTag(userId));

  const existingPurchase = await db.query.PurchaseTable.findFirst({
    where: and(
      eq(PurchaseTable.productId, productId),
      eq(PurchaseTable.userId, userId),
      isNull(PurchaseTable.refundedAt)
    ),
  });

  return !!existingPurchase;
}

export async function insertProduct(
  data: typeof ProductTable.$inferInsert & { courseIds: string[] }
) {
  const newProduct = await db.transaction(async (transaction) => {
    const [newProduct] = await transaction
      .insert(ProductTable)
      .values(data)
      .returning();

    if (!newProduct) {
      transaction.rollback();
      throw new Error("Failed to create product");
    }

    await transaction.insert(CourseProductTable).values(
      data.courseIds.map((courseId) => ({
        productId: newProduct.id,
        courseId,
      }))
    );

    return newProduct;
  });

  revalidateProductCache(newProduct.id);

  return newProduct;
}

export async function updateProduct(
  id: string,
  data: Partial<typeof ProductTable.$inferInsert> & { courseIds: string[] }
) {
  const updatedProduct = await db.transaction(async (transaction) => {
    const [updatedProduct] = await transaction
      .update(ProductTable)
      .set(data)
      .where(eq(ProductTable.id, id))
      .returning();

    if (!updatedProduct) {
      transaction.rollback();
      throw new Error("Failed to create product");
    }

    await transaction
      .delete(CourseProductTable)
      .where(eq(CourseProductTable.productId, updatedProduct.id));

    await transaction.insert(CourseProductTable).values(
      data.courseIds.map((courseId) => ({
        productId: updatedProduct.id,
        courseId,
      }))
    );

    return updatedProduct;
  });

  revalidateProductCache(updatedProduct.id);

  return updatedProduct;
}

export async function deleteProduct(id: string) {
  const [deletedProduct] = await db
    .delete(ProductTable)
    .where(eq(ProductTable.id, id))
    .returning();

  if (!deletedProduct) throw new Error("Failed to delete product");

  revalidateProductCache(deletedProduct.id);

  return deletedProduct;
}
