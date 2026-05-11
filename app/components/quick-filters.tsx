const FILTERS = ["LENGTH", "TYPE", "PRICE"];

export function QuickFilters() {
  return (
    <div className="sticky top-[72px] z-40 bg-surface-container-low/95 backdrop-blur-sm border-y border-outline-variant mb-xl">
      <div className="max-w-[1200px] mx-auto px-lg py-md flex items-center gap-md">
        <span className="hidden sm:inline text-label-caps font-label-caps text-on-surface-variant whitespace-nowrap">
          REFINE
        </span>

        <div className="flex gap-sm overflow-x-auto hide-scrollbar">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className="flex items-center gap-xs px-md py-xs rounded-full border border-outline hover:bg-surface-variant text-label-caps font-label-caps text-on-surface-variant whitespace-nowrap"
            >
              {filter}
              <span className="material-symbols-outlined text-[16px]">
                expand_more
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="ml-auto flex items-center gap-xs px-md py-xs rounded-full border border-outline hover:bg-surface-variant text-label-caps font-label-caps text-on-surface-variant whitespace-nowrap"
        >
          SORT BY
          <span className="material-symbols-outlined text-[16px]">
            swap_vert
          </span>
        </button>
      </div>
    </div>
  );
}
