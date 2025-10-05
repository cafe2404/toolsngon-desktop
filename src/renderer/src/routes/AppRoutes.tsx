// layout components are used in AppLayout
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './AppLayout'
import Login from './pages/Login'
import { SearchProvider } from "@contexts/SearchContext"
import AuthCallback from './pages/AuthCallback'
import AuthLayout from './AuthLayout'
import { AuthProvider } from '@contexts/AuthContext'
import { useAuth } from '@contexts/AuthContext'
import { TabProvider } from '../contexts/TabContext'
import TabContent from './pages/TabContent'
import { TooltipProvider } from "@components/ui/tooltip"

function PrivateRoute({ children }: { children: React.JSX.Element }): React.JSX.Element | null {
    const { isAuthenticated, isLoading } = useAuth()
    if (isLoading) return null
    return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.JSX.Element }): React.JSX.Element | null {
    const { isAuthenticated, isLoading } = useAuth()
    if (isLoading) return null
    return isAuthenticated ? <Navigate to="/" replace /> : children
}
function AppRoutes(): React.JSX.Element {
    return (
        <HashRouter>
            <TooltipProvider>
                <AuthProvider>
                    <TabProvider>
                        <SearchProvider>
                            <Routes>
                                {/* Private routes */}
                                <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                                    <Route path="/" element={<TabContent />} />
                                </Route>

                                {/* Public routes */}
                                <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
                                    <Route path="/auth/callback" element={<AuthCallback />} />
                                    <Route path="/login" element={<Login />} />
                                </Route>
                                <Route path="*" element={<Navigate to="/login" replace />} />
                            
                            </Routes>
                        </SearchProvider>
                    </TabProvider>
                </AuthProvider>
            </TooltipProvider>
        </HashRouter>
    )
}

export default AppRoutes
