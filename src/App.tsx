import { useState, useCallback, useEffect, useRef } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { AlertCircle, Shield, Lock, Zap } from 'lucide-react'
import { JsonEditor, JsonEditorRef } from './components/JsonEditor'
import { Toolbar, ViewMode } from './components/Toolbar'
import { QueryBar } from './components/QueryBar'
import { TreeView } from './components/TreeView'
import { DiffView } from './components/DiffView'
import { GraphView } from './components/GraphView'
import { Breadcrumbs } from './components/Breadcrumbs'
import { SchemaSettings, SchemaConfig } from './components/SchemaSettings'
import { useJsonWorker } from './hooks/useJsonWorker'
import { useLocalStorage } from './hooks/useLocalStorage'
import { APP_NAME } from './constants'
import yaml from 'js-yaml'
import Papa from 'papaparse'

const DEFAULT_JSON = `// Paste JSON here
// ✔ No upload  ✔ Schema validation  ✔ Large files supported

{
  "name": "${APP_NAME}",
  "version": "1.0.0",
  "features": [
    "Privacy-first",
    "Offline capable",
    "Fast formatting"
  ]
}`

function App() {
  const [jsonContent, setJsonContent] = useState(DEFAULT_JSON)
  const [viewMode, setViewMode] = useState<ViewMode>('code')
  const [isValid, setIsValid] = useState<boolean | null>(true)
  const [errorCount, setErrorCount] = useState(0)
  const [editorLanguage, setEditorLanguage] = useState<string>('json')
  const [currentPath, setCurrentPath] = useState<(string | number)[]>([])
  
  // Schema State
  const [schemaConfig, setSchemaConfig] = useState<SchemaConfig>({ type: 'none' })
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<any[]>([])

  // Calculate JSON size
  const jsonSize = new TextEncoder().encode(jsonContent).length
  
  // For Diff Mode
  const [diffOriginal, setDiffOriginal] = useLocalStorage('diffOriginal', DEFAULT_JSON)
  
  // Theme State
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')
  const isDark = theme === 'dark'

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [setTheme])

  // Worker
  const { parse, stringify, query } = useJsonWorker()
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [filteredData, setFilteredData] = useState<any>(null)
  const parseRunIdRef = useRef(0)
  const editorRef = useRef<JsonEditorRef>(null)

  // Debounced parsing
  useEffect(() => {
    const runId = ++parseRunIdRef.current
    const timer = setTimeout(async () => {
      try {
        if (runId !== parseRunIdRef.current) return

        if (!jsonContent.trim()) {
          setParsedJson(null)
          setIsValid(true)
          setErrorCount(0)
          return
        }

        if (editorLanguage === 'json') {
          const result = await parse(jsonContent)
          if (runId !== parseRunIdRef.current) return
          setParsedJson(result)
          setIsValid(true)
          setErrorCount(0)
        } else if (editorLanguage === 'yaml') {
          // Attempt to parse YAML to check validity and update TreeView
          const result = yaml.load(jsonContent)
          if (runId !== parseRunIdRef.current) return
          setParsedJson(result)
          setIsValid(true)
          setErrorCount(0)
        } else if (editorLanguage === 'csv') {
          // Parse CSV to JSON for validation and other features
          const result = Papa.parse(jsonContent, { 
            header: true, 
            dynamicTyping: true, 
            skipEmptyLines: true 
          })
          
          if (result.errors.length === 0) {
            if (runId !== parseRunIdRef.current) return
            setParsedJson(result.data)
            setIsValid(true)
            setErrorCount(0)
          } else {
            if (runId !== parseRunIdRef.current) return
            setParsedJson(null)
            setIsValid(false)
            setErrorCount(result.errors.length)
          }
        } else {
          // Other formats
          if (runId !== parseRunIdRef.current) return
          setParsedJson(null)
          setIsValid(true)
          setErrorCount(0)
        }
      } catch (e: any) {
        if (runId !== parseRunIdRef.current) return
        if (e instanceof Error && e.message === 'Cancelled by new operation') return
        setParsedJson(null)
        // Only set invalid if we are in a mode that supports validation
        if (editorLanguage === 'json' || editorLanguage === 'yaml') {
          setIsValid(false)
          setErrorCount(typeof e?.errorCount === 'number' ? e.errorCount : 1)
        } else {
          setIsValid(true)
          setErrorCount(0)
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [jsonContent, parse, editorLanguage])

  const handleEditorChange = useCallback((value: string | undefined) => {
    setJsonContent(value || '')
  }, [])

  const handlePathChange = useCallback((path: (string | number)[]) => {
    setCurrentPath(path)
  }, [])

  const handleBreadcrumbClick = useCallback((path: (string | number)[]) => {
    editorRef.current?.selectPath(path)
  }, [])

  const handleQuery = useCallback(async (q: string) => {
    if (!parsedJson) return
    
    if (!q.trim()) {
      setFilteredData(null)
      return
    }

    try {
      const result = await query(parsedJson, q)
      setFilteredData(result)
    } catch (e) {
      console.error("Query error:", e)
      setFilteredData(null)
    }
  }, [parsedJson, query])

  const handleValidate = useCallback((markers: any[]) => {
    // Only use Monaco's validation for JSON mode
    // For YAML/CSV, we rely on the parser in useEffect because Monaco doesn't have built-in validation for them
    if (editorLanguage === 'json') {
      setIsValid(markers.length === 0)
      setErrorCount(markers.length)
      setValidationErrors(markers)
    }
  }, [editorLanguage])

  const handleFormat = async () => {
    try {
      if (!parsedJson) return
      const formatted = await stringify(parsedJson, 2)
      setJsonContent(formatted)
      setEditorLanguage('json')
    } catch (e) {
      console.error("Format error:", e)
    }
  }

  const handleMinify = async () => {
    try {
      if (!parsedJson) return
      const minified = await stringify(parsedJson)
      setJsonContent(minified)
      setEditorLanguage('json')
    } catch (e) {
      console.error("Minify error:", e)
    }
  }

  const handleConvertToYaml = async () => {
    try {
      if (!parsedJson) return
      const yamlStr = await yamlDump(parsedJson)
      setJsonContent(yamlStr)
      setEditorLanguage('yaml')
    } catch (e) {
      console.error("YAML conversion error:", e)
    }
  }

  const handleConvertToCsv = () => {
    try {
      if (!parsedJson) return
      const dataToConvert = Array.isArray(parsedJson) ? parsedJson : [parsedJson]
      // Flatten nested objects to prevent [object Object] in CSV
      const flattenedData = dataToConvert.map(item => flatten(item))
      const csvStr = Papa.unparse(flattenedData)
      setJsonContent(csvStr)
      setEditorLanguage('csv')
    } catch (e) {
      console.error("CSV conversion error:", e)
    }
  }

  // Diff Handlers
  const handleSetDiffOriginal = () => {
    setDiffOriginal(jsonContent)
  }

  const handleSwapDiff = () => {
    const temp = diffOriginal
    setDiffOriginal(jsonContent)
    setJsonContent(temp)
  }

  const handleImport = (content: string) => {
    setJsonContent(content)
  }

  const handleExport = () => {
    let mimeType = 'application/json'
    let extension = 'json'

    if (editorLanguage === 'yaml') {
      mimeType = 'text/yaml'
      extension = 'yaml'
    } else if (editorLanguage === 'csv') {
      mimeType = 'text/csv'
      extension = 'csv'
    }

    const blob = new Blob([jsonContent], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'code':
        return (
          <JsonEditor 
            ref={editorRef}
            value={jsonContent}
            onChange={handleEditorChange}
            onValidate={handleValidate}
            onPathChange={handlePathChange}
            isDark={isDark}
            language={editorLanguage}
            schemaConfig={schemaConfig}
          />
        )
      case 'tree':
        return parsedJson ? (
          <TreeView data={filteredData || parsedJson} isDark={isDark} />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 bg-zinc-50 dark:bg-[#1e1e1e] dark:text-zinc-400 rounded-md border dark:border-zinc-800">
            {isValid === false ? "Invalid Data" : "Processing..."}
          </div>
        )
      case 'split':
        return (
          <PanelGroup direction="horizontal">
            <Panel defaultSize={50} minSize={20}>
              <JsonEditor 
                ref={editorRef}
                value={jsonContent}
                onChange={handleEditorChange}
                onValidate={handleValidate}
                isDark={isDark}
                language={editorLanguage}
                schemaConfig={schemaConfig}
              />
            </Panel>
            <PanelResizeHandle className="w-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1e1e1e] dark:hover:bg-zinc-800 transition-colors flex items-center justify-center">
              <div className="h-8 w-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
            </PanelResizeHandle>
            <Panel defaultSize={50} minSize={20}>
              {parsedJson ? (
                <TreeView data={filteredData || parsedJson} className="rounded-none border-0" isDark={isDark} />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500 bg-zinc-50 dark:bg-[#1e1e1e] dark:text-zinc-400">
                   {isValid === false ? "Invalid Data" : "Processing..."}
                </div>
              )}
            </Panel>
          </PanelGroup>
        )
      case 'diff':
        return (
          <DiffView 
            original={diffOriginal} 
            modified={jsonContent} 
            onOriginalChange={setDiffOriginal}
            onModifiedChange={(value) => setJsonContent(value)}
            isDark={isDark}
            language={editorLanguage}
          />
        )
      case 'graph':
        return parsedJson ? (
          <GraphView 
            data={filteredData || parsedJson} 
            isDark={isDark} 
            validationErrors={schemaConfig.type !== 'none' ? validationErrors : []}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 bg-zinc-50 dark:bg-[#1e1e1e] dark:text-zinc-400 rounded-md border dark:border-zinc-800">
            {isValid === false ? "Invalid Data" : "Processing..."}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans transition-colors">
      <header className="bg-white dark:bg-[#18181b] border-b dark:border-zinc-800 px-6 py-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-blue-200 dark:shadow-none">
            J
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              {APP_NAME}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <a href="https://github.com/eason/jason.cool/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            v1.0.0
          </a>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-help" title="Your data never leaves your browser">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Local-only</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-help" title="No server-side processing or storage">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            <span>No Upload</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-help" title="High performance processing">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Runs in Browser</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex flex-col gap-4">
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm border dark:border-zinc-800 overflow-hidden transition-colors">
          <Toolbar 
            onFormat={handleFormat}
            onMinify={handleMinify}
            onModeChange={setViewMode}
            currentMode={viewMode}
            isValid={isValid}
            errorCount={errorCount}
            onConvertToYaml={handleConvertToYaml}
            onConvertToCsv={handleConvertToCsv}
            onSetDiffOriginal={handleSetDiffOriginal}
            onSwapDiff={handleSwapDiff}
            onImport={handleImport}
            onExport={handleExport}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onSchemaClick={() => setIsSchemaModalOpen(true)}
            isSchemaActive={schemaConfig.type !== 'none'}
            jsonSize={jsonSize}
          />
          
          {(viewMode === 'tree' || viewMode === 'split' || viewMode === 'graph') && (
            <QueryBar onQuery={handleQuery} isDark={isDark} />
          )}

          {/* Validation Errors Panel */}
          {validationErrors.length > 0 && schemaConfig.type !== 'none' && (
            <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2 max-h-32 overflow-y-auto flex-shrink-0">
              <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-300 font-medium text-xs uppercase tracking-wider sticky top-0 bg-red-50 dark:bg-[#2a1515] py-1 z-10">
                <AlertCircle className="w-3 h-3" />
                Validation Errors ({validationErrors.length})
              </div>
              <div className="space-y-1">
                {validationErrors.map((error, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                       if (error.path) {
                         editorRef.current?.selectPath(error.path)
                       }
                    }}
                    className="w-full text-left text-xs font-mono flex items-start gap-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors group"
                  >
                    <span className="text-red-500 dark:text-red-400 shrink-0 mt-0.5 font-semibold group-hover:underline">
                      {error.path ? (Array.isArray(error.path) ? `$.${error.path.join('.')}` : `$.${String(error.path)}`) : `Line ${error.startLineNumber}`}
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-300 truncate">
                      {error.message}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex-1 relative overflow-hidden">
            {renderContent()}
          </div>
          
          <Breadcrumbs 
            path={currentPath} 
            onPathClick={handleBreadcrumbClick}
            className="border-t dark:border-zinc-800"
          />
          
          {/* Privacy Footer & Roadmap Link */}
          <div className="bg-zinc-50 dark:bg-[#18181b] border-t dark:border-zinc-800 py-1 flex items-center justify-between px-4">
             <div className="flex-1 text-center">
                <p className="text-xs text-zinc-400 dark:text-zinc-600 font-medium hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors cursor-default">
                  All processing happens locally. Your data never leaves your browser.
                </p>
             </div>
             <div className="text-[10px] text-zinc-300 dark:text-zinc-700">
               Coming in v1.1: Generate Example Data
             </div>
          </div>
        </div>
      </main>
      
      <SchemaSettings 
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        config={schemaConfig}
        onSave={setSchemaConfig}
        isDark={isDark}
      />
    </div>
  )
}

export default App
