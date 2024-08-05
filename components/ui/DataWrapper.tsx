import { Loading } from "@/components/ui/loading"

interface DataWrapperProps<T> {
  data: T[] | null | undefined
  children: (data: T[]) => React.ReactNode
  loadingComponent?: React.ReactNode
  noDataMessage?: string
}

const DataWrapper = <T,>({
  data,
  children,
  loadingComponent = <Loading />,
  noDataMessage = "No data found",
}: DataWrapperProps<T>): JSX.Element => {
  if (data === null || data === undefined) {
    return <>{loadingComponent}</>
  }

  if (data.length === 0) {
    return <div className="text-center py-4">{noDataMessage}</div>
  }

  return <>{children(data)}</>
}

export default DataWrapper
