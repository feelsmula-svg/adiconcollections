import { redirect } from "next/navigation";

import { AdminPage } from "@/app/components/admin/admin-page";
import { PromoCodesManager } from "@/app/components/admin/promo-codes-manager";
import { getSessionUser } from "@/app/lib/auth/server";
import { getCampaignRepository } from "@/app/lib/campaigns/campaign-repository";

export const dynamic = "force-dynamic";

export default async function AdminPromoCodesPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const repo = await getCampaignRepository();
  const campaigns = await repo.list();

  return (
    <AdminPage
      title="Promo codes"
      subtitle="Generate codes customers can redeem at checkout. Promote one to a full campaign whenever you want a banner or modal alongside it."
    >
      <PromoCodesManager campaigns={campaigns} />
    </AdminPage>
  );
}
