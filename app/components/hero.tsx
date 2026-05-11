import Image from "next/image";

const MODEL_LEFT =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBJIrDCbKHj1lNWjlz2XTnjJTDqVrUvoJ0NP60Nk1aOVjZ55br3avfOpNxc5hUEKJM_JCMjUWu0FDDYKlEsx_hKbfrFN6ClMQKeUZKR6sNgmsMbB7F0jLMJoZxDzRzcHOA5ZPsSiQ1Tl3BALH-3U0ZMo9VBZXGnWcKRAEZd4vFFGQkjtPA7-_QVP8XXD8MfniWKE6pYGGREAPpMfqivuBQ6qhaGd8oN7IoUNBsmgT4185cMERKmpDkVJKTIPd2XJr0Aqmmb3yL6aAU";

const MODEL_RIGHT =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBFX-9OmhJh4SRCnSkpCosnj2Iqrldwchm4acYjj5p1cAVj3uRnxLDhFh9ImRSaMTii3LwPKe-MFNT7NzveZ0SN1xzBackXquYvL_YkNm0K3t7wxGccYMleM6mJzB3Fun6a5jRJrYE0x29FFO1KwechrwThyn4TLPOmplts8ypZyhhByhDKd7tn2koxTofEH9iOHWL93nNBL5hBRK98cDsnQ-IgDVFD4zrXl3NfT5Xk5h9-Oguy9Hn7mbQ-fOAiLJxSzZVNfnZFlls";

export function Hero() {
  return (
    <section
      aria-label="Adicon Collections — Luxury Wigs & Hair Extensions"
      className="relative w-full overflow-hidden bg-[#c4a47a]"
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
      <div className="relative grid grid-cols-2 h-[78vh] min-h-[520px] max-h-[820px]">
        <div className="relative">
          <Image
            src={MODEL_LEFT}
            alt="Model wearing a 16-inch silky straight blunt cut wig from the luxury collection"
            fill
            priority
            sizes="50vw"
            className="object-cover object-[center_top]"
          />
        </div>
        <div className="relative">
          <Image
            src={MODEL_RIGHT}
            alt="Model wearing 22-inch silky straight long hair from the luxury collection"
            fill
            priority
            sizes="50vw"
            className="object-cover object-[center_top] scale-x-[-1]"
          />
        </div>

        {/* Soft side fades so the figures dissolve into the tan background */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#c4a47a] via-[#c4a47a]/40 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#c4a47a] via-[#c4a47a]/40 to-transparent"
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

          <button
            type="button"
            className="block w-full bg-white text-black mt-sm py-md md:py-lg font-label-caps tracking-[0.3em] text-xs md:text-sm uppercase hover:bg-primary-fixed transition-colors duration-300"
          >
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
}
