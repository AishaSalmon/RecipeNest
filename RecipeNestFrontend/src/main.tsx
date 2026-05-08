import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'


//This file is the entry point of the React application. It importss the necessary modules and renders the entire application inside the root element of the HTML document.
// It renders the content of the App component.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
