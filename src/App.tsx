import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const CampaignsListPage = lazy(() => import('@/pages/CampaignsListPage'))
const CampaignBuilderPage = lazy(() => import('@/pages/CampaignBuilderPage'))
const CampaignDetailsPage = lazy(() => import('@/pages/CampaignDetailsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SignupPage = lazy(() => import('@/pages/SignupPage'))

// Create a lazy-loaded admissions page that uses the workflow component
const AdmissionsPage = lazy(() => 
  import('@/components/workflows/admissions/AdmissionsWorkflow').then(module => ({
    default: () => <module.AdmissionsWorkflow />
  }))
)

const LoadingSpinner = () => (
  <div className="flex h-full items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admissions" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AdmissionsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/campaigns" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CampaignsListPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/campaigns/builder" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ErrorBoundary>
                      <CampaignBuilderPage />
                    </ErrorBoundary>
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/campaigns/:campaignId" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CampaignDetailsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/organization" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
          <Toaster />
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App