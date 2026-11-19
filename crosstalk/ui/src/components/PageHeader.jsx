import LiveIndicator from './LiveIndicator'

export default function PageHeader({ title, subtitle }) {
  return (
    <header className="flex shrink-0 items-start justify-between border-b border-gray-200 bg-white px-8 py-6">
      <div>
        <h1 className="text-[26px] font-bold leading-tight">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
      <LiveIndicator />
    </header>
  )
}
