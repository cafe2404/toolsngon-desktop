// layout components are used in AppLayout
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './AppLayout'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import ScreenLayout from './ScreenLayout'
import { AuthProvider } from '@contexts/AuthContext'
import { useAuth } from '@contexts/AuthContext'
import { ProfileProvider } from '../contexts/ProfileContext'
import TabContent from './pages/TabContent'
import { PanelProvider } from '../contexts/PanelContext'
import DeepLinkListener from './pages/DeepLinkListener'
import TabListener from './pages/TabListener'
import Updater from './pages/Updater'
import { UpdaterProvider } from '../contexts/UpdaterContext'

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
            <UpdaterProvider>
                <PanelProvider>
                    <AuthProvider>
                        <ProfileProvider>
                            <DeepLinkListener />
                            <TabListener />
                            <Routes>
                                {/* Updater*/}
                                <Route element={<ScreenLayout />}>
                                    <Route path="/updater" element={<Updater />} />
                                </Route>
                                {/* Private routes */}
                                <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                                    <Route path="/" element={<TabContent />} />
                                </Route>
                                {/* Public routes */}
                                <Route element={<PublicRoute><ScreenLayout /></PublicRoute>}>
                                    <Route path="/auth/callback" element={<AuthCallback />} />
                                    <Route path="/login" element={<Login />} />
                                </Route>
                                <Route path="*" element={<Navigate to="/login" replace />} />
                            </Routes>
                        </ProfileProvider>
                    </AuthProvider>
                </PanelProvider>
            </UpdaterProvider>
        </HashRouter>
    )
}

export default AppRoutes
