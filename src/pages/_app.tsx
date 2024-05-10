import "@/styles/globals.css";
import "@/styles/index.css"
import "@/styles/create.css"
import "@/styles/loom.css"
import { useEffect } from 'react'
import type { AppProps } from "next/app";
import {NextUIProvider} from "@nextui-org/react";
import {useRouter} from 'next/router';

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    // Enable debug mode in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    }
  })
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog?.capture('$pageview')
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  return (
    // <NextUIProvider navigate={router.push}>
    <PostHogProvider client={posthog}>
      <Component {...pageProps} />
    </PostHogProvider>
    // </NextUIProvider>
  );
}
