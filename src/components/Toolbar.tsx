import { Button } from "./ui/button"
import { 
  AlignLeft, 
  Minimize2, 
  CheckCircle2, 
  AlertCircle,
  Code2,
  Network,
  GitCompare,
  ArrowRightLeft,
  FileText,
  Table,
  ArrowLeftToLine,
  RefreshCcw,
  Upload,
  Download,
  Sun,
  Moon,
  Share2
} from "lucide-react"
import { cn } from "../lib/utils"

export type ViewMode = 'code' | 'tree' | 'diff' | 'split' | 'graph'

interface ToolbarProps {
  onFormat: () => void
  onMinify: () => void
  onModeChange: (mode: ViewMode) => void
  currentMode: ViewMode
  isValid: boolean | null
  errorCount: number
  onConvertToYaml: () => void
  onConvertToCsv: () => void
  onSetDiffOriginal?: () => void
  onSwapDiff?: () => void
  onImport?: (content: string) => void
  onExport?: () => void
  isDark: boolean
  onToggleTheme: () => void
  onSchemaClick: () => void
  isSchemaActive: boolean
  jsonSize?: number
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function Toolbar({ 
  onFormat, 
  onMinify, 
  onModeChange, 
  currentMode, 
  isValid, 
  errorCount,
  onConvertToYaml,
  onConvertToCsv,
  onSetDiffOriginal,
  onSwapDiff,
  onImport,
  onExport,
  isDark,
  onToggleTheme,
  onSchemaClick,
  isSchemaActive,
  jsonSize
}: ToolbarProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (onImport && content) {
        onImport(content)
      }
    }
    reader.readAsText(file)
    // Reset value so same file can be selected again
    event.target.value = ''
  }

  return (
    <div className="flex items-center justify-between p-2 border-b bg-white dark:bg-[#1e1e1e] dark:border-zinc-800 transition-colors">
      <div className="flex items-center gap-4">
        {/* File Actions Group */}
        <div className="flex items-center gap-1 border-r dark:border-zinc-800 pr-4">
          <div className="relative">
            <input
              type="file"
              accept=".json,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Import JSON File"
            />
            <Button variant="ghost" size="sm" className="gap-2 pointer-events-none dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onExport} className="gap-2 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" title="Export JSON File">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>

        {/* Schema Validation */}
        <div className="flex items-center gap-1 border-r dark:border-zinc-800 pr-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSchemaClick}
            className={cn(
              "gap-2 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
              isSchemaActive && "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800"
            )}
            title="Configure JSON Schema Validation"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">
              {isSchemaActive ? "Schema Active" : "Schema"}
            </span>
            {isSchemaActive && (
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </Button>
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-1 border-r dark:border-zinc-800 pr-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onFormat} 
            className="gap-2 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" 
            title="Format JSON"
            disabled={isValid === false}
          >
            <AlignLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Format</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMinify} 
            className="gap-2 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" 
            title="Minify JSON"
            disabled={isValid === false}
          >
            <Minimize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Minify</span>
          </Button>
        </div>

        {/* Conversion Group */}
        {currentMode !== 'diff' && (
          <div className="flex items-center gap-1 border-r dark:border-zinc-800 pr-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onConvertToYaml} 
              className="gap-2 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" 
              title="Convert to YAML"
              disabled={isValid === false}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">YAML</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onConvertToCsv} 
              className="gap-2 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" 
              title="Convert to CSV"
              disabled={isValid === false}
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
          </div>
        )}

        {/* Diff Actions Group */}
        {currentMode === 'diff' && (
          <div className="flex items-center gap-1 border-r dark:border-zinc-800 pr-4 animate-in fade-in zoom-in-95 duration-200">
             <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSetDiffOriginal} 
              className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20" 
              title="Use current JSON as Original (Left side)"
            >
              <ArrowLeftToLine className="w-4 h-4" />
              <span className="hidden sm:inline">Set Original</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSwapDiff} 
              className="gap-2 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" 
              title="Swap Original and Modified"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Swap</span>
            </Button>
          </div>
        )}

        {/* View Modes Group */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-md transition-colors">
          <Button 
            variant={currentMode === 'code' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => onModeChange('code')}
            className={cn("h-7 text-xs gap-1.5", 
              currentMode !== 'code' && "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700",
              currentMode === 'code' && "dark:bg-zinc-600 dark:text-zinc-50"
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </Button>
          <Button 
            variant={currentMode === 'split' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => onModeChange('split')}
            className={cn("h-7 text-xs gap-1.5", 
              currentMode !== 'split' && "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700",
              currentMode === 'split' && "dark:bg-zinc-600 dark:text-zinc-50"
            )}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Split
          </Button>
          <Button 
            variant={currentMode === 'tree' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => onModeChange('tree')}
            className={cn("h-7 text-xs gap-1.5", 
              currentMode !== 'tree' && "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700",
              currentMode === 'tree' && "dark:bg-zinc-600 dark:text-zinc-50"
            )}
            title="Browse large JSON easily"
          >
            <Network className="w-3.5 h-3.5" />
            Tree
          </Button>
          <Button 
            variant={currentMode === 'graph' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => onModeChange('graph')}
            className={cn("h-7 text-xs gap-1.5", 
              currentMode !== 'graph' && "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700",
              currentMode === 'graph' && "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
            )}
            title="Visualize structure"
          >
            <Share2 className="w-3.5 h-3.5" />
            Graph
          </Button>
          <Button 
            variant={currentMode === 'diff' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => onModeChange('diff')}
            className={cn("h-7 text-xs gap-1.5", 
              currentMode !== 'diff' && "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700",
              currentMode === 'diff' && "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:hover:bg-orange-900/60"
            )}
            title="Compare API responses"
          >
            <GitCompare className="w-3.5 h-3.5" />
            Diff
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="w-8 h-8 rounded-full dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
        {isValid === true && (
          <span className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Valid
            {jsonSize !== undefined && (
              <>
                <span className="w-0.5 h-3 bg-green-200 dark:bg-green-800" />
                <span className="text-green-600/80 dark:text-green-400/80">{formatSize(jsonSize)}</span>
              </>
            )}
            {isSchemaActive && (
              <>
                <span className="w-0.5 h-3 bg-green-200 dark:bg-green-800" />
                <span className="text-green-600/80 dark:text-green-400/80">Schema</span>
              </>
            )}
          </span>
        )}
        {isValid === false && (
          <span className="flex items-center gap-2 text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorCount} Error{errorCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
