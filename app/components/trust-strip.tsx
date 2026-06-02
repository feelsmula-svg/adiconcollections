interface PromoItem {
  icon: string;
  label: string;
}

const ITEMS: PromoItem[] = [
  { icon: "local_fire_department", label: "SHOP NOW PAY LATER" },
  { icon: "local_fire_department", label: "WE ACCEPT SHOPPAY INSTALLMENTS" },
  { icon: "local_fire_department", label: "100% VIRGIN RAW HAIR" },
  { icon: "local_fire_department", label: "WORLDWIDE SHIPPING" },
];

function PromoRow({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-2xl pr-2xl font-label-caps text-xs tracking-[0.25em] text-white"
    >
      {ITEMS.map((item, index) => (
        <li
          key={`${item.label}-${index}`}
          className="flex items-center gap-md whitespace-nowrap"
        >
          <span
            className="material-symbols-outlined filled text-[18px] text-white/70"
            aria-hidden
          >
            {item.icon}
          </span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function TrustStrip() {
  return (
    <section
      aria-label="Brand promises"
      className="w-full bg-black py-md mb-section overflow-hidden"
    >
      <div className="flex animate-marquee gap-2xl">
        <PromoRow />
        <PromoRow ariaHidden />
      </div>
    </section>
  );
}
