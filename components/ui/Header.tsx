import Link from "next/link"
import { LuArrowLeft } from "react-icons/lu"

interface HeaderProps {
  children: React.ReactNode
  title: string
  description: string
}

const Header = ({ title, description, children }: HeaderProps) => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex flex-row">
      <Link
        href="/"
        className="bg-base-200 rounded-full border-2 w-fit h-fit border-white text-white p-3 mx-3 font-bold"
        prefetch={false}
      >
        <LuArrowLeft />
      </Link>
      <div className="flex flex-col gap-3 justify-start items-start">
        <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
          {title} Page
        </h1>
        <p className="truncate overflow-hidden w-80" title={description}>
          {description}
        </p>
      </div>
    </div>
    {/* buttons */}
    <div>{children}</div>
  </div>
)

export default Header
