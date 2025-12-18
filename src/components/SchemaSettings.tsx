import { useState, useEffect } from 'react'
import { X, Globe, FileJson, Package, Check, AlertCircle } from 'lucide-react'
import { cn } from '../lib/utils'

export type SchemaConfig = 
  | { type: 'none' }
  | { type: 'url', url: string }
  | { type: 'json', content: string }
  | { type: 'preset', name: string, schema: any }

interface SchemaSettingsProps {
  isOpen: boolean
  onClose: () => void
  config: SchemaConfig
  onSave: (config: SchemaConfig) => void
  isDark: boolean
}

const PRESETS = [
  { name: 'OpenAPI 3.0', url: 'https://spec.openapis.org/oas/3.0/schema/2021-09-28' },
  { name: 'JSON Schema Draft 7', url: 'http://json-schema.org/draft-07/schema#' },
  { name: 'GitHub Workflow', url: 'https://json.schemastore.org/github-workflow' },
  { name: 'package.json', url: 'https://json.schemastore.org/package' },
  { name: 'tsconfig.json', url: 'https://json.schemastore.org/tsconfig' },
]

export function SchemaSettings({ isOpen, onClose, config, onSave, isDark }: SchemaSettingsProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'json' | 'preset'>('url')
  const [url, setUrl] = useState('')
  const [jsonContent, setJsonContent] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0].url)

  useEffect(() => {
    if (config.type === 'url') {
      setActiveTab('url')
      setUrl(config.url)
    } else if (config.type === 'json') {
      setActiveTab('json')
      setJsonContent(config.content)
    } else if (config.type === 'preset') {
      setActiveTab('preset')
      // preset logic if we stored it
    }
  }, [config, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    if (activeTab === 'url') {
      if (!url.trim()) return
      
      // Basic URL Validation
      try {
        new URL(url.trim())
      } catch (e) {
        alert('Invalid URL format')
        return
      }

      // Optional: Check if URL is reachable (HEAD request)
      // This is a "nice to have" check, not blocking because of CORS potentially
      // We mainly rely on Monaco's internal fetch, but we can warn the user.
      
      onSave({ type: 'url', url: url.trim() })
    } else if (activeTab === 'json') {
      try {
        JSON.parse(jsonContent)
        onSave({ type: 'json', content: jsonContent })
      } catch (e) {
        alert('Invalid JSON Schema')
        return
      }
    } else if (activeTab === 'preset') {
      onSave({ type: 'url', url: selectedPreset })
    }
    onClose()
  }

  const handleClear = () => {
    onSave({ type: 'none' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-lg rounded-lg shadow-xl border overflow-hidden flex flex-col max-h-[90vh]",
        isDark ? "bg-[#1e1e1e] border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <h3 className="font-semibold flex items-center gap-2">
            <Package className="w-4 h-4" />
            JSON Schema Validation
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex space-x-1 mb-4 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('url')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === 'url' 
                  ? "bg-white dark:bg-[#1e1e1e] shadow-sm text-blue-600 dark:text-blue-400" 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              <Globe className="w-4 h-4" />
              URL
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === 'json' 
                  ? "bg-white dark:bg-[#1e1e1e] shadow-sm text-blue-600 dark:text-blue-400" 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              <FileJson className="w-4 h-4" />
              Paste JSON
            </button>
            <button
              onClick={() => setActiveTab('preset')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === 'preset' 
                  ? "bg-white dark:bg-[#1e1e1e] shadow-sm text-blue-600 dark:text-blue-400" 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              <Package className="w-4 h-4" />
              Presets
            </button>
          </div>

          <div className="mt-4">
            {activeTab === 'url' && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Schema URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/schema.json"
                  className={cn(
                    "w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-2 focus:ring-blue-500",
                    isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
                  )}
                />
                <p className="text-xs text-zinc-500">
                  Enter the public URL of a JSON Schema to validate against.
                </p>
              </div>
            )}

            {activeTab === 'json' && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Schema JSON
                </label>
                <textarea
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  placeholder={'{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "type": "object",\n  "properties": { ... }\n}'}
                  className={cn(
                    "w-full h-48 px-3 py-2 rounded-md border text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500 resize-none",
                    isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
                  )}
                />
              </div>
            )}

            {activeTab === 'preset' && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Quick Presets
                </label>
                <div className="space-y-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setSelectedPreset(preset.url)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-colors",
                        selectedPreset === preset.url
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      )}
                    >
                      <span>{preset.name}</span>
                      {selectedPreset === preset.url && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t dark:border-zinc-800 flex justify-between">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            Disable Validation
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
            >
              Apply Schema
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
