import Image from "next/image";

const POSTS: { src: string; alt: string }[] = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbRqW3m33mMNEsgsRrayUDFDDKwRJ2CUF1p4zMlZp3dnJIC8__HQHFJqOfACU5UdTVNs0Q-x6KBEYQIdck81VuI-2vSSJpq-C6hYJi_P9UPYkLuPjjww4ld6WORXzqB-1HcJqx3YbUlpZuBJuaDVi83KWThPxaQaboUSt1pN0RIRx4NohDpb98EtuEkMCY9PeBz4_il-Pekj-FDNvC58ZN5iZLL77OXGwDq36bs5FxvBgf4RwgwWKYDcFQrKX6vUzDsbseBuhk-2Q",
    alt: "Customer styling AdiCon straight extensions in a bright modern bathroom",
  },
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
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLxHQ1th-UofgNJr-rYSTKNvbhSoJpzITu2TPl1CI5uatdTuIaAUlVA_TeZ9j6A_44ZepsQpAXFOfJOc8_8NUn4nAA7g3RGYTks9czpVzTxDujbAADHsnYY0lwq7kgqYs7N0KsDpkmC1dwGuuL-ep_pnc0DlYJVrMJCisVAXUDcMAhPBo-w9R1MBJsSTEUpqC8SlqDmzUeMgO989nmFlsExXuSL1k4aoJ7H3m4OfZszRz9yQwoXYk1P0xbDZ9nlwGb0j7rTrvGByk",
    alt: "Customer selfie on vacation with deep wave extensions",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuB9dYzY4AO4KZujjYTTIpNOvBzZC6j9hpbczqopGNlYWUbOwqcisUjc5Ow64CfVzgsud-0RFXq0LlkJQWMlMAohVVctHhev1evcesiec4_17qz4b6y29Hz02Mvw3lAN_9NwU7mGOtx_TdAITwDS3OE-AOYAsjTe7K7qGlbrpqR9neIactbAYGRAk3Y5sQy0BMChGLsHEGLPfAa5jbI4a-6smv1uIkfyZtp7X5LRL5CZB6lUsWJpc1r8ye-ZYFmBpco9OAYtvmqhg",
    alt: "Side-lit artistic portrait of curly hair extensions",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCU1wYHLGRxKC3iEjqjZl7_lKPLJvSgjeXSknIhaBqTQ0nRPXw2pqS-FceHdFRKLhlu5ULbDJbdtZpJHfzCTvYUG2wcpQsaoyITFoKLECG81KvqnXVx0ZdJAwdV81KSOIAztMjpDTwyRWrFSiCzSICJewEBaAP1O8e-sE0k3baDMji8wJ_VkwNUoH3rUcPzuw7HXTVeeXiJcdkhELAKX2YgIK35fEhDJ_kOoSxg80MQaevXiKs_Z8bMStq4Zm2imtkOJN1y3GjN_O0",
    alt: "Sleek kinky-straight hair styled into a polished ponytail",
  },
];

export function UGCGrid() {
  return (
    <section className="py-2xl px-lg">
      <h2 className="font-headline-md text-headline-md text-primary mb-xl">
        As Seen on You #AdiConLuxe
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-sm">
        {POSTS.map((post) => (
          <div
            key={post.src}
            className="relative aspect-square bg-surface-container rounded-lg overflow-hidden"
          >
            <Image
              src={post.src}
              alt={post.alt}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 12vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
