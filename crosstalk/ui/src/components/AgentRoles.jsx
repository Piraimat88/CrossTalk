import { roleLabel } from '../data/selectors'
import { ArrowRightIcon } from './Icons'

// Agents with their case_agents role, e.g. "agent-a Wrote -> agent-b Read".
// `agents` must be ordered writer -> reader -> accessor (see selectors.js).
export default function AgentRoles({ agents }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2">
      {agents.map((a, i) => (
        // The arrow stays with the chip it points to, so a wrap never strands it at a line end.
        <span key={a.agent_id} className="inline-flex max-w-full min-w-0 items-center gap-2">
          {i > 0 && agents[i - 1].role === 'writer' && a.role === 'reader' && (
            <ArrowRightIcon width={14} height={14} className="shrink-0 text-gray-400" />
          )}
          <span
            className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-[13px]"
            title={`${a.name} · ${roleLabel(a.role)}`}
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-ink text-[9px] font-bold uppercase text-brand">
              {a.name[0]}
            </span>
            <span className="truncate font-semibold">{a.name}</span>
            <span className="shrink-0 text-gray-500">{roleLabel(a.role)}</span>
          </span>
        </span>
      ))}
    </span>
  )
}
