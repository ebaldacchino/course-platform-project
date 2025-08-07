import { PageHeader } from "@/components/PageHeader";
import { db } from "@/drizzle/db";
import { CourseTable, ProductTable } from "@/drizzle/schema";
import { getCourseGlobalTag } from "@/features/courses//courses.cache";
import { ProductForm } from "@/features/products/components/ProductForm";
import { getProductIdTag } from "@/features/products/products.cache";
import { asc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function EditProductPage(props: EditProductPageProps) {
  const { productId } = await props.params;
  const product = await getProduct(productId);

  if (!product) return notFound();

  return (
    <div className="container my-6 mx-auto">
      <PageHeader title="New Product" />
      <ProductForm
        product={{
          ...product,
          courseIds: product.courseProducts.map((c) => c.courseId),
        }}
        courses={await getCourses()}
      />
    </div>
  );
}

async function getCourses() {
  "use cache";
  cacheTag(getCourseGlobalTag());

  return db.query.CourseTable.findMany({
    orderBy: asc(CourseTable.name),
    columns: { id: true, name: true },
  });
}

async function getProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  return db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      status: true,
      imageUrl: true,
    },
    where: eq(ProductTable.id, id),
    with: { courseProducts: { columns: { courseId: true } } },
  });
}
