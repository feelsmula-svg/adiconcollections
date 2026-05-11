import Image from "next/image";

const SELFIE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBbRqW3m33mMNEsgsRrayUDFDDKwRJ2CUF1p4zMlZp3dnJIC8__HQHFJqOfACU5UdTVNs0Q-x6KBEYQIdck81VuI-2vSSJpq-C6hYJi_P9UPYkLuPjjww4ld6WORXzqB-1HcJqx3YbUlpZuBJuaDVi83KWThPxaQaboUSt1pN0RIRx4NohDpb98EtuEkMCY9PeBz4_il-Pekj-FDNvC58ZN5iZLL77OXGwDq36bs5FxvBgf4RwgwWKYDcFQrKX6vUzDsbseBuhk-2Q";

export function BundleDeals() {
  return (
    <section className="w-full bg-black py-xl mb-section overflow-hidden">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-xl px-lg">
        <div className="text-white space-y-2 text-center md:text-left">
          <h2 className="font-display-lg text-[40px] leading-tight uppercase tracking-widest">
            We <span className="text-primary-fixed-dim">♥</span> Selfies
          </h2>
          <p className="font-label-caps text-sm tracking-widest opacity-80">
            TAG US IN YOUR PHOTOS @ADICON_COLLECTIONS
          </p>
        </div>
        <div className="flex-1 max-w-[28rem] w-full">
          <div className="relative w-full aspect-[4/3]">
            <Image
              src={SELFIE_IMAGE}
              alt="Customer selfie wearing AdiCon Collections hair"
              fill
              sizes="(max-width: 768px) 100vw, 28rem"
              className="object-cover opacity-80 grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
