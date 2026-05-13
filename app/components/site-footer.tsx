import { PaymentLogos } from "@/app/components/ui";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: "SHOP",
    links: [
      { label: "Bestsellers", href: "#" },
      { label: "Sale", href: "#" },
      { label: "Wigs", href: "#" },
      { label: "Hair Extensions", href: "#" },
    ],
  },
  {
    title: "INFORMATION",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Refund Policy", href: "#" },
      { label: "Shipping Policy", href: "#" },
      { label: "Terms & Conditions", href: "#" },
    ],
  },
];

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="w-5 h-5"
    >
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.42 2.23.05 1.27.07 1.65.07 4.85s-.02 3.58-.07 4.85c-.06 1.17-.26 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.42-1.27.05-1.65.07-4.85.07s-3.58-.02-4.85-.07c-1.17-.06-1.8-.26-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.43-.37-1.06-.42-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.17 1.06-.37 2.23-.42 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.86 5.86 0 0 0 1.38 2.13c.67.67 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.13-1.38 5.86 5.86 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91A5.86 5.86 0 0 0 21.99 2.01 5.86 5.86 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="w-5 h-5"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
    </svg>
  );
}

function FooterLinkList({ links }: { links: FooterLink[] }) {
  return (
    <ul className="space-y-sm font-body-sm opacity-60">
      {links.map((link) => (
        <li key={link.label}>
          <a href={link.href} className="hover:opacity-100 transition-opacity">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function FooterColumnBlock({ column }: { column: FooterColumn }) {
  return (
    <>
      <details className="md:hidden footer-accordion border-b border-white/10 group">
        <summary className="flex justify-between items-center py-md cursor-pointer list-none select-none">
          <h5 className="font-label-caps tracking-widest text-sm">
            {column.title}
          </h5>
          <span
            className="material-symbols-outlined text-[20px] transition-transform group-open:rotate-45"
            aria-hidden
          >
            add
          </span>
        </summary>
        <div className="pb-md">
          <FooterLinkList links={column.links} />
        </div>
      </details>

      <div className="hidden md:block space-y-lg">
        <h5 className="font-label-caps tracking-widest text-sm">
          {column.title}
        </h5>
        <FooterLinkList links={column.links} />
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-section pb-xl px-lg">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-3xl md:gap-y-0 border-b border-white/10 pb-xl md:pb-3xl mb-xl">
          {COLUMNS.map((column) => (
            <FooterColumnBlock key={column.title} column={column} />
          ))}

          <div className="md:col-span-2 space-y-lg pt-lg md:pt-0">
            <h5 className="font-label-caps tracking-widest text-sm">
              NEWSLETTER SIGN UP
            </h5>
            <p className="font-body-sm opacity-60">
              Sign up for exclusive updates, new arrivals &amp; insider only
              discounts
            </p>
            <form className="flex gap-sm h-12" action="#" method="post">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                placeholder="enter your email address"
                className="bg-transparent border border-white/20 px-md flex-1 focus:outline-none focus:border-white transition-colors text-sm"
              />
              <button
                type="submit"
                className="bg-white text-black px-xl font-label-caps text-xs tracking-widest hover:bg-surface-container-highest transition-colors"
              >
                SUBMIT
              </button>
            </form>
            <div className="flex gap-md pt-sm">
              <a
                href="#"
                aria-label="Follow on Instagram"
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <InstagramIcon />
              </a>
              <a
                href="#"
                aria-label="Follow on TikTok"
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <TikTokIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="text-center font-body-sm opacity-60 mb-xl">
          © {new Date().getFullYear()} AdiCon Collections. All Rights Reserved.
          Premium hair for the modern woman.
        </div>

        <PaymentLogos />
      </div>
    </footer>
  );
}
