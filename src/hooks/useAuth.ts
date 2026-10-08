import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, UserSession } from '@/api'

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: session, isLoading } = useQuery<UserSession | null>({
    queryKey: ['auth', 'session'],
    queryFn: () => api.auth.getSession(),
    staleTime: 1000 * 60 * 10,
  })

  const sendOtpMutation = useMutation({
    mutationFn: (email: string) => api.auth.sendOtp(email),
  })

  const verifyOtpMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      api.auth.verifyOtp(email, otp),
    onSuccess: (newSession) => {
      queryClient.setQueryData(['auth', 'session'], newSession)
      queryClient.invalidateQueries()
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'session'], null)
      queryClient.invalidateQueries()
    },
  })

  const switchDemoAccountMutation = useMutation({
    mutationFn: ({ role, clubId }: { role: string; clubId?: string }) =>
      api.auth.switchDemoAccount(role, clubId),
    onSuccess: (newSession) => {
      queryClient.setQueryData(['auth', 'session'], newSession)
      queryClient.invalidateQueries()
    },
  })

  return {
    session,
    isAuthenticated: Boolean(session),
    isLoading,
    role: session?.role || null,
    clubId: session?.clubId || null,
    sendOtp: sendOtpMutation.mutateAsync,
    isSendingOtp: sendOtpMutation.isPending,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    logout: logoutMutation.mutateAsync,
    switchDemoAccount: switchDemoAccountMutation.mutateAsync,
  }
}
