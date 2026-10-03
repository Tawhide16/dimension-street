"use client";

import React, { use } from "react";
import ShopifyProductEditor from "@/components/admin/ShopifyProductEditor";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ShopifyProductEditor mode="edit" initialProductId={id} />;
}
