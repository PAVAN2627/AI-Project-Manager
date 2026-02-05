import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './styles/global.css'
import { App } from './app/App'
import { AuthUserProvider } from './app/AuthUserProvider'
import { TamboRootProvider } from './tambo/TamboRootProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TamboRootProvider>
      <AuthUserProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthUserProvider>
    </TamboRootProvider>
  </StrictMode>,
)
