const ITEMS = [
  { icon: "verified_user", label: "100% VIRGIN HAIR" },
  { icon: "local_shipping", label: "FREE DELIVERY" },
  { icon: "assignment_return", label: "30-DAY RETURNS" },
  { icon: "verified", label: "VERIFIED VENDOR" },
];

export function TrustStrip() {
  return (
    <section className="w-full bg-surface-container-low my-xl">
      <ul className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-around gap-md px-lg py-md">
        {ITEMS.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-xs font-label-caps text-label-caps text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px]">
              {item.icon}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
