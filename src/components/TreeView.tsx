import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'
import { cn } from '../lib/utils'

interface TreeViewProps {
  data: any
  className?: string
  isDark?: boolean
}

export function TreeView({ data, className, isDark = true }: TreeViewProps) {
  return (
    <div className={cn(
      "h-full w-full overflow-auto p-4 rounded-md border text-sm transition-colors",
      isDark ? "bg-[#1e1e1e] border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-900",
      className
    )}>
      <JsonView 
        src={data} 
        theme="vscode"
        dark={isDark}
        enableClipboard={true}
        displaySize={true}
        collapsed={2}
        style={{
          backgroundColor: 'transparent',
        }}
      />
    </div>
  )
}
