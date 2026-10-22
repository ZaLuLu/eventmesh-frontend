import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, FeeQuote, RefundOrderRequest, RefundOrderResponse } from '@/api'

export function useFeeQuote(baseAmountCents: number, options?: { enabled?: boolean }) {
  return useQuery<FeeQuote>({
    queryKey: ['payments', 'feeQuote', baseAmountCents],
    queryFn: () => api.payments.getFeeQuote(baseAmountCents),
    enabled: options?.enabled !== undefined ? options.enabled : baseAmountCents > 0,
    staleTime: 60 * 1000,
  })
}

export interface RefundOrderParams {
  orderId: string
  payload?: RefundOrderRequest
}

export function useRefundOrder() {
  const queryClient = useQueryClient()
  return useMutation<RefundOrderResponse, Error, RefundOrderParams>({
    mutationFn: ({ orderId, payload }: RefundOrderParams) => {
      if (!api.payments.refundOrder) {
        throw new Error('Refund API is not supported on this adapter.')
      }
      return api.payments.refundOrder(orderId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] })
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
