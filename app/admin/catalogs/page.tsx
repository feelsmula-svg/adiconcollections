import { redirect } from "next/navigation";

import { AdminPage } from "@/app/components/admin/admin-page";
import { getSessionUser } from "@/app/lib/auth/server";
import { getProductRepository } from "@/app/lib/products/product-repository";
import { seedProductMetas } from "@/app/lib/products/seed-stock";
import { CatalogMaker } from "./catalog-maker";

export const dynamic = "force-dynamic";

export default async function AdminCatalogsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const repo = await getProductRepository();
  const adminProducts = await repo.list();
  const seedProducts = seedProductMetas();

  const allProducts = [
    ...seedProducts.map((p) => ({
      id: p.product.id,
      name: p.product.name,
      imageUrl: p.product.imageSrc,
    })),
    ...adminProducts.map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
    })),
  ];

  return (
    <AdminPage
      title="Catalogs"
      subtitle="Create composite product images for social media."
    >
      <CatalogMaker availableProducts={allProducts} />
    </AdminPage>
  );
}
