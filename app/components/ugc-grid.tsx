import Image from "next/image";

interface UGCPost {
  src: string;
  alt: string;
}

const POSTS: UGCPost[] = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrTP1k6TY6zMQnSwKF-77F7bCATWpuKdKj524o-Qijfw_lEdw-htFARbZWBIvgRbrJZgy75Csv33Akm7vN5JMXfCJTPIl-ls_3lA5pjufUuif4kfDa4Q5OROqIHxn_mgpRYrGPYMLtfhHYCpzcqHXFROUyFd6piE_tu7rRC0fhaPIy0GKapZ06FWZnbYSxhXEPG-6L9j-fEmWf44CftHfXmKaKRg8G7YiOOOzTTUYnXoA0QxwipqEppAF_2g7AndcrfbMcaFtp2pQ",
    alt: "Customer smiling outdoors with voluminous body wave extensions in golden hour",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzt7zzSlc1GSxjEoxhGweqI4N41j-vsHaQIogjFV7v00k6qbEfR1wq65F3WTTQVQOleDLGyQ9mfcgDKQ3NJKfK72Kj42SjBEqoK6eAwByWe7FE0jfnB_nqgYiOZTHDYP8MS3Dl6tnNPIU0Etg39mK602AoERIxP3xCnT1-4IyNcUUMuIxXeezmglbH9feyLGPd5F9UDJUt_2QYdNfSHy_biITRQMGH8MFUnUf6NoD-HIHgqKFfmCs1ZZ3GNnOK95m2VSpT0tmM1K0",
    alt: "Customer selfie with kinky curly extensions blending with natural hair",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDA6niYkqpsZNoPgu5zjijfdITlpkLzUeRZ6tHcbu0FsBTc4QNvxfkrdNbGslx618UyOZreXIyanJbfGyPUu0U7xjgZzhQ0kFAkT6HbV0OZDV-dyxDv3nysdSeXFOe9jR_g9gq9KLMiltH1Ft92sZF_8h04v-uz6CiHeAw-qpo7UNYn5tChGsyVg_MfsYCZq25sxq_TNb8OXTvCbA-PrLea7Wx-UJrB9QFuEoGr4UPwWC1F3cOL0fkvlMbv_v-LZodS-P1gBQgoq_s",
    alt: "Stylish customer with sleek waist-length straight hair in afternoon light",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbl3y8UUvZ4zWo-YKYzpuPpz51RyZu1guQ6VhBhRjP_iHWC1gdvSi3UiLdcZ79XSxMlj2FlSkj-QWws9NlJxL7qhOXPjUvFP6LPTfcSMdJfHOb_eH8GcmmoNWiYw-gOj7_gcwez4DnNMb0v6jgfCdtGi2vyC1AWbQJPBPc1F7jQEndHCH8tjiCuFfgnGM3lTMhIA54BQyHt9U0v9CkKRe7XNEuew8mZUcWHAyMEIN_0q5TguNv6eqtcI37eztSEReMtSbs3khvhFY",
    alt: "Customer in mahogany dress styled with body wave hair at an upscale event",
  },
];

export function UGCGrid() {
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
        <a
          href="#"
          className="bg-primary text-white px-xl py-md font-label-caps tracking-widest hover:opacity-90 transition-opacity"
        >
          FOLLOW US ON IG
        </a>
      </div>
    </section>
  );
}
