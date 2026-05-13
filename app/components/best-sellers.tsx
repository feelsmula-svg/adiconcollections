import {
  Box,
  Container,
  Heading,
  Section,
  Stack,
  Text,
} from "@/app/components/ui";
import { BEST_SELLERS } from "@/app/lib/products/catalog";
import { ProductCard } from "./products/product-card";

export function BestSellers() {
  return (
    <Section padding="lg">
      <Container width="default">
        <Stack gap="xl">
          <Stack gap="xs" align="center">
            <Text
              variant="label-caps"
              tone="muted"
              className="tracking-[0.2em]"
            >
              As loved by our community
            </Text>
            <Heading
              level={2}
              variant="display-lg"
              size="headline-sm"
              align="center"
              className="uppercase tracking-[0.2em]"
            >
              Our Best Sellers
            </Heading>
          </Stack>

          <Box className="grid grid-cols-2 md:grid-cols-4 gap-xl">
            {BEST_SELLERS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                rank={product.rank}
              />
            ))}
          </Box>
        </Stack>
      </Container>
    </Section>
  );
}
