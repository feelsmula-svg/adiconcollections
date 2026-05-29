import Image from "next/image";
import { LinkButton } from "@/app/components/ui";
import heroModel from "../../public/hero.jpeg";

const HERO_MODEL = heroModel;

export function Hero() {
  return (
    <section
      aria-label="Adicon Collections — Luxury Wigs & Hair Extensions"
      className="relative w-full overflow-hidden bg-[#d6d2e6]"
    >
      {/* Faint brand monogram watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="font-display-xl uppercase tracking-tighter text-white/10 text-[18vw] leading-none whitespace-nowrap select-none">
          Adicon · Adicon
        </span>
      </div>

      {/* Two model figures — full bleed, mirrored */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 h-[78vh] min-h-[520px] max-h-[820px]">
        <div className="relative">
          <Image
            src={HERO_MODEL}
            alt="Model wearing a silky straight wig from the luxury collection"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center md:object-[center_top]"
          />
        </div>
        <div className="relative hidden md:block">
          <Image
            src={HERO_MODEL}
            alt="Model wearing a silky straight wig from the luxury collection"
            fill
            priority
            sizes="50vw"
            className="object-cover object-[center_top] scale-x-[-1]"
          />
        </div>

        {/* Soft side fades so the figures dissolve into the tan background */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#d6d2e6] via-[#d6d2e6]/40 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#d6d2e6] via-[#d6d2e6]/40 to-transparent"
        />
      </div>

      {/* Centered title card + CTA */}
      <div className="absolute inset-0 flex items-center justify-center px-lg">
        <div className="w-full max-w-[560px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative overflow-hidden bg-black text-white px-xl py-2xl md:px-2xl md:py-3xl text-center">
            {/* Giant ampersand watermark */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center font-editorial-italic italic text-white/[0.06] text-[22rem] leading-none select-none"
            >
              &amp;
            </span>

            <h1 className="relative font-display-xl uppercase tracking-tight leading-[0.95] text-3xl sm:text-4xl md:text-5xl">
              <span className="block">Luxury Wigs</span>
              <span
                aria-hidden
                className="block font-editorial-italic italic text-white/40 text-2xl md:text-3xl my-1"
              >
                &amp;
              </span>
              <span className="block">Hair Extensions</span>
            </h1>
          </div>

          <LinkButton
            href="/shop"
            variant="inverse"
            size="md"
            fullWidth
            className="mt-sm py-md md:py-lg text-xs md:text-sm tracking-[0.3em]"
          >
            Shop Now
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
