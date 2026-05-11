import Image from "next/image";

interface Bundle {
  name: string;
  fromPrice: string;
  saving: string;
  image: { src: string; alt: string };
}

const BUNDLES: Bundle[] = [
  {
    name: "3 Bundles + Closure",
    fromPrice: "From ₦120,000",
    saving: "SAVE 15%",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJO8OBvLd3ELBjaZ6AlGSPT4qfdk4dzhmvs61QjtOcGBdjAEPJ6jO33vzRZcYd6ueK-19TK005YAghxVb7ozwAL6fXKl7HPLCP6qBdKwuqlYxLHpbjxIBCtha9h4R8j1-JRyjwT8_scCFnF3dRHKOj5Z4KdQ5IcnLml7fvoJ_1qZWHQDkfLlDYwUltY5hZcXLAfN-gN8VV_OOY1DbHsQND6iYJiP4SSRbIK0Xaqbuk6l0so_mRkxCvYln9tl5vAJqfewjlhdMx3b0",
      alt: "Three straight hair bundles with a matching lace closure on white silk",
    },
  },
  {
    name: "The Ultimate Deep Wave Set",
    fromPrice: "From ₦145,000",
    saving: "SAVE 20%",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEqKRTxRXQGhs3lpgrauiILM28HLOxsXNtesISnzIHmzOxnht-31pveJLapCjVZMXZqRMgM5wshGkQYmlpPWWDBRMwRElr-IQ4gxHk8yWu2UZQD2sqY2A1Geb704ugdq7GDFD41pwryStZR0-jKIsI1RXooyNYWV2queXerIB3H6Bot9gx_BKWZBPMyKVxxSNLcib0LNnEpMY7p46LQHNUI9T_axN6CfYdI2tq8TYK57OR_6zn2p3jSURJrY55zpf9ierIted61zg",
      alt: "Four full-volume deep wave hair wefts laid flat on a cream surface",
    },
  },
  {
    name: "Blown-Out Luxe Set",
    fromPrice: "From ₦130,000",
    saving: "SAVE 10%",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8Uv6tNINQWMvJj6VSJIkNhRnr7G_3F-TtQJIMpmKxHq7RGnGmvSR8eApuDQ_dW1LGeMHz9c-cfTKuZbqyiDGIGH7mxtWtEi7wYhnb0vSRvRvCnpDgvWQ9GhSMMkxRreGBv0k9VJa0IS-x5MMChaYqzPw4dIzOW-MuRe4yLyQzHDBoxTzey_dIXtC8U6VkGx9lbZH_69AfVvwMC9Pt6AXTbY0T4DcpGaAwCupFjFdJRa8uIme9uOb4kMVujx1S5kmHdizxYo1C9Ig",
      alt: "Three kinky straight bundles in a premium mahogany presentation box",
    },
  },
];

export function BundleDeals() {
  return (
    <section className="bg-surface-container-high py-xl px-lg mx-lg mb-3xl rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between mb-lg flex-wrap gap-sm">
        <h2 className="font-headline-md text-headline-md text-primary">
          Bundle Deals &amp; Savings
        </h2>
        <a
          href="#bundles"
          className="font-label-caps text-label-caps text-primary border-b border-primary"
        >
          VIEW ALL BUNDLES
        </a>
      </div>
      <div className="flex gap-xl overflow-x-auto hide-scrollbar pb-md">
        {BUNDLES.map((bundle) => (
          <article
            key={bundle.name}
            className="min-w-[300px] bg-white p-md rounded-xl shadow-sm border border-outline-variant flex gap-md"
          >
            <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
              <Image
                src={bundle.image.src}
                alt={bundle.image.alt}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary-container">
                {bundle.saving}
              </span>
              <h3 className="font-body-md text-body-md font-semibold text-primary">
                {bundle.name}
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                {bundle.fromPrice}
              </p>
              <button
                type="button"
                className="mt-sm text-label-caps font-label-caps text-primary underline"
              >
                SHOP BUNDLE
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
