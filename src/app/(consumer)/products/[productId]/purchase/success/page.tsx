import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { getProductIdTag } from "@/features/products/products.cache";
import { wherePublicProducts } from "@/features/products/products.permissions";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Image from "next/image";
import Link from "next/link";

interface ProductPurchaseSuccessPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductPurchaseSuccessPage(
  props: ProductPurchaseSuccessPageProps
) {
  const { productId } = await props.params;
  const product = await getPublicProduct(productId);

  if (!product) return;

  return (
    <div className="container my-6 mx-auto">
      <div className="flex gap-16 items-center justify-between">
        <div className="flex flex-col gap-4 items-start">
          <div className="text-3xl font-semibold">Purchase Successful</div>
          <div className="text-xl">
            Thank you for purchasing {product.name}.
          </div>
          <Button asChild className="text-xl h-auto py-4 px-8 rounded-lg">
            <Link href="/courses">View My Courses</Link>
          </Button>
        </div>
        <div className="relative aspect-video max-w-lg flex-grow">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

async function getPublicProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  return db.query.ProductTable.findFirst({
    columns: {
      name: true,
      imageUrl: true,
    },
    where: and(eq(ProductTable.id, id), wherePublicProducts),
  });
}
