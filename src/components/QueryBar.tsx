import { Search, X } from "lucide-react"
// import { Button } from "./ui/button"
import { useEffect, useState } from "react"

interface QueryBarProps {
  onQuery: (query: string) => void
  isDark: boolean
}

export function QueryBar({ onQuery }: QueryBarProps) {
  const [value, setValue] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      onQuery(value)
    }, 300) // Debounce query

    return () => clearTimeout(timer)
  }, [value, onQuery])

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-[#1e1e1e] border-b dark:border-zinc-800">
      <div className="relative flex-1 max-w-2xl flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Filter with JMESPath (e.g. items[?price > `10`].name)"
          className="w-full h-9 pl-9 pr-8 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100 placeholder:text-zinc-400"
        />
        {value && (
          <button
            onClick={() => setValue("")}
            className="absolute right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <a
        href="https://jmespath.org/tutorial.html"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        JMESPath Syntax
      </a>
    </div>
  )
}
