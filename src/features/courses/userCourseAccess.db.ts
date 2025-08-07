import { db } from "@/drizzle/db";
import {
  ProductTable,
  PurchaseTable,
  UserCourseAccessTable,
} from "@/drizzle/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { revalidateUserCourseAccessCache } from "./userCourseAccess.cache";

export async function addUserCourseAccess(
  {
    userId,
    courseIds,
  }: {
    userId: string;
    courseIds: string[];
  },
  transaction: Omit<typeof db, "$client"> = db
) {
  const accesses = await transaction
    .insert(UserCourseAccessTable)
    .values(courseIds.map((courseId) => ({ userId, courseId })))
    .onConflictDoNothing()
    .returning();

  accesses.forEach(revalidateUserCourseAccessCache);

  return accesses;
}

export async function revokeUserCourseAccess(
  {
    userId,
    productId,
  }: {
    userId: string;
    productId: string;
  },
  transaction: Omit<typeof db, "$client"> = db
) {
  const validPurchases = await transaction.query.PurchaseTable.findMany({
    where: and(
      eq(PurchaseTable.userId, userId),
      isNull(PurchaseTable.refundedAt)
    ),
    with: {
      product: {
        with: { courseProducts: { columns: { courseId: true } } },
      },
    },
  });

  const refundPurchase = await transaction.query.ProductTable.findFirst({
    where: eq(ProductTable.id, productId),
    with: { courseProducts: { columns: { courseId: true } } },
  });

  if (!refundPurchase) return;

  const validCourseIds = validPurchases.flatMap((p) =>
    p.product.courseProducts.map((cp) => cp.courseId)
  );

  const removeCourseIds = refundPurchase.courseProducts
    .flatMap((cp) => cp.courseId)
    .filter((courseId) => !validCourseIds.includes(courseId));

  const revokedAccesses = await transaction
    .delete(UserCourseAccessTable)
    .where(
      and(
        eq(UserCourseAccessTable.userId, userId),
        inArray(UserCourseAccessTable.courseId, removeCourseIds)
      )
    )
    .returning();

  revokedAccesses.forEach(revalidateUserCourseAccessCache);

  return revokedAccesses;
}
