import { redirect } from "next/navigation";

import { AdminPage } from "@/app/components/admin/admin-page";
import { TaxonomyTabs } from "@/app/components/admin/taxonomy-tabs";
import { getSessionUser } from "@/app/lib/auth/server";
import { getCategoryRepository } from "@/app/lib/taxonomy/category-repository";
import { getHairTypeRepository } from "@/app/lib/taxonomy/hair-type-repository";

export default async function AdminTaxonomyPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const [categoryRepo, hairTypeRepo] = await Promise.all([
    getCategoryRepository(),
    getHairTypeRepository(),
  ]);
  const [categories, hairTypes] = await Promise.all([
    categoryRepo.list(),
    hairTypeRepo.list(),
  ]);

  return (
    <AdminPage
      title="Taxonomy"
      subtitle="Manage product categories and the hair types they belong to."
    >
      <TaxonomyTabs categories={categories} hairTypes={hairTypes} />
    </AdminPage>
  );
}
