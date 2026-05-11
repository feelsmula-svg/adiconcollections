import Image from "next/image";

interface Category {
  label: string;
  image: string;
  alt: string;
}

const CATEGORIES: Category[] = [
  {
    label: "Shop Wigs",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCbcvueS78W_fMyh6E5s86gB8JRqyvRgmHe0FM6-J-gM3rLtPoZoedrXdo1c0TcJip_LM2ebRQWj8K2NojdQBTx5suI4ojUKOO4SoZpwwjIbQHiR4nesKMcTBlywTUWGo9SSXyCFeX14yf7hZ02Vs60qallHmqsUK_BKiN4-w-EGz8MvzYMsVWIiWpHx6ZUIEZ3errHrVr44c4aRvnGh14xiB1V0TTVjko9eBV1Zbzc0D7wWduDoV4imIY4XWeUwtuJLeBmocLHcl8",
    alt: "Sleek straight wig styled on a glowing studio backdrop",
  },
  {
    label: "Shop Bundles",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtSz9sVmkiklMnJZ0bbslw4sFJHSH_xPaxjxBKNZ8n_1x4D-zQ5nB289tJnX6JsbyDadxFciKJ7wKpy6iEvOfz9NEZMFJKE1apZMa5t2kFh7mgQNqI5vVXPbOHFWee486LWAMSjNX1ETvve2Dedyrij6-v1QuVogysIr8XykPAx8XoCQ3lN54WB6zv3U4hpL8Z4JkY4LrnZifKE7sk2Cc9vIGJo7np-xeW36fzPfdIIV-r6FL-MsLAx81NHooIJJwlwTxgphc-gZ0",
    alt: "Body wave hair bundles fanned out on cream linen",
  },
  {
    label: "Frontals & Closures",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC3Leb5F_nnwTuHRsVTyEsFV24WI1-mUGec08bQYnQwue0JlNZVvShyxvW0ImaWHZVQ7uGyXSowKsAndZy5efIjXB7UW4bgak-2cIkWcxSRB-RjGqn32FXHugLnUDm5o6rRLdBmX8IoIWtJ_s2Qgila916eOfgbIHm583gYRcqdtZChtJHQmXhC9LHMpod_T_UhodPy5LnRPWy5hI_JdrRKEyTIXLbi9M17SmJznAtFVm0TMoAueZLTNsyLEUeYzG_ZZPDhgk-DZ14",
    alt: "Lace frontal piece displayed with curly raw hair texture",
  },
  {
    label: "Accessories",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAjCQu0QPNAkFBb1tA9xI77q1acxkB6nzpKS1Dy-19RGYNfQa5Ggwj4TlL-RCj0X6my1mbF22E72w47K9wMVXu1ns5kYOl0OQsMPxC8LD4uP2vVAxN4kACIe5OxfhmATB6fvOgYjIUyn28apZO9bPUstdQufqCZwCo5HQ-UyFCwmSqo1BOh8aQbyHptQzVKskbKtjgPEZXIMtnPu0bfuzo7SdxDVV_cS2LPCHJTj9_QL6DDsxybb2fJ0P46rfMVBTQNnlqPVAgt_7c",
    alt: "Curated set of styling accessories for AdiCon hair",
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
          <a
            key={category.label}
            href="#"
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
          </a>
        ))}
      </div>
    </section>
  );
}
