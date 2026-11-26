// Short error message with a Retry button. Sits inside a card and keeps the card's size.
export default function ErrorState({ what, onRetry, className = '' }) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 px-5 py-12 text-center ${className}`}
    >
      <p className="text-sm font-semibold">Couldn&apos;t load {what}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-ink px-4 py-2 text-[13px] font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-black motion-safe:active:scale-[0.98]"
      >
        Retry
      </button>
    </div>
  )
}
