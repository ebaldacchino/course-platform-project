import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  ProductTable,
  PurchaseTable,
  UserCourseAccessTable,
} from "@/drizzle/schema";
import { getCourseGlobalTag } from "@/features/courses/courses.cache";
import { getUserCourseAccessGlobalTag } from "@/features/courses/userCourseAccess.cache";
import { getCourseSectionGlobalTag } from "@/features/courseSections/sections.cache";
import { getLessonGlobalTag } from "@/features/lessons/lessons.cache";
import { getProductGlobalTag } from "@/features/products/products.cache";
import type { PropsWithChildren } from "react";
// import { getPurchaseGlobalTag } from "@/features/purchases/purchases.cache"
import { formatNumber, formatPrice } from "@/lib/formatters";
import { count, countDistinct, isNotNull, sql, sum } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export default async function AdminPage() {
  const {
    averageNetPurchasesPerCustomer,
    netPurchases,
    netSales,
    refundedPurchases,
    totalRefunds,
  } = await getPurchaseDetails();

  return (
    <div className="container my-6 mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 md:grid-cols-4 gap-4">
        <StatCard title="Net Sales">{formatPrice(netSales)}</StatCard>
        <StatCard title="Refunded Sales">{formatPrice(totalRefunds)}</StatCard>
        <StatCard title="Un-Refunded Purchases">
          {formatNumber(netPurchases)}
        </StatCard>
        <StatCard title="Refunded Purchases">
          {formatNumber(refundedPurchases)}
        </StatCard>
        <StatCard title="Purchases Per User">
          {formatNumber(averageNetPurchasesPerCustomer, {
            maximumFractionDigits: 2,
          })}
        </StatCard>
        <StatCard title="Students">
          {formatNumber(await getTotalStudents())}
        </StatCard>
        <StatCard title="Products">
          {formatNumber(await getTotalProducts())}
        </StatCard>
        <StatCard title="Courses">
          {formatNumber(await getTotalCourses())}
        </StatCard>
        <StatCard title="CourseSections">
          {formatNumber(await getTotalCourseSections())}
        </StatCard>
        <StatCard title="Lessons">
          {formatNumber(await getTotalLessons())}
        </StatCard>
      </div>
    </div>
  );
}

function StatCard({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="font-bold text-2xl">{children}</CardTitle>
      </CardHeader>
    </Card>
  );
}

async function getPurchaseDetails() {
  "use cache";
  // cacheTag(getPurchaseGlobalTag());

  const data = await db
    .select({
      totalSales: sql<number>`COALESCE(${sum(
        PurchaseTable.pricePaidInCents
      )}, 0)`.mapWith(Number),
      totalPurchases: count(PurchaseTable.id),
      totalUsers: countDistinct(PurchaseTable.userId),
      isRefund: isNotNull(PurchaseTable.refundedAt),
    })
    .from(PurchaseTable)
    .groupBy((table) => table.isRefund);

  const [refundData] = data.filter((row) => row.isRefund);
  const [salesData] = data.filter((row) => !row.isRefund);

  const netSales = (salesData?.totalSales ?? 0) / 100;
  const totalRefunds = (refundData?.totalSales ?? 0) / 100;
  const netPurchases = salesData?.totalPurchases ?? 0;
  const refundedPurchases = refundData?.totalPurchases ?? 0;
  const averageNetPurchasesPerCustomer =
    typeof salesData?.totalUsers === "number" && salesData.totalUsers > 0
      ? netPurchases / salesData.totalUsers
      : 0;

  return {
    netSales,
    totalRefunds,
    netPurchases,
    refundedPurchases,
    averageNetPurchasesPerCustomer,
  };
}

async function getTotalStudents() {
  "use cache";
  cacheTag(getUserCourseAccessGlobalTag());

  const [data] = await db
    .select({ totalStudents: countDistinct(UserCourseAccessTable.userId) })
    .from(UserCourseAccessTable);

  return data?.totalStudents ?? 0;
}

async function getTotalCourses() {
  "use cache";
  cacheTag(getCourseGlobalTag());

  const [data] = await db
    .select({ totalCourses: count(CourseTable.id) })
    .from(CourseTable);

  return data?.totalCourses ?? 0;
}

async function getTotalProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  const [data] = await db
    .select({ totalProducts: count(ProductTable.id) })
    .from(ProductTable);

  return data?.totalProducts ?? 0;
}

async function getTotalLessons() {
  "use cache";
  cacheTag(getLessonGlobalTag());

  const [data] = await db
    .select({ totalLessons: count(LessonTable.id) })
    .from(LessonTable);

  return data?.totalLessons ?? 0;
}

async function getTotalCourseSections() {
  "use cache";
  cacheTag(getCourseSectionGlobalTag());

  const [data] = await db
    .select({ totalCourseSections: count(CourseSectionTable.id) })
    .from(CourseSectionTable);

  return data?.totalCourseSections ?? 0;
}
