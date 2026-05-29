import Image from "next/image";
import heroModel from "../../public/hero.jpeg";

const SELFIE_IMAGE = heroModel;

export function BundleDeals() {
  return (
    <section className="w-full bg-black py-lg md:py-xl mb-section overflow-hidden">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-lg md:gap-xl px-lg">
        <div className="text-white space-y-2 text-center md:text-left">
          <h2 className="font-display-lg text-[24px] sm:text-[32px] md:text-[40px] leading-tight uppercase tracking-widest">
            We <span className="text-primary-fixed-dim">♥</span> Selfies
          </h2>
          <p className="font-label-caps text-[11px] sm:text-sm tracking-widest opacity-80">
            TAG US IN YOUR PHOTOS @ADICON_COLLECTIONS
          </p>
        </div>
        <div className="flex-1 max-w-[20rem] md:max-w-[28rem] w-full">
          <div className="relative w-full aspect-[3/4] md:aspect-[4/3]">
            <Image
              src={SELFIE_IMAGE}
              alt="Customer selfie wearing AdiCon Collections hair"
              fill
              sizes="(max-width: 768px) 100vw, 28rem"
              className="object-cover object-center opacity-80 grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
