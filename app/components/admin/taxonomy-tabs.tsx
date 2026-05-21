"use client";

import { CategoryManager } from "@/app/components/admin/category-manager";
import { HairTypeManager } from "@/app/components/admin/hair-type-manager";
import { Stack, Tabs, Text } from "@/app/components/ui";
import type { CategoryRecord, HairType } from "@/app/lib/taxonomy/types";

interface TaxonomyTabsProps {
  categories: CategoryRecord[];
  hairTypes: HairType[];
}

export function TaxonomyTabs({ categories, hairTypes }: TaxonomyTabsProps) {
  return (
    <Tabs defaultValue="categories" ariaLabel="Taxonomy sections">
      <Tabs.List ariaLabel="Choose taxonomy section">
        <Tabs.Trigger value="categories" count={categories.length}>
          Categories
        </Tabs.Trigger>
        <Tabs.Trigger value="hair-types" count={hairTypes.length}>
          Hair types
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Panel value="categories">
        <Stack gap="md">
          <Text variant="body-sm" tone="muted">
            Top-level groupings that products and hair types belong to. The
            first five ship with the app — add your own to extend the taxonomy.
          </Text>
          <CategoryManager initial={categories} />
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="hair-types">
        <Stack gap="md">
          <Text variant="body-sm" tone="muted">
            Textures and styles that sit underneath a category. Each hair type
            picks the category it belongs to.
          </Text>
          <HairTypeManager initial={hairTypes} categories={categories} />
        </Stack>
      </Tabs.Panel>
    </Tabs>
  );
}
