interface NavItem {
  label: string;
  href: string;
  emphasis?: "sale";
}

const NAV: NavItem[] = [
  { label: "Home", href: "#" },
  { label: "Shop All", href: "#" },
  { label: "Wigs", href: "#" },
  { label: "Bundles", href: "#" },
  { label: "Frontals & Closures", href: "#" },
  { label: "Accessories", href: "#" },
  { label: "Sale", href: "#", emphasis: "sale" },
  { label: "Contact", href: "#" },
];

function NavLinks({ className }: { className?: string }) {
  return (
    <nav
      className={`flex items-center font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase ${className ?? ""}`}
    >
      {NAV.map((item) =>
        item.emphasis === "sale" ? (
          <a
            key={item.label}
            href={item.href}
            className="text-error hover:opacity-80 transition-opacity"
          >
            {item.label}
          </a>
        ) : (
          <a
            key={item.label}
            href={item.href}
            className="hover:text-primary transition-colors border-b border-transparent hover:border-primary"
          >
            {item.label}
          </a>
        ),
      )}
    </nav>
  );
}

export function SiteHeader() {
  return (
    <>
      <div className="bg-on-surface text-white py-2 text-center text-[11px] font-label-caps tracking-widest px-lg">
        FREE WORLDWIDE SHIPPING ON ORDERS OVER ₦500,000 · SHOP NOW PAY LATER
      </div>

      <div className="bg-surface border-b border-outline-variant py-2 px-lg hidden md:block">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center text-xs font-label-caps">
          <div className="flex gap-md text-on-surface-variant">
            <span>🇳🇬 EN</span>
            <span>Customer Service +234 (0) 812 345 6789</span>
          </div>
          <div className="flex items-center gap-lg text-on-surface">
            <label className="relative flex items-center border-b border-outline w-48">
              <span className="sr-only">Search</span>
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent border-none focus:ring-0 w-full p-0 text-xs py-1 outline-none"
              />
              <span className="material-symbols-outlined text-sm" aria-hidden>
                search
              </span>
            </label>
            <button
              type="button"
              aria-label="Wishlist"
              className="material-symbols-outlined text-[20px] hover:text-primary transition-colors"
            >
              favorite
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="Shopping bag (1 item)"
                className="material-symbols-outlined text-[20px] hover:text-primary transition-colors"
              >
                shopping_bag
              </button>
              <span
                aria-hidden
                className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center"
              >
                1
              </span>
            </div>
          </div>
        </div>
      </div>

      <header className="w-full sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-[1400px] mx-auto px-lg">
          <div className="md:hidden grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-md py-md">
            <button
              type="button"
              aria-label="Open menu"
              className="material-symbols-outlined text-[24px] text-on-surface"
            >
              menu
            </button>
            <button
              type="button"
              aria-label="Search"
              className="material-symbols-outlined text-[22px] text-on-surface"
            >
              search
            </button>
            <a
              href="#"
              className="font-display-xl text-primary text-lg uppercase tracking-widest text-center whitespace-nowrap"
            >
              AdiCon
            </a>
            <button
              type="button"
              aria-label="Account"
              className="material-symbols-outlined text-[22px] text-on-surface"
            >
              person
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="Shopping bag (1 item)"
                className="material-symbols-outlined text-[22px] text-on-surface"
              >
                shopping_bag
              </button>
              <span
                aria-hidden
                className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center"
              >
                1
              </span>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center py-md gap-md">
            <a
              href="#"
              className="font-display-xl text-primary text-[28px] lg:text-[32px] uppercase tracking-[0.2em] whitespace-nowrap"
            >
              AdiCon Collections
            </a>
            <NavLinks className="flex-wrap justify-center gap-x-lg gap-y-sm" />
          </div>
        </div>
      </header>
    </>
  );
}
