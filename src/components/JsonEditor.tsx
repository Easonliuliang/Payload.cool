import Editor, { OnMount, OnValidate } from "@monaco-editor/react"
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { getLocation, parseTree, findNodeAtLocation } from "jsonc-parser"
import { SchemaConfig } from "./SchemaSettings"
import debounce from "lodash.debounce"

export interface JsonEditorRef {
  selectPath: (path: (string | number)[]) => void
}

interface JsonEditorProps {
  defaultValue?: string
  value?: string
  onChange?: (value: string | undefined) => void
  onValidate?: (markers: any[]) => void
  onPathChange?: (path: (string | number)[]) => void
  isDark?: boolean
  language?: string
  schemaConfig?: SchemaConfig
}

export const JsonEditor = forwardRef<JsonEditorRef, JsonEditorProps>(({ defaultValue, value, onChange, onValidate, onPathChange, isDark = true, language = "json", schemaConfig }, ref) => {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null)

  useImperativeHandle(ref, () => ({
    selectPath: (path) => {
      const editor = editorRef.current
      if (!editor || language !== 'json') return

      const model = editor.getModel()
      if (!model) return

      const text = model.getValue()
      const root = parseTree(text)
      if (!root) return

      const node = findNodeAtLocation(root, path)
      if (node) {
        const startPos = model.getPositionAt(node.offset)
        const endPos = model.getPositionAt(node.offset + node.length)
        
        const range = {
          startLineNumber: startPos.lineNumber,
          startColumn: startPos.column,
          endLineNumber: endPos.lineNumber,
          endColumn: endPos.column
        }

        editor.setSelection(range)
        editor.revealRangeInCenter(range)
        editor.focus()
      }
    }
  }))

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    
    configureJsonDiagnostics(monaco)

    // Debounced path update to improve selection performance
    const updatePath = debounce((e: any) => {
      if (onPathChange && language === 'json') {
        const model = editor.getModel()
        if (model) {
          const offset = model.getOffsetAt(e.position)
          const text = model.getValue()
          try {
            const location = getLocation(text, offset)
            onPathChange(location.path)
          } catch (err) {
            // Ignore parse errors during typing
          }
        }
      }
    }, 150) // 150ms debounce

    // Track cursor position
    editor.onDidChangeCursorPosition(updatePath)
  }

  const configureJsonDiagnostics = (monaco: Parameters<OnMount>[1]) => {
    const options: any = {
      validate: true,
      allowComments: true,
      trailingCommas: 'ignore',
      schemas: [],
      enableSchemaRequest: true, // Allow downloading schemas from URL
    }

    if (schemaConfig && schemaConfig.type !== 'none') {
      if (schemaConfig.type === 'url' || schemaConfig.type === 'preset') {
        options.schemas.push({
          uri: schemaConfig.type === 'url' ? schemaConfig.url : (schemaConfig as any).url, // Handle preset which might map to url
          fileMatch: ['*'], // Match all files for now, or use specific URI
        })
      } else if (schemaConfig.type === 'json') {
        try {
          const schemaObj = JSON.parse(schemaConfig.content)
          options.schemas.push({
            uri: 'http://myschema/schema.json',
            fileMatch: ['*'],
            schema: schemaObj
          })
        } catch (e) {
          console.error("Invalid Schema JSON", e)
        }
      }
    }

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions(options)
  }

  useEffect(() => {
    if (!monacoRef.current) return
    if (language !== 'json') return
    configureJsonDiagnostics(monacoRef.current)
  }, [language, schemaConfig])

  const handleEditorValidation: OnValidate = (markers) => {
    if (onValidate) {
      const model = editorRef.current?.getModel()
      if (model && language === 'json') {
        const text = model.getValue()
        const enrichedMarkers = markers.map(marker => {
          try {
            const offset = model.getOffsetAt({ 
              lineNumber: marker.startLineNumber, 
              column: marker.startColumn 
            })
            const location = getLocation(text, offset)
            return { ...marker, path: location.path }
          } catch (e) {
            return marker
          }
        })
        onValidate(enrichedMarkers)
      } else {
        onValidate(markers)
      }
    }
  }

  return (
    <div className={`h-full w-full overflow-hidden transition-colors ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
      <Editor
        height="100%"
        path={`file.${language}`}
        defaultLanguage="json"
        language={language}
        defaultValue={defaultValue}
        value={value}
        theme={isDark ? "vs-dark" : "light"}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
        }}
        onMount={handleEditorDidMount}
        onChange={onChange}
        onValidate={handleEditorValidation}
      />
    </div>
  )
})
