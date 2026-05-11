import Image from "next/image";

interface Texture {
  label: string;
  image: string;
  alt: string;
}

const TEXTURES: Texture[] = [
  {
    label: "STRAIGHT",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCbcvueS78W_fMyh6E5s86gB8JRqyvRgmHe0FM6-J-gM3rLtPoZoedrXdo1c0TcJip_LM2ebRQWj8K2NojdQBTx5suI4ojUKOO4SoZpwwjIbQHiR4nesKMcTBlywTUWGo9SSXyCFeX14yf7hZ02Vs60qallHmqsUK_BKiN4-w-EGz8MvzYMsVWIiWpHx6ZUIEZ3errHrVr44c4aRvnGh14xiB1V0TTVjko9eBV1Zbzc0D7wWduDoV4imIY4XWeUwtuJLeBmocLHcl8",
    alt: "Sleek obsidian-black straight raw hair extensions on a warm cream background",
  },
  {
    label: "BODY WAVE",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtSz9sVmkiklMnJZ0bbslw4sFJHSH_xPaxjxBKNZ8n_1x4D-zQ5nB289tJnX6JsbyDadxFciKJ7wKpy6iEvOfz9NEZMFJKE1apZMa5t2kFh7mgQNqI5vVXPbOHFWee486LWAMSjNX1ETvve2Dedyrij6-v1QuVogysIr8XykPAx8XoCQ3lN54WB6zv3U4hpL8Z4JkY4LrnZifKE7sk2Cc9vIGJo7np-xeW36fzPfdIIV-r6FL-MsLAx81NHooIJJwlwTxgphc-gZ0",
    alt: "Defined body wave hair extensions with mahogany undertones in warm studio light",
  },
  {
    label: "DEEP WAVE",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC-tF7aSUlnITWgSgQpc2ZacZWfGy8-tCDYt02VB2dOkR1jZRc7QgVPc7OLUS9naEB3y2bJ8n0RuzsncmQYhkYli8lmmDr2v7ZFTEIKqxPaUi-dR9SWaHeV9iKIq2jzHunwxbiJbHgdUOLsabeO2ZFER_2s-ya-WKYUiW_qIn1fZyoBUKLAoBNxcLRhnS69sr-IwM2Yy_2TSNQtC10QWhY3SWr99Qt7NOqofGxOZ9FXoEbISpzzq9JTYVebAD6rFbRhNrbJTtWRn1M",
    alt: "Glossy deep wave extensions with tight curls in espresso brown",
  },
  {
    label: "CURLY",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC3Leb5F_nnwTuHRsVTyEsFV24WI1-mUGec08bQYnQwue0JlNZVvShyxvW0ImaWHZVQ7uGyXSowKsAndZy5efIjXB7UW4bgak-2cIkWcxSRB-RjGqn32FXHugLnUDm5o6rRLdBmX8IoIWtJ_s2Qgila916eOfgbIHm583gYRcqdtZChtJHQmXhC9LHMpod_T_UhodPy5LnRPWy5hI_JdrRKEyTIXLbi9M17SmJznAtFVm0TMoAueZLTNsyLEUeYzG_ZZPDhgk-DZ14",
    alt: "Lush voluminous curly hair extensions with springy ringlets",
  },
  {
    label: "KINKY STRAIGHT",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC8MvGfPv9xmu9tAGtOvdT7NDETHebZqs-VE1CDD_Pi87dlnRtntIko4HW3RmudRFc3MB86tKNRLdPqvZwGIXastCeTu-kq5jzKFxLxaDfFg5BfUTMTyYjg_aUfWGyYMW2QaSqc_9uhO5b5-zvS9_NVFUacOEMoj4Tb2U9pgT_ApiIJ__bO7QkazrjgfuIFrfLK7SZEmgky8rs47jjo5rTDZ924tRv-oRGmlI_Ip8csxTQAT1XXoRT2CVhtBa78GGqgnRfZRNJHFjs",
    alt: "Coarse kinky straight hair extensions mimicking blown-out natural hair",
  },
  {
    label: "KINKY CURLY",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAsUJtGuMfLVgTA8sY09tpHbzcRdD1jpH5QIpFL4CGDnU6MWUMNXZm1iNS-Dp7dqlo2lhoiHUz6H1n_GhJr4Hz5wdNS_zVLwlwkcxJjocf-GlnPhHBPm2lvdyFYolOImpvliqR83wcb-5e9xfokEIY9x06zCy8TMwdRM56khgUZOALNfky7wsKZo_ko8pmxbwxXnyA61zDsFl9S8vU2W0dOf3bgwIH29Qobua83rZusk_cowOukSmWG16gidcNVKfGKwxHX0EOsn98",
    alt: "Dense small-coil kinky curly hair extensions in deep black",
  },
];

export function ShopByTexture() {
  return (
    <section className="py-2xl px-lg">
      <h2 className="font-headline-md text-headline-md text-primary mb-xl">
        Shop by Texture
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-xl">
        {TEXTURES.map((texture) => (
          <button
            key={texture.label}
            type="button"
            className="flex flex-col items-center gap-md group cursor-pointer"
          >
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all">
              <Image
                src={texture.image}
                alt={texture.alt}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <span className="font-label-caps text-label-caps text-on-surface">
              {texture.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
