"use client"
import { useEffect, useState } from "react"
import { BsFillSunFill, BsMoonFill } from "react-icons/bs"
import "@/app/[lng]/globals.css"

const DarkModeButton = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null) // Change initial state to null
  const [isLoading, setIsLoading] = useState(true) // Add isLoading state

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.setAttribute("data-theme", "dark")
    } else {
      setIsDarkMode(false)
      document.documentElement.setAttribute("data-theme", "light")
    }
    setIsLoading(false) // Set isLoading to false after theme is set
  }, [])

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? "light" : "dark"
    setIsDarkMode(!isDarkMode)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  return (
    <label
      className={`swap swap-rotate h-fit bg-gray-700 border-2 border-black p-2 rounded-full ${
        isDarkMode ? "switch" : ""
      }`}
    >
      <button onClick={toggleDarkMode} disabled={isLoading}>
        {/* loading or sun/moon icon */}
        {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <>
            {/* sun icon */}
            <div
              className={`${
                isDarkMode ? "hidden" : "block"
              } hover:text-yellow-300 text-white`}
            >
              <BsFillSunFill size={20} />
            </div>
            {/* moon icon */}
            <div
              className={`${
                isDarkMode ? "block" : "hidden"
              } hover:text-slate-300 text-white`}
            >
              <BsMoonFill size={20} />
            </div>
          </>
        )}
      </button>
    </label>
  )
}

export default DarkModeButton
