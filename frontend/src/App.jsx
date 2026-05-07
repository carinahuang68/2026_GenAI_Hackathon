import { useState } from 'react'
import ProfileForm from './components/ProfileForm'
import './App.css'

function App() {
  const [profile, setProfile] = useState(null)

  if (profile) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1rem' }}>
          Generating your recommendations…
        </h2>
        <pre style={{ fontSize: 12, color: '#555', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>
    )
  }

  return <ProfileForm onSubmit={setProfile} />
}

export default App
