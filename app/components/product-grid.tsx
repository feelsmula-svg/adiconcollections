import Image from "next/image";

interface Product {
  name: string;
  subtitle: string;
  price: string;
  lengths: string[];
  badge?: { label: string; tone: "primary" | "secondary" };
  primaryImage: { src: string; alt: string };
  hoverImage: { src: string; alt: string };
}

const PRODUCTS: Product[] = [
  {
    name: "Raw Cambodian Straight",
    subtitle: "100% Single Donor Raw Hair",
    price: "₦45,000",
    lengths: ['12"', '14"', '16"'],
    badge: { label: "NEW ARRIVAL", tone: "primary" },
    primaryImage: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUmlN5E6Lu2H7kiWBcut-VvHfI6cCyf-ChKUgfeHTceuSBHKQln-nkjn5pCGRdeNixBb2HDHAMjweWbfrNayPIVx_N3xXEYte-LgMHJfy73vAM752b6J_QASdtNFnLsG2QybXHmBD1Yv2zQ_hi4rzXKKDkAxKX6otA-T0YG0WF-gTxtQ4HwmoLh1uVOanBiu0a0aenDUK3xqdvX0uzjv-d9CWWZeffpM2j1X-neQjJRXqLMeAuYiT7CajtQIrZ5FNE-TqPXDu_LcQ",
      alt: "Premium raw straight hair bundle in deep mahogany on a warm beige backdrop",
    },
    hoverImage: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJIrDCbKHj1lNWjlz2XTnjJTDqVrUvoJ0NP60Nk1aOVjZ55br3avfOpNxc5hUEKJM_JCMjUWu0FDDYKlEsx_hKbfrFN6ClMQKeUZKR6sNgmsMbB7F0jLMJoZxDzRzcHOA5ZPsSiQ1Tl3BALH-3U0ZMo9VBZXGnWcKRAEZd4vFFGQkjtPA7-_QVP8XXD8MfniWKE6pYGGREAPpMfqivuBQ6qhaGd8oN7IoUNBsmgT4185cMERKmpDkVJKTIPd2XJr0Aqmmb3yL6aAU",
      alt: "Model styled with the straight hair extensions in warm sunlight",
    },
  },
  {
    name: "Brazilian Deep Wave",
    subtitle: "Thick & Bouncy Texture",
    price: "₦52,000",
    lengths: ['18"', '20"', '22"'],
    primaryImage: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoeb3fKuu8Dtb70zQYGKO2T3DRvOIQWPoM667zl5UxVhRBUQC7Zo7e4Y2JGclRqD0P2PWqSgdTq_1EP1g4K1DxVWrls2QLlBcdObRylp8yhGt-DNOHpFrY7gxNcJj3udAGtmsjhRWznEaPQVUXjjgTpnKwrBxlKZ3q_Y_o2JflafdkUFCsNFf3AZfoGvTd8GeZW9Je6oGTrn-8_vJdMMKaosi-pwDmIVVDSZ_c0Yns6bir-nqgQTBpPeHqhfTBcrSt00qSIMbGnAM",
      alt: "Deep wave bundle with thick, lush coils in espresso brown",
    },
    hoverImage: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFX-9OmhJh4SRCnSkpCosnj2Iqrldwchm4acYjj5p1cAVj3uRnxLDhFh9ImRSaMTii3LwPKe-MFNT7NzveZ0SN1xzBackXquYvL_YkNm0K3t7wxGccYMleM6mJzB3Fun6a5jRJrYE0x29FFO1KwechrwThyn4TLPOmplts8ypZyhhByhDKd7tn2koxTofEH9iOHWL93nNBL5hBRK98cDsnQ-IgDVFD4zrXl3NfT5Xk5h9-Oguy9Hn7mbQ-fOAiLJxSzZVNfnZFlls",
      alt: "Model wearing the deep wave extensions in natural sunlight",
    },
  },
  {
    name: "Premium Body Wave",
    subtitle: "Lustrous natural flow",
    price: "₦48,500",
    lengths: ['20"', '24"'],
    badge: { label: "BEST SELLER", tone: "secondary" },
    primaryImage: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-ptJMAbyOUw-frvgvp43yrgy1e5uPHM3tuxdtwor_Km0M8mctKhjFRvCULC5qAf5mrywm5z4PN0d_1n6DCWVLkpBJnyqMB6sHR_tTaBOI5rYjGr9AruLYK4UlAbtDEsx1JZgecD8n39ailqQxHpJixfZ4oHXsJvyQXhdcZBbhOdR7JP20zaFivIUu4ncbhbrllKNhociMPlzxqx2JKWWcbFfBKrw5uygsJzDZO8xUUGhxt7C2KXKh_w43e0G0uqoCaYmzW94Tgz0",
      alt: "Sleek body wave extensions in deep charcoal with subtle highlights",
    },
    hoverImage: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2h6Ux5CcX2EjJUBR_8f7Vpc7rNClQyNwBFHAH_wEVEhvDAZs0WniRfUtNC35CgZXOg62nHkSrN91sci53O8u4HQIfBkLaJRBWzuxMo5J2x7XssdUBChCTdHV5g_j4ndGMrtQfRzkj-UXqu98tkNiTYKyqB4YCdzMtgxqUxHuE0RgB1TlR-p5qQd40ijj8xzFHpTOgm42OauxMzqY_85jf18CkWjV5ZjYCIyd3nh_FQmau3SKp1a9toVpi-dlnADQPA6tZ9_PuHNc",
      alt: "Model with long body wave hair in a bright upscale interior",
    },
  },
  {
    name: "Afro Kinky Curly",
    subtitle: "Authentic coily texture",
    price: "₦55,000",
    lengths: ['14"', '16"'],
    primaryImage: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCW8qxAiw1Blo25WfDtBiSmW40ZEg_wBz81lH53LtvyIyUZxS5I4BJsoisMrHuXyybeCSFNFeuZKOIQ9E02Bm14LUyOXzlErt9sepr8jpPNEGY_OlZtfQWqW7rMBUf7_kfG5j_8rRaMqcZleHoVgje5SlZnRLJieZJGtaR0EsJq5cG8Q3wWEM9--sEbCF41G7l__aW0WcdtmLcVVRzqjnw6GCBVeX_hm_tiTscu8dORpbxnkUTQjjRr45CQnEDVXIb4KusHeJ5h5qU",
      alt: "Kinky curly hair bundles with dense springy coils",
    },
    hoverImage: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaEcUE5_Bnx1dHCRDPZvNmDKJTm2IrsNEjosQwGA6B7sed7xiIHI7gkb0Atwn4ObqE14qHekQjAAfLwjFfocjQemWW0CkM9cMIUeTvXeABjxLpqpsu_FxWwShkyuSDxX0la3vDU5qWln6B3Di9t-DEnUsD1FSFaFyZ5199v2GZtWhLr3_eQXJoCHLy_ZJUmU-g4VJu7u-xdi43PBvJ6S_YY0mQqYVVp2gpP8iZbEMI5K4qfcAk6ZxB8md8Yqcmn7kqTw3G-peRvfU",
      alt: "Model showcasing voluminous kinky curly extensions",
    },
  },
];

function ProductCard({ product }: { product: Product }) {
  const badgeClass =
    product.badge?.tone === "secondary"
      ? "bg-secondary-container text-on-secondary-container"
      : "bg-primary-container text-on-primary-container";

  return (
    <article className="group relative flex flex-col gap-sm">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-container">
        <Image
          src={product.primaryImage.src}
          alt={product.primaryImage.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-opacity duration-300 group-hover:opacity-0"
        />
        <Image
          src={product.hoverImage.src}
          alt={product.hoverImage.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <button
          type="button"
          aria-label={`Save ${product.name} to favorites`}
          className="absolute top-md right-md material-symbols-outlined text-primary bg-white/80 p-xs rounded-full hover:bg-white transition-all"
        >
          favorite
        </button>

        {product.badge && (
          <span
            className={`absolute top-md left-md ${badgeClass} px-sm py-1 rounded-full text-label-caps font-label-caps`}
          >
            {product.badge.label}
          </span>
        )}

        <button
          type="button"
          className="absolute bottom-md left-md right-md bg-primary text-white py-sm rounded-lg font-label-caps text-label-caps tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
        >
          QUICK ADD
        </button>
      </div>

      <div className="flex flex-col pt-xs">
        <div className="flex justify-between items-start gap-sm">
          <h3 className="font-body-md text-body-md font-semibold text-primary">
            {product.name}
          </h3>
          <span className="font-body-md text-body-md font-bold whitespace-nowrap">
            {product.price}
          </span>
        </div>
        <p className="text-body-sm text-on-surface-variant">
          {product.subtitle}
        </p>
        <div className="flex flex-wrap gap-xs mt-sm">
          {product.lengths.map((length) => (
            <span
              key={length}
              className="px-2 py-0.5 border border-outline-variant rounded-full text-[10px] font-bold"
            >
              {length}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-xl px-lg pb-2xl">
      {PRODUCTS.map((product) => (
        <ProductCard key={product.name} product={product} />
      ))}
    </section>
  );
}
