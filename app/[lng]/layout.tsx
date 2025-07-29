import "@/app/[lng]/globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { dir } from "i18next"
import { languages, fallbackLng } from "@/app/i18n/settings"
import { useTranslation } from "@/app/i18n"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { UserSyncProvider } from "@/components/providers/UserSyncProvider"

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export async function generateMetadata({
  params: { lng },
}: {
  params: {
    lng: string
  }
}) {
  if (languages.indexOf(lng) < 0) lng = fallbackLng
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = await useTranslation(lng)
  return {
    title: t("Home-Champion"),
    content:
      "A fun and rewarding way to manage family chores! Built with Next.js, TypeScript, TailwindCSS, DaisyUI, Supabase, and Clerk.",
  }
}

export default function RootLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode
  params: {
    lng: string
  }
}) {
  return (
    <html lang={lng} dir={dir(lng)}>
      <body>
        <ClerkProvider>
          <UserSyncProvider>
            <ToastContainer
              position="bottom-center"
              autoClose={5000}
              hideProgressBar
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
            {children}
          </UserSyncProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
