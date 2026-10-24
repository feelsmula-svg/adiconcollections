import Image from "next/image";
import { TextLink } from "@/app/components/ui";

interface Category {
  label: string;
  image: string;
  alt: string;
  href: string;
}

const CATEGORIES: Category[] = [
  {
    label: "Shop Wigs",
    image: "/categories/category-wigs.jpeg",
    alt: "Body wave lace wig styled with soft glamorous waves",
    href: "/wigs",
  },
  {
    label: "Shop Bundles",
    image: "/categories/category-bundles.jpeg",
    alt: "Loose body wave bundles styled in flowing layers",
    href: "/bundles",
  },
  {
    label: "Frontals & Closures",
    image: "/categories/category-frontals.jpeg",
    alt: "Sleek straight lace frontal install with a clean middle part",
    href: "/frontals-and-closures",
  },
  {
    label: "Accessories",
    image: "/categories/category-accessories.jpeg",
    alt: "Curated set of styling accessories for AdiCon hair",
    href: "/accessories",
  },
];

export function ShopByTexture() {
  return (
    <section className="px-lg mb-section">
      <div className="flex items-center gap-md mb-xl">
        <div className="h-px bg-outline-variant flex-1" />
        <h2 className="font-display-lg text-headline-sm uppercase tracking-widest">
          Shop by Category
        </h2>
        <div className="h-px bg-outline-variant flex-1" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        {CATEGORIES.map((category) => (
          <TextLink
            key={category.label}
            href={category.href}
            variant="bare"
            aria-label={category.label}
            className="group relative aspect-[4/5] overflow-hidden bg-surface-container"
          >
            <Image
              src={category.image}
              alt={category.alt}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <span className="border-2 border-white px-xl py-3 text-white font-display-lg text-headline-sm uppercase tracking-widest backdrop-blur-sm text-center">
                {category.label}
              </span>
            </div>
          </TextLink>
        ))}
      </div>
    </section>
  );
}
