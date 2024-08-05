import Homepage from "@/components/component/HomePage"
import { useTranslation } from "@/app/i18n"
import { fallbackLng, languages } from "@/app/i18n/settings"
export default async function Home({
  params: { lng },
}: {
  params: {
    lng: string
  }
}) {
  if (languages.indexOf(lng) < 0) lng = fallbackLng
  const { t } = await useTranslation(lng)
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Homepage appName={t("appName")} />
    </main>
  )
}
