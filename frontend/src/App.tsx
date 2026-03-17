import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div style={{padding: '20px', fontSize: '24px'}}>🏦 Welcome to Banking App!</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App