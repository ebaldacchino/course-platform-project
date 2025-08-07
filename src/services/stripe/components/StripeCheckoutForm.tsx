"use client";

import type { Product } from "@/features/products/products.types";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { getClientSessionSecret } from "../stripe.actions";
import { stripeClientPromise } from "../stripe.client";

interface StripeCheckoutFormProps {
  product: Product;
  user: {
    email: string;
    id: string;
  };
}

export function StripeCheckoutForm({ product, user }: StripeCheckoutFormProps) {
  return (
    <EmbeddedCheckoutProvider
      stripe={stripeClientPromise}
      options={{
        fetchClientSecret: getClientSessionSecret.bind(null, product, user),
      }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
