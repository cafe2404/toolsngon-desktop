import './assets/base.css'

import { createRoot } from 'react-dom/client'
import AppRoutes from './routes/AppRoutes'

createRoot(document.getElementById('root')!).render(
    <AppRoutes />
)
