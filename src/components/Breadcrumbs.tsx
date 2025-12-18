import { ChevronRight, Home } from "lucide-react"
import { cn } from "../lib/utils"

interface BreadcrumbsProps {
  path: (string | number)[]
  onPathClick?: (path: (string | number)[]) => void
  className?: string
}

export function Breadcrumbs({ path, onPathClick, className }: BreadcrumbsProps) {
  if (!path || path.length === 0) {
    return (
      <div className={cn("flex items-center text-sm text-zinc-500 px-4 py-2 bg-zinc-50 dark:bg-[#1e1e1e] border-b dark:border-zinc-800", className)}>
        <Home className="w-3.5 h-3.5 mr-2" />
        <span>root</span>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center flex-wrap text-sm px-4 py-2 bg-zinc-50 dark:bg-[#1e1e1e] border-b dark:border-zinc-800 font-mono overflow-x-auto", className)}>
      <button 
        onClick={() => onPathClick?.([])}
        className="flex items-center text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </button>
      
      {path.map((segment, index) => {
        const isLast = index === path.length - 1
        const currentPath = path.slice(0, index + 1)
        
        return (
          <div key={index} className="flex items-center whitespace-nowrap">
            <ChevronRight className="w-3.5 h-3.5 mx-1 text-zinc-400" />
            <button
              onClick={() => onPathClick?.(currentPath)}
              className={cn(
                "px-1.5 py-0.5 rounded transition-colors",
                isLast 
                  ? "font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-200/50 dark:bg-zinc-800/50 hover:bg-zinc-300 dark:hover:bg-zinc-700" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400"
              )}
            >
              {segment}
            </button>
          </div>
        )
      })}
    </div>
  )
}
