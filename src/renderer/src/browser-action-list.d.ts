import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'browser-action-list': {
        className?: string
        partition?: string
        tab?: string
        alignment?: string
      }
    }
  }
}
