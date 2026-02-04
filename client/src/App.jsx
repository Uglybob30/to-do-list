import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* ===== NEW EDIT START ===== */}
      <div className="new-section" style={{ marginTop: '20px', textAlign: 'center' }}>
        <h2>Welcome to Jerico's To-Do App!</h2>
        <p>Start adding your tasks and stay organized.</p>
        <button 
          style={{ padding: '10px 20px', backgroundColor: '#4ade80', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          onClick={() => alert('Add your first task!')}
        >
          Add Sample Task
        </button>
      </div>
      {/* ===== NEW EDIT END ===== */}
    </>
  )
}


export default App
