import Image from "next/image";

interface Product {
  name: string;
  price: string;
  caption: string;
  image: { src: string; alt: string };
}

const PRODUCTS: Product[] = [
  {
    name: 'Silky Straight (16" Blunt Cut)',
    price: "₦998,900.00",
    caption: "More Sizes Available",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJIrDCbKHj1lNWjlz2XTnjJTDqVrUvoJ0NP60Nk1aOVjZ55br3avfOpNxc5hUEKJM_JCMjUWu0FDDYKlEsx_hKbfrFN6ClMQKeUZKR6sNgmsMbB7F0jLMJoZxDzRzcHOA5ZPsSiQ1Tl3BALH-3U0ZMo9VBZXGnWcKRAEZd4vFFGQkjtPA7-_QVP8XXD8MfniWKE6pYGGREAPpMfqivuBQ6qhaGd8oN7IoUNBsmgT4185cMERKmpDkVJKTIPd2XJr0Aqmmb3yL6aAU",
      alt: "Model wearing 16-inch silky straight blunt cut wig",
    },
  },
  {
    name: 'Silky Straight (16" Bangs)',
    price: "₦998,900.00",
    caption: "More Sizes Available",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8MvGfPv9xmu9tAGtOvdT7NDETHebZqs-VE1CDD_Pi87dlnRtntIko4HW3RmudRFc3MB86tKNRLdPqvZwGIXastCeTu-kq5jzKFxLxaDfFg5BfUTMTyYjg_aUfWGyYMW2QaSqc_9uhO5b5-zvS9_NVFUacOEMoj4Tb2U9pgT_ApiIJ__bO7QkazrjgfuIFrfLK7SZEmgky8rs47jjo5rTDZ924tRv-oRGmlI_Ip8csxTQAT1XXoRT2CVhtBa78GGqgnRfZRNJHFjs",
      alt: "Model wearing 16-inch silky straight wig with bangs",
    },
  },
  {
    name: 'Silky Straight 22"',
    price: "₦1,569,600.00",
    caption: "More Sizes Available",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFX-9OmhJh4SRCnSkpCosnj2Iqrldwchm4acYjj5p1cAVj3uRnxLDhFh9ImRSaMTii3LwPKe-MFNT7NzveZ0SN1xzBackXquYvL_YkNm0K3t7wxGccYMleM6mJzB3Fun6a5jRJrYE0x29FFO1KwechrwThyn4TLPOmplts8ypZyhhByhDKd7tn2koxTofEH9iOHWL93nNBL5hBRK98cDsnQ-IgDVFD4zrXl3NfT5Xk5h9-Oguy9Hn7mbQ-fOAiLJxSzZVNfnZFlls",
      alt: "Model wearing 22-inch silky straight long hair",
    },
  },
  {
    name: 'Silky Straight (18")',
    price: "₦1,270,000.00",
    caption: "More Sizes Available",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaEcUE5_Bnx1dHCRDPZvNmDKJTm2IrsNEjosQwGA6B7sed7xiIHI7gkb0Atwn4ObqE14qHekQjAAfLwjFfocjQemWW0CkM9cMIUeTvXeABjxLpqpsu_FxWwShkyuSDxX0la3vDU5qWln6B3Di9t-DEnUsD1FSFaFyZ5199v2GZtWhLr3_eQXJoCHLy_ZJUmU-g4VJu7u-xdi43PBvJ6S_YY0mQqYVVp2gpP8iZbEMI5K4qfcAk6ZxB8md8Yqcmn7kqTw3G-peRvfU",
      alt: "Model wearing 18-inch silky straight hair",
    },
  },
  {
    name: 'Body Wave (20")',
    price: "₦1,189,000.00",
    caption: "More Sizes Available",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-ptJMAbyOUw-frvgvp43yrgy1e5uPHM3tuxdtwor_Km0M8mctKhjFRvCULC5qAf5mrywm5z4PN0d_1n6DCWVLkpBJnyqMB6sHR_tTaBOI5rYjGr9AruLYK4UlAbtDEsx1JZgecD8n39ailqQxHpJixfZ4oHXsJvyQXhdcZBbhOdR7JP20zaFivIUu4ncbhbrllKNhociMPlzxqx2JKWWcbFfBKrw5uygsJzDZO8xUUGhxt7C2KXKh_w43e0G0uqoCaYmzW94Tgz0",
      alt: "Sleek body wave extensions in deep charcoal with subtle highlights",
    },
  },
  {
    name: 'Deep Wave (18")',
    price: "₦1,098,500.00",
    caption: "More Sizes Available",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-tF7aSUlnITWgSgQpc2ZacZWfGy8-tCDYt02VB2dOkR1jZRc7QgVPc7OLUS9naEB3y2bJ8n0RuzsncmQYhkYli8lmmDr2v7ZFTEIKqxPaUi-dR9SWaHeV9iKIq2jzHunwxbiJbHgdUOLsabeO2ZFER_2s-ya-WKYUiW_qIn1fZyoBUKLAoBNxcLRhnS69sr-IwM2Yy_2TSNQtC10QWhY3SWr99Qt7NOqofGxOZ9FXoEbISpzzq9JTYVebAD6rFbRhNrbJTtWRn1M",
      alt: "Glossy deep wave extensions with tight curls in espresso brown",
    },
  },
  {
    name: 'Kinky Curly (22")',
    price: "₦1,489,000.00",
    caption: "More Sizes Available",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCW8qxAiw1Blo25WfDtBiSmW40ZEg_wBz81lH53LtvyIyUZxS5I4BJsoisMrHuXyybeCSFNFeuZKOIQ9E02Bm14LUyOXzlErt9sepr8jpPNEGY_OlZtfQWqW7rMBUf7_kfG5j_8rRaMqcZleHoVgje5SlZnRLJieZJGtaR0EsJq5cG8Q3wWEM9--sEbCF41G7l__aW0WcdtmLcVVRzqjnw6GCBVeX_hm_tiTscu8dORpbxnkUTQjjRr45CQnEDVXIb4KusHeJ5h5qU",
      alt: "Kinky curly hair bundles with dense springy coils",
    },
  },
  {
    name: 'Curly Bob (14")',
    price: "₦749,000.00",
    caption: "More Sizes Available",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuB9dYzY4AO4KZujjYTTIpNOvBzZC6j9hpbczqopGNlYWUbOwqcisUjc5Ow64CfVzgsud-0RFXq0LlkJQWMlMAohVVctHhev1evcesiec4_17qz4b6y29Hz02Mvw3lAN_9NwU7mGOtx_TdAITwDS3OE-AOYAsjTe7K7qGlbrpqR9neIactbAYGRAk3Y5sQy0BMChGLsHEGLPfAa5jbI4a-6smv1uIkfyZtp7X5LRL5CZB6lUsWJpc1r8ye-ZYFmBpco9OAYtvmqhg",
      alt: "Side-lit artistic portrait of curly hair extensions in a chic bob",
    },
  },
];

const TEXTURES = ["STRAIGHT", "CURLY", "WAVES", "BANGS"];

function ProductCard({ product }: { product: Product }) {
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
        <div className="absolute bottom-0 left-0 right-0 p-md">
          <button
            type="button"
            className="w-full bg-white text-black py-3 font-label-caps text-xs tracking-widest shadow-lg hover:bg-surface-container-highest transition-colors"
          >
            QUICK ADD
          </button>
        </div>
        <button
          type="button"
          aria-label={`Save ${product.name} to wishlist`}
          className="absolute top-md right-md bg-white/80 p-2 rounded-full material-symbols-outlined text-[18px]"
        >
          favorite
        </button>
      </div>
      <div className="text-center space-y-1">
        <h3 className="font-body-md text-sm text-on-surface-variant uppercase tracking-wide">
          {product.name}
        </h3>
        <p className="font-bold text-primary">{product.price}</p>
        <p className="text-[10px] text-outline tracking-widest uppercase">
          {product.caption}
        </p>
      </div>
    </article>
  );
}

export function ProductGrid() {
  return (
    <section className="px-lg mb-section">
      <div className="text-center mb-xl">
        <h2 className="font-display-lg text-headline-sm uppercase tracking-widest mb-md">
          Choose Your Style
        </h2>
        <div className="flex justify-center items-center gap-md font-label-caps text-xs text-on-surface-variant">
          {TEXTURES.map((texture, index) => (
            <span key={texture} className="flex items-center gap-md">
              {index > 0 && (
                <span className="text-outline-variant" aria-hidden>
                  |
                </span>
              )}
              <button
                type="button"
                className={
                  index === 0
                    ? "border-b-2 border-primary text-primary pb-1"
                    : "hover:text-primary transition-colors"
                }
              >
                {texture}
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-xl">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </div>
    </section>
  );
}
