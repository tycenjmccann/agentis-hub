import { Routes, Route, Navigate } from 'react-router-dom'
import SettingsPage from './SettingsPage'

function App() {
  return (
    <div className="min-h-screen bg-surface-0">
      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/settings" replace />} />
      </Routes>
    </div>
  )
}

export default App
