import Image from "next/image";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCbcvueS78W_fMyh6E5s86gB8JRqyvRgmHe0FM6-J-gM3rLtPoZoedrXdo1c0TcJip_LM2ebRQWj8K2NojdQBTx5suI4ojUKOO4SoZpwwjIbQHiR4nesKMcTBlywTUWGo9SSXyCFeX14yf7hZ02Vs60qallHmqsUK_BKiN4-w-EGz8MvzYMsVWIiWpHx6ZUIEZ3errHrVr44c4aRvnGh14xiB1V0TTVjko9eBV1Zbzc0D7wWduDoV4imIY4XWeUwtuJLeBmocLHcl8";

export function Hero() {
  return (
    <section className="min-h-[70vh] flex flex-col md:flex-row items-center gap-xl py-xl px-lg">
      <div className="flex-1 space-y-md">
        <h1 className="font-headline-md text-5xl sm:text-6xl lg:text-[66px] leading-[1.1] text-primary max-w-5xl text-balance">
          Premium Raw Hair, Direct to You
        </h1>
        <p className="font-body-md text-on-surface-variant italic mt-md">
          100% virgin hair · 30-day returns · Lagos same-day delivery
        </p>
        <div className="flex flex-wrap gap-md pt-md">
          <button
            type="button"
            className="bg-primary text-white px-xl py-md rounded-lg font-label-caps uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Shop Now
          </button>
          <button
            type="button"
            className="border border-outline-variant text-on-surface-variant px-xl py-md rounded-lg font-label-caps uppercase tracking-widest hover:bg-surface-container transition-colors"
          >
            Find My Texture
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center w-full">
        <div className="relative w-full max-w-[500px] aspect-square overflow-hidden">
          <Image
            src={HERO_IMAGE}
            alt="Editorial portrait of premium raw hair extensions in mahogany tones"
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            priority
            className="object-contain"
            style={{ clipPath: "inset(0 0 15% 0)", transform: "scale(1.1)" }}
          />
        </div>
      </div>
    </section>
  );
}
