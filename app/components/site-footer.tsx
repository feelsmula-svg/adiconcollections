interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: "INFORMATION",
    links: [
      { label: "Sustainability", href: "#" },
      { label: "Shipping & Returns", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
  {
    title: "COMMUNITY",
    links: [
      { label: "Wholesale Program", href: "#" },
      { label: "Affiliate Program", href: "#" },
      { label: "Stylist Directory", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-surface-container-highest w-full mt-3xl">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center py-3xl px-lg">
        <div className="font-headline-sm text-headline-sm text-primary mb-xl">
          AdiCon Collections
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 w-full gap-xl mb-3xl">
          <div className="space-y-md">
            <h3 className="font-label-caps text-label-caps text-primary">
              CONTACT
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              Lagos, Nigeria
            </p>
            <p className="text-body-sm text-on-surface-variant">
              +234 812 345 6789
            </p>
            <p className="text-body-sm text-on-surface-variant">
              WhatsApp: +234 901 234 5678
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="space-y-md">
              <h3 className="font-label-caps text-label-caps text-primary">
                {col.title}
              </h3>
              <ul className="space-y-xs">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-md">
            <h3 className="font-label-caps text-label-caps text-primary">
              NEWSLETTER
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-md">
              Join the list for exclusive drops and care tips.
            </p>
            <form className="flex" action="#" method="post">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                placeholder="Email Address"
                className="bg-surface-container border border-outline-variant px-md py-sm flex-1 focus:outline-none focus:border-primary text-body-sm rounded-l-lg"
              />
              <button
                type="submit"
                className="bg-primary text-white px-md py-sm font-label-caps text-label-caps rounded-r-lg"
              >
                JOIN
              </button>
            </form>
          </div>
        </div>

        <div className="flex items-center gap-md mb-xl text-on-surface-variant">
          <span className="material-symbols-outlined">payments</span>
          <span className="material-symbols-outlined">credit_card</span>
          <span className="material-symbols-outlined">account_balance</span>
        </div>

        <div className="text-body-sm text-on-surface-variant text-center border-t border-outline-variant pt-xl w-full">
          © {new Date().getFullYear()} AdiCon Collections. All rights reserved.
          Premium hair for the modern woman.
        </div>
      </div>
    </footer>
  );
}
