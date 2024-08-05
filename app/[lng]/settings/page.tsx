"use client"

import { useState } from "react"
import AboutAppInfo from "@/components/component/AboutAppInfo"
import { LuArrowLeft, LuHome } from "react-icons/lu"
import Link from "next/link"

export default function Component() {
  const [language, setLanguage] = useState("en")
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
  }
  const handleExportData = () => {}
  const handleImportData = () => {}
  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-6 py-8">
      <div className="space-y-8">
        <div className="flex flex-row justify-between w-full">
          <Link
            href="/"
            className="bg-base-200 rounded-full p-3 font-bold"
            prefetch={false}
          >
            <LuArrowLeft />
          </Link>
          <div className="flex items-center gap-2">
            {/* logo */}
            <LuHome size={30} />
            <span className="font-bold text-xl">Home Champion</span>
          </div>
        </div>
        <div className="bg-base-200  rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Language</h2>
            <div className="flex items-center space-x-4">
              <button
                className={
                  language === "en"
                    ? "btn custom-btn btn-primary"
                    : "btn custom-btn btn-outline"
                }
                onClick={() => handleLanguageChange("en")}
              >
                English
              </button>
              <button
                className={
                  language === "ar"
                    ? "btn custom-btn btn-primary"
                    : "btn custom-btn btn-outline"
                }
                onClick={() => handleLanguageChange("ar")}
              >
                العربية
              </button>
            </div>
          </div>
        </div>
        <div className="bg-base-200  rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Data</h2>
            <div className="flex items-center space-x-4">
              <button
                className="btn custom-btn btn-outline"
                onClick={handleExportData}
              >
                Export
              </button>
              <button
                className="btn custom-btn btn-outline"
                onClick={handleImportData}
              >
                Import
              </button>
            </div>
          </div>
        </div>
        <AboutAppInfo />
      </div>
    </div>
  )
}
