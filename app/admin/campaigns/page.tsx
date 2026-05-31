import { redirect } from "next/navigation";

import { AdminPage } from "@/app/components/admin/admin-page";
import { CampaignsManager } from "@/app/components/admin/campaigns-manager";
import { getSessionUser } from "@/app/lib/auth/server";
import { getCampaignRepository } from "@/app/lib/campaigns/campaign-repository";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const repo = await getCampaignRepository();
  const campaigns = await repo.list();

  return (
    <AdminPage
      title="Campaigns"
      subtitle="Drive the header banner, customer modal, and promo codes from one place."
    >
      <CampaignsManager campaigns={campaigns} />
    </AdminPage>
  );
}
