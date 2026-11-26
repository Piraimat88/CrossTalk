import { Link } from 'react-router-dom'
import { ArrowRightIcon } from './Icons'

export default function Panel({ title, to, meta, footer, className = '', children }) {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white ${className}`}
    >
      <header className="flex items-center justify-between px-5 py-4">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {to && (
          <Link to={to} className="group flex items-center gap-1.5 text-xs font-semibold text-ink">
            View all
            <ArrowRightIcon className="transition-transform duration-150 ease-out motion-safe:group-hover:translate-x-0.5" />
          </Link>
        )}
        {meta && <span className="text-xs text-gray-500">{meta}</span>}
      </header>
      <div className="flex-1 border-t border-gray-100">{children}</div>
      {footer && (
        <footer className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">{footer}</footer>
      )}
    </section>
  )
}
