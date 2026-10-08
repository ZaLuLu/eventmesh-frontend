import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicShell } from './PublicShell'
import { AdminShell } from './AdminShell'
import { AuthShell } from './AuthShell'
import { NotFoundPage } from './NotFoundPage'

const LoadingFallback = () => (
  <div className="w-full min-h-[60vh] flex items-center justify-center p-8 bg-paper">
    <span className="font-mono text-xs uppercase tracking-widecaps text-ink-60 animate-pulse">
      Rendering Archival Space...
    </span>
  </div>
)

// Public Pages (Lazy)
const HomePage = lazy(() =>
  import('@/features/events/HomePage').then((m) => ({ default: m.HomePage }))
)
const ExplorePage = lazy(() =>
  import('@/features/events/ExplorePage').then((m) => ({ default: m.ExplorePage }))
)
const EventDetailPage = lazy(() =>
  import('@/features/events/EventDetailPage').then((m) => ({ default: m.EventDetailPage }))
)
const RegisterPage = lazy(() =>
  import('@/features/registration/RegisterPage').then((m) => ({ default: m.RegisterPage }))
)
const ClubsPage = lazy(() =>
  import('@/features/clubs/ClubsPage').then((m) => ({ default: m.ClubsPage }))
)
const ClubDetailPage = lazy(() =>
  import('@/features/clubs/ClubDetailPage').then((m) => ({ default: m.ClubDetailPage }))
)
const CalendarPage = lazy(() =>
  import('@/features/calendar/CalendarPage').then((m) => ({ default: m.CalendarPage }))
)
const AnnouncementsPage = lazy(() =>
  import('@/features/announcements/AnnouncementsPage').then((m) => ({ default: m.AnnouncementsPage }))
)
const AboutPage = lazy(() =>
  import('@/features/about/AboutPage').then((m) => ({ default: m.AboutPage }))
)
const GalleryPage = lazy(() =>
  import('@/features/gallery/GalleryPage').then((m) => ({ default: m.GalleryPage }))
)
const AttendeeDashboardPage = lazy(() =>
  import('@/features/dashboard/AttendeeDashboardPage').then((m) => ({ default: m.AttendeeDashboardPage }))
)
const VerifyCertificatePage = lazy(() =>
  import('@/features/certificates/VerifyCertificatePage').then((m) => ({ default: m.VerifyCertificatePage }))
)
const StyleguidePage = lazy(() =>
  import('@/features/styleguide/StyleguidePage').then((m) => ({ default: m.StyleguidePage }))
)
const DevAccountsPage = lazy(() =>
  import('@/features/auth/DevAccountsPage').then((m) => ({ default: m.DevAccountsPage }))
)

// Auth Pages (Lazy)
const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
)

// Admin Pages (Lazy)
const AdminDashboardPage = lazy(() =>
  import('@/features/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
)
const AdminEventsListPage = lazy(() =>
  import('@/features/admin/AdminEventsListPage').then((m) => ({ default: m.AdminEventsListPage }))
)
const AdminEventWizardPage = lazy(() =>
  import('@/features/admin/AdminEventWizardPage').then((m) => ({ default: m.AdminEventWizardPage }))
)
const AdminRegistrationsPage = lazy(() =>
  import('@/features/admin/AdminRegistrationsPage').then((m) => ({ default: m.AdminRegistrationsPage }))
)
const AdminCheckinPage = lazy(() =>
  import('@/features/admin/AdminCheckinPage').then((m) => ({ default: m.AdminCheckinPage }))
)
const AdminCertificatesPage = lazy(() =>
  import('@/features/admin/AdminCertificatesPage').then((m) => ({ default: m.AdminCertificatesPage }))
)
const AdminAnnouncementsPage = lazy(() =>
  import('@/features/admin/AdminAnnouncementsPage').then((m) => ({ default: m.AdminAnnouncementsPage }))
)
const AdminNotificationsPage = lazy(() =>
  import('@/features/admin/AdminNotificationsPage').then((m) => ({ default: m.AdminNotificationsPage }))
)
const AdminClubProfilePage = lazy(() =>
  import('@/features/admin/AdminClubProfilePage').then((m) => ({ default: m.AdminClubProfilePage }))
)
const AdminGalleryPage = lazy(() =>
  import('@/features/admin/AdminGalleryPage').then((m) => ({ default: m.AdminGalleryPage }))
)
const AdminClubsListPage = lazy(() =>
  import('@/features/admin/AdminClubsListPage').then((m) => ({ default: m.AdminClubsListPage }))
)
const AdminRolesPage = lazy(() =>
  import('@/features/admin/AdminRolesPage').then((m) => ({ default: m.AdminRolesPage }))
)
const AdminApprovalsPage = lazy(() =>
  import('@/features/admin/AdminApprovalsPage').then((m) => ({ default: m.AdminApprovalsPage }))
)
const AdminAnalyticsPage = lazy(() =>
  import('@/features/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage }))
)
const AdminAuditPage = lazy(() =>
  import('@/features/admin/AdminAuditPage').then((m) => ({ default: m.AdminAuditPage }))
)
const AdminSettingsPage = lazy(() =>
  import('@/features/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
)

export const router = createBrowserRouter([
  // 1. PUBLIC SITE ROUTES
  {
    path: '/',
    element: <PublicShell />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'explore',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ExplorePage />
          </Suspense>
        ),
      },
      {
        path: 'events/:slug',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <EventDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'events/:slug/register',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: 'clubs',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ClubsPage />
          </Suspense>
        ),
      },
      {
        path: 'clubs/:slug',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ClubDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'calendar',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CalendarPage />
          </Suspense>
        ),
      },
      {
        path: 'announcements',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AnnouncementsPage />
          </Suspense>
        ),
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AboutPage />
          </Suspense>
        ),
      },
      {
        path: 'gallery',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <GalleryPage />
          </Suspense>
        ),
      },
      {
        path: 'attendee/dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AttendeeDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'me',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AttendeeDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'verify/:certificateId',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <VerifyCertificatePage />
          </Suspense>
        ),
      },
      {
        path: 'styleguide',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <StyleguidePage />
          </Suspense>
        ),
      },
      {
        path: 'dev/accounts',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DevAccountsPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },

  // 2. AUTHENTICATION ROUTES
  {
    element: <AuthShell />,
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'admin/login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LoginPage />
          </Suspense>
        ),
      },
    ],
  },

  // 3. ADMIN CONSOLE ROUTES
  {
    path: 'admin',
    element: <AdminShell />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'events',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminEventsListPage />
          </Suspense>
        ),
      },
      {
        path: 'events/new',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminEventWizardPage />
          </Suspense>
        ),
      },
      {
        path: 'events/:id/edit',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminEventWizardPage />
          </Suspense>
        ),
      },
      {
        path: 'registrations',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminRegistrationsPage />
          </Suspense>
        ),
      },
      {
        path: 'checkin',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminCheckinPage />
          </Suspense>
        ),
      },
      {
        path: 'certificates',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminCertificatesPage />
          </Suspense>
        ),
      },
      {
        path: 'announcements',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminAnnouncementsPage />
          </Suspense>
        ),
      },
      {
        path: 'notifications',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminNotificationsPage />
          </Suspense>
        ),
      },
      {
        path: 'club',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminClubProfilePage />
          </Suspense>
        ),
      },
      {
        path: 'gallery',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminGalleryPage />
          </Suspense>
        ),
      },
      // Org Admin specific
      {
        path: 'clubs',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminClubsListPage />
          </Suspense>
        ),
      },
      {
        path: 'roles',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminRolesPage />
          </Suspense>
        ),
      },
      {
        path: 'approvals',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminApprovalsPage />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminAnalyticsPage />
          </Suspense>
        ),
      },
      {
        path: 'audit',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminAuditPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminSettingsPage />
          </Suspense>
        ),
      },
    ],
  },
])
