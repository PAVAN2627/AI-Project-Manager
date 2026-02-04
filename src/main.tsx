import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/global.css'
import { App } from './app/App'
import { TamboRootProvider } from './tambo/TamboRootProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TamboRootProvider>
      <App />
    </TamboRootProvider>
  </StrictMode>,
)
