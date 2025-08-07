import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { getProductIdTag } from "@/features/products/products.cache";
import { userOwnsProduct } from "@/features/products/products.db";
import { wherePublicProducts } from "@/features/products/products.permissions";
import { getCurrentUser } from "@/services/clerk";
import { StripeCheckoutForm } from "@/services/stripe/components/StripeCheckoutForm";
import { SignIn, SignUp } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

export default function PurchasePage(props: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ authMode: string }>;
}) {
  const { params, searchParams } = props;
  return (
    <Suspense fallback={<LoadingSpinner className="m-auto size-36 mx-auto" />}>
      <SuspendedComponent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function SuspendedComponent(props: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ authMode: string }>;
}) {
  const { params, searchParams } = props;
  const { productId } = await params;
  const { user } = await getCurrentUser({ allData: true });
  const product = await getPublicProduct(productId);

  if (!product) return notFound();

  if (typeof user === "object") {
    if (await userOwnsProduct({ userId: user.id, productId })) {
      redirect("/courses");
    }

    return (
      <div className="container my-6 mx-auto">
        <StripeCheckoutForm product={product} user={user} />
      </div>
    );
  }

  const { authMode } = await searchParams;

  const AuthPage = authMode === "signUp" ? SignUp : SignIn;

  return (
    <div className="container my-6 flex flex-col items-center mx-auto">
      <PageHeader title="You need an account to make a purchase" />
      <AuthPage
        routing="hash"
        signInUrl={`/products/${productId}/purchase?authMode=${authMode}`}
        forceRedirectUrl={`/products/${productId}/purchase`}
      />
    </div>
  );
}

async function getPublicProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  return db.query.ProductTable.findFirst({
    columns: {
      name: true,
      id: true,
      imageUrl: true,
      description: true,
      priceInDollars: true,
    },
    where: and(eq(ProductTable.id, id), wherePublicProducts),
  });
}
