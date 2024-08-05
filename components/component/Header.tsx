import Link from "next/link"
import DarkModeToggle from "@/components/ui/darkModeToggle"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { LuHome, LuSettings } from "react-icons/lu"

export default function Header({ appName }: { appName: string }) {
  return (
    // <header className="sticky top-0 z-40 w-full min-h-fit py-2 flex justify-center flex-row border-b bg-primary text-white shadow-md">
    <header className=" z-40 w-full min-h-fit py-2 flex justify-center flex-row">
      {/* Header */}
      <div className="container flex h-16  items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <LuHome size={30} />
          <span className="font-bold text-xl">{appName}</span>
        </Link>
        <div className="flex items-center">
          <div className="px-3">
            <DarkModeToggle />
          </div>
          <SignedOut>
            <SignInButton>
              <button className="relative flex items-center px-6 py-3 overflow-hidden font-medium transition-all bg-secondary rounded-lg group shadow-btn border-2 border-black">
                <span className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-secondary rounded group-hover:-mr-4 group-hover:-mt-4">
                  {/* <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-inherit"></span> */}
                </span>
                <span className="absolute bottom-0 rotate-180 left-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-secondary rounded group-hover:-ml-4 group-hover:-mb-4">
                  {/* <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-inherit"></span> */}
                </span>
                <span className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full bg-indigo-600 rounded-md group-hover:translate-x-0"></span>
                <span className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-white">
                  Get Started
                </span>
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div
              data-theme="light"
              className="rounded-full p-2 bg-base-200 text-xl"
            >
              <UserButton showName />
            </div>
            <Link href="/settings" className="group px-2" prefetch={false}>
              <div className="transition-transform duration-300 group-hover:rotate-[270deg]">
                <LuSettings size={30} />
              </div>
            </Link>
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
