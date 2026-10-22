/// <reference types="vite/client" />
/// <reference types="@react-three/fiber" />

import 'react'

declare module 'react' {
  interface HTMLAttributes<T> {
    inert?: boolean | undefined
  }
}
