import Image from "next/image";

interface Review {
  quote: string;
  attribution: string;
  avatar: { src: string; alt: string };
}

const REVIEWS: Review[] = [
  {
    quote:
      "The luster is unmatched. I've had my bundles for over two years and they still feel like day one. Truly a worthy investment.",
    attribution: "— CHIDIMMA A., LAGOS",
    avatar: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCa3c8CxhdSV8btZR26VXBR5YlfCRLycoEZFnEeneqyTWF20fhWf0M1mIjhsaa1VRqPEN33OcPsBAYyrWKzFEzkTiIkvsUnmMjghmIh37jiz-tkp9jKfP_qy0bA9R6gT2PvwlNX4tXic1LJLLNRjcuGV-ALN8PBt5sIo8-7UdZeRtRiOy8zU-aZr2hfQxQ1qlOZHBI8Q1ak27g3TM4_ppbUhcVpLYvid4RQbZOc1bPUd_gEb1DsyL6tvW9Wy9QmTb68iykFV-1qW9c",
      alt: "Portrait of Chidimma A., a Lagos customer wearing premium straight extensions",
    },
  },
  {
    quote:
      "AdiCon is my only source now. The delivery to Abuja was fast and the hair is so thick from top to bottom. No shedding!",
    attribution: "— SARAH O., ABUJA",
    avatar: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvRbS_IYAt1mV1rcXY1bnraeVwfgFpk6N7mfop4Ql_dyVKDcyYLVuwrE0t2cE1QKSXUw62qlx3XZvRFCulymqINfVRZPUL4moG_xBBLtimK0a9sQ2d4xZ7XJq9as1JEOclhPL8gQy0xz2l_wdqMUl9yF6nZ6MeLqlp_j_LCYDTyz7xaFypPeSTVSlKJeQx4su8rjB9KwVBf_lBzxtn7XC_hEzputPp0KdgQYfaYsnIEMUXFG3poEBIAbWf6tjinyaBArBw1dSyYXQ",
      alt: "Portrait of Sarah O., an Abuja customer styled with deep wave hair",
    },
  },
  {
    quote:
      "I love how natural the kinky straight texture looks. I blend it with my hair and everyone thinks it's mine. Best quality hair in Lagos.",
    attribution: "— TITI L., LEKKI",
    avatar: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHS_1nwCb9Yw4M7IfYH3TLZ3WrKWwSKb1lj-Fjax_UtkE9R2oPuOcRXhjJXmvynE4TLZT2tBsa5cbUCFvNoTiUcLigGpY9wz12Qr98XPqAm7AbJuAdTvOmNw5F2itwUpLH18K-8-TlFdR0r-qnHLYMjp7ZyrcuGr0fJ1bdWDlsc2xKpBvaTWX2_DRCP4vp9zFzN_EJVYXtXYhnbJ71vurWskTFBHCdTa_ph-SjPfRVdEqf2yLaSkGgSaUBmgBiS6gPO4teZXyOXRw",
      alt: "Portrait of Titi L., a Lekki customer wearing kinky curly extensions",
    },
  },
];

function StarRow() {
  return (
    <div className="text-primary flex justify-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined filled text-[20px]"
          aria-hidden="true"
        >
          star
        </span>
      ))}
      <span className="sr-only">5 out of 5 stars</span>
    </div>
  );
}

export function Reviews() {
  return (
    <section className="py-2xl px-lg border-t border-outline-variant">
      <h2 className="font-headline-md text-headline-md text-primary text-center mb-xl">
        Whispers of Excellence
      </h2>
      <div className="grid md:grid-cols-3 gap-xl">
        {REVIEWS.map((review) => (
          <figure
            key={review.attribution}
            className="bg-white p-xl rounded-xl border border-outline-variant text-center space-y-md"
          >
            <div className="relative w-16 h-16 rounded-full mx-auto overflow-hidden mb-md">
              <Image
                src={review.avatar.src}
                alt={review.avatar.alt}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <StarRow />
            <blockquote className="font-editorial-italic text-editorial-italic italic">
              &ldquo;{review.quote}&rdquo;
            </blockquote>
            <figcaption className="font-label-caps text-label-caps text-on-surface-variant">
              {review.attribution}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
