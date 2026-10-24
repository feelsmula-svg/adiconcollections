import Image from "next/image";

interface Review {
  quote: string;
  attribution: string;
  avatar: { src: string; alt: string };
}

const REVIEWS: Review[] = [];

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
  if (REVIEWS.length === 0) return null;
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
            <blockquote className="text-body-md text-on-surface leading-relaxed italic">
              “{review.quote}”
            </blockquote>
            <figcaption className="text-label-sm tracking-widest uppercase text-on-surface-variant">
              {review.attribution}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
