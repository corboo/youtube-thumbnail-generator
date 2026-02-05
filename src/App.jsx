import ThumbnailGenerator from './ThumbnailGenerator'

const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0a0a0f;
    color: #e8e8f0;
    font-family: 'Segoe UI', 'SF Pro Display', -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  ::selection { background: rgba(255,40,40,0.35); color: #fff; }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #111; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #555; }
`

export default function App() {
  return (
    <>
      <style>{globalStyles}</style>
      <ThumbnailGenerator />
    </>
  )
}
