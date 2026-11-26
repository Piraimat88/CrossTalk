import { Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import Cases from './pages/Cases'
import Evidence from './pages/Evidence'
import LiveAlerts from './pages/LiveAlerts'
import SystemOverview from './pages/SystemOverview'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<SystemOverview />} />
        <Route path="alerts" element={<LiveAlerts />} />
        <Route path="cases" element={<Cases />} />
        <Route path="evidence" element={<Evidence />} />
      </Route>
    </Routes>
  )
}
