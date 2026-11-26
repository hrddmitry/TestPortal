import { useEffect, useState } from 'react'

type Health = { status: string; database: string }

function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<Health>
      })
      .then(setHealth)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <main>
      <h1>TestPortal</h1>
      {error && <p>API error: {error}</p>}
      {!error && !health && <p>Checking API...</p>}
      {health && (
        <p>
          API: {health.status}, database: {health.database}
        </p>
      )}
    </main>
  )
}

export default App