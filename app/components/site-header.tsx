const NAV = [
  { label: "New Arrivals", href: "#new-arrivals", active: true },
  { label: "Hair Care", href: "#hair-care" },
  { label: "Styling", href: "#styling" },
  { label: "Bundles", href: "#bundles" },
];

export function SiteHeader() {
  return (
    <header className="w-full sticky top-0 z-50 bg-surface">
      <nav className="flex justify-between items-center px-lg py-md max-w-[1200px] mx-auto">
        <a
          href="#"
          className="font-display-lg text-xl sm:text-2xl md:text-[28px] text-primary leading-none whitespace-nowrap"
        >
          AdiCon Collections
        </a>

        <div className="hidden md:flex items-center gap-xl">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={
                item.active
                  ? "text-primary font-bold border-b-2 border-primary pb-1"
                  : "text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors duration-200"
              }
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-md">
          <button
            type="button"
            aria-label="Search"
            className="material-symbols-outlined text-primary hover:scale-110 transition-transform"
          >
            search
          </button>
          <button
            type="button"
            aria-label="Open bag"
            className="material-symbols-outlined text-primary hover:scale-110 transition-transform"
          >
            shopping_bag
          </button>
          <button
            type="button"
            aria-label="Account"
            className="material-symbols-outlined text-primary hover:scale-110 transition-transform"
          >
            person
          </button>
        </div>
      </nav>
    </header>
  );
}
