import { useEffect, useState } from 'react'

function App() {
  const [version, setVersion] = useState('Memuat...')

  useEffect(() => {
    window.api.getVersion().then((appVersion) => {
      setVersion(appVersion)
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">
        FinTrack Test
      </h1>

      <p className="mt-4 text-gray-600">
        Electron Version: {version}
      </p>
    </div>
  )
}

export default App