import Image from "next/image";
import { LinkButton } from "@/app/components/ui";

const INSTAGRAM_URL = "https://www.instagram.com/adiconcollections";

interface UGCPost {
  src: string;
  alt: string;
}

const POSTS: UGCPost[] = [];

export function UGCGrid() {
  if (POSTS.length === 0) return null;
  return (
    <section className="px-lg mb-section">
      <div className="text-center mb-xl">
        <h2 className="font-display-lg text-headline-sm uppercase tracking-widest">
          #AdiConDidIt on IG
        </h2>
        <p className="text-on-surface-variant italic font-body-sm">
          Tag us in your photo to be featured
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {POSTS.map((post) => (
          <div
            key={post.src}
            className="relative aspect-[3/4] bg-surface-container overflow-hidden"
          >
            <Image
              src={post.src}
              alt={post.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover hover:scale-110 transition-transform duration-1000"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-xl">
        <LinkButton
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          size="md"
          title="Follow AdiCon Collections on Instagram"
          className="tracking-widest"
        >
          Follow us on IG
        </LinkButton>
      </div>
    </section>
  );
}
