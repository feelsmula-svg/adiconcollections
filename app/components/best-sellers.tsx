import Image from "next/image";

interface BestSeller {
  rank: number;
  name: string;
  texture: string;
  price: string;
  image: { src: string; alt: string };
}

const BEST_SELLERS: BestSeller[] = [
  {
    rank: 1,
    name: "Brazilian Body Wave Bundle",
    texture: "Body Wave · 20\"",
    price: "₦1,189,000.00",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoeb3fKuu8Dtb70zQYGKO2T3DRvOIQWPoM667zl5UxVhRBUQC7Zo7e4Y2JGclRqD0P2PWqSgdTq_1EP1g4K1DxVWrls2QLlBcdObRylp8yhGt-DNOHpFrY7gxNcJj3udAGtmsjhRWznEaPQVUXjjgTpnKwrBxlKZ3q_Y_o2JflafdkUFCsNFf3AZfoGvTd8GeZW9Je6oGTrn-8_vJdMMKaosi-pwDmIVVDSZ_c0Yns6bir-nqgQTBpPeHqhfTBcrSt00qSIMbGnAM",
      alt: "Brazilian body wave hair bundle in espresso brown",
    },
  },
  {
    rank: 2,
    name: "Premium Cambodian Straight",
    texture: "Silky Straight · 18\"",
    price: "₦1,049,500.00",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUmlN5E6Lu2H7kiWBcut-VvHfI6cCyf-ChKUgfeHTceuSBHKQln-nkjn5pCGRdeNixBb2HDHAMjweWbfrNayPIVx_N3xXEYte-LgMHJfy73vAM752b6J_QASdtNFnLsG2QybXHmBD1Yv2zQ_hi4rzXKKDkAxKX6otA-T0YG0WF-gTxtQ4HwmoLh1uVOanBiu0a0aenDUK3xqdvX0uzjv-d9CWWZeffpM2j1X-neQjJRXqLMeAuYiT7CajtQIrZ5FNE-TqPXDu_LcQ",
      alt: "Premium raw straight hair bundle in deep mahogany",
    },
  },
  {
    rank: 3,
    name: "Sleek Kinky-Straight Ponytail",
    texture: "Kinky Straight · 22\"",
    price: "₦849,000.00",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCU1wYHLGRxKC3iEjqjZl7_lKPLJvSgjeXSknIhaBqTQ0nRPXw2pqS-FceHdFRKLhlu5ULbDJbdtZpJHfzCTvYUG2wcpQsaoyITFoKLECG81KvqnXVx0ZdJAwdV81KSOIAztMjpDTwyRWrFSiCzSICJewEBaAP1O8e-sE0k3baDMji8wJ_VkwNUoH3rUcPzuw7HXTVeeXiJcdkhELAKX2YgIK35fEhDJ_kOoSxg80MQaevXiKs_Z8bMStq4Zm2imtkOJN1y3GjN_O0",
      alt: "Sleek kinky-straight hair styled into a polished ponytail",
    },
  },
  {
    rank: 4,
    name: "Vacation Deep Wave Set",
    texture: "Deep Wave · 24\"",
    price: "₦1,455,000.00",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLxHQ1th-UofgNJr-rYSTKNvbhSoJpzITu2TPl1CI5uatdTuIaAUlVA_TeZ9j6A_44ZepsQpAXFOfJOc8_8NUn4nAA7g3RGYTks9czpVzTxDujbAADHsnYY0lwq7kgqYs7N0KsDpkmC1dwGuuL-ep_pnc0DlYJVrMJCisVAXUDcMAhPBo-w9R1MBJsSTEUpqC8SlqDmzUeMgO989nmFlsExXuSL1k4aoJ7H3m4OfZszRz9yQwoXYk1P0xbDZ9nlwGb0j7rTrvGByk",
      alt: "Model on vacation wearing deep wave extensions in golden light",
    },
  },
];

function BestSellerCard({ product }: { product: BestSeller }) {
  return (
    <article className="group cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-container-low mb-md">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-md left-md bg-primary text-white px-sm py-1 font-label-caps text-[10px] tracking-widest">
          BESTSELLER
        </span>
        <span
          aria-hidden
          className="absolute top-md right-md font-display-lg text-white text-[44px] leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
        >
          0{product.rank}
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-md">
          <button
            type="button"
            className="w-full bg-primary text-white py-3 font-label-caps text-xs tracking-widest shadow-lg hover:opacity-90 transition-opacity"
          >
            ADD TO BAG
          </button>
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-[10px] text-outline tracking-widest uppercase">
          {product.texture}
        </p>
        <h3 className="font-body-md text-sm text-on-surface-variant uppercase tracking-wide">
          {product.name}
        </h3>
        <p className="font-bold text-primary">{product.price}</p>
      </div>
    </article>
  );
}

export function BestSellers() {
  return (
    <section className="px-lg mb-section">
      <div className="text-center mb-xl">
        <p className="font-label-caps text-xs tracking-widest text-on-surface-variant mb-sm">
          AS LOVED BY OUR COMMUNITY
        </p>
        <div className="flex items-center gap-md justify-center">
          <div className="h-px bg-outline-variant w-16" />
          <h2 className="font-display-lg text-headline-sm uppercase tracking-widest">
            Our Best Sellers
          </h2>
          <div className="h-px bg-outline-variant w-16" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-xl">
        {BEST_SELLERS.map((product) => (
          <BestSellerCard key={product.name} product={product} />
        ))}
      </div>
    </section>
  );
}
