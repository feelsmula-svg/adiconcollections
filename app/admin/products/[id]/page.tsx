import { notFound, redirect } from "next/navigation";

import { AdminShell } from "@/app/components/admin/admin-shell";
import { ProductForm } from "@/app/components/admin/product-form";
import { LinkButton } from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";
import { getProductRepository } from "@/app/lib/products/product-repository";
import { getCategoryRepository } from "@/app/lib/taxonomy/category-repository";
import { getHairTypeRepository } from "@/app/lib/taxonomy/hair-type-repository";

interface AdminProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProductEditPage({
  params,
}: AdminProductEditPageProps) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const { id } = await params;
  const repo = await getProductRepository();
  const product = await repo.findById(id);
  if (!product) notFound();

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
      title={product.name}
      subtitle="Edit product details, update stock, or remove from the shop."
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
        mode="edit"
        initial={product}
        hairTypes={hairTypes}
        categories={categories}
      />
    </AdminShell>
  );
}
