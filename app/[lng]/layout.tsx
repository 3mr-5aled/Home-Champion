import "@/app/[lng]/globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { dir } from "i18next"
import { languages, fallbackLng } from "@/app/i18n/settings"
import { useTranslation } from "@/app/i18n"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

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
      "A playground to explore new Next.js 13/14 app directory features such as nested layouts, instant loading states, streaming, and component level data fetching.",
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
        </ClerkProvider>
      </body>
    </html>
  )
}
