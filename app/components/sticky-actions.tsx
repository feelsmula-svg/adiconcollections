export function StickyActions() {
  return (
    <div className="fixed bottom-lg right-lg z-50 flex flex-col gap-sm">
      <button
        type="button"
        aria-label="Open shopping bag (3 items)"
        className="bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform relative"
      >
        <span className="material-symbols-outlined">shopping_bag</span>
        <span className="absolute -top-1 -right-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface">
          3
        </span>
      </button>
      <button
        type="button"
        aria-label="Open chat"
        className="bg-white text-primary w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        <span className="material-symbols-outlined">chat_bubble</span>
      </button>
    </div>
  );
}
