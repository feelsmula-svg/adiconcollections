import { redirect } from "next/navigation";

import { AdminShell } from "@/app/components/admin/admin-shell";
import { ProductForm } from "@/app/components/admin/product-form";
import { LinkButton } from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";
import { getCategoryRepository } from "@/app/lib/taxonomy/category-repository";
import { getHairTypeRepository } from "@/app/lib/taxonomy/hair-type-repository";

export default async function AdminProductNewPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const [typesRepo, categoryRepo] = await Promise.all([
    getHairTypeRepository(),
    getCategoryRepository(),
  ]);
  const [hairTypes, categories] = await Promise.all([
    typesRepo.list(),
    categoryRepo.list(),
  ]);

  return (
    <AdminShell
      user={user}
      active="products"
      title="Upload product"
      subtitle="Add a product that customers will see in the shop."
    >
      <LinkButton
        href="/admin/products"
        variant="ghost"
        size="sm"
        caps={false}
      >
        ← Back to catalog
      </LinkButton>
      <ProductForm
        mode="create"
        hairTypes={hairTypes}
        categories={categories}
      />
    </AdminShell>
  );
}
