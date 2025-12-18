import { DiffEditor as MonacoDiffEditor } from "@monaco-editor/react"
import { useRef } from "react"

interface DiffViewProps {
  original: string
  modified: string
  language?: string
  onOriginalChange?: (value: string) => void
  onModifiedChange?: (value: string) => void
  isDark?: boolean
}

export function DiffView({ 
  original, 
  modified, 
  language = "json",
  onOriginalChange,
  onModifiedChange,
  isDark = true
}: DiffViewProps) {
  const diffEditorRef = useRef<any>(null)

  function handleEditorDidMount(editor: any) {
    diffEditorRef.current = editor
    
    // Listen to changes in the original model
    const originalModel = editor.getModel().original
    originalModel.onDidChangeContent(() => {
      if (onOriginalChange) {
        onOriginalChange(originalModel.getValue())
      }
    })

    // Listen to changes in the modified model
    const modifiedModel = editor.getModel().modified
    modifiedModel.onDidChangeContent(() => {
      if (onModifiedChange) {
        onModifiedChange(modifiedModel.getValue())
      }
    })
  }

  return (
    <div className={`h-full w-full border rounded-md overflow-hidden transition-colors ${isDark ? 'bg-[#1e1e1e] border-zinc-800' : 'bg-white border-zinc-200'}`}>
      <MonacoDiffEditor
        height="100%"
        language={language}
        original={original}
        modified={modified}
        theme={isDark ? "vs-dark" : "light"}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          renderSideBySide: true,
          scrollBeyondLastLine: false,
          originalEditable: true, // Allow editing original
          readOnly: false,       // Allow editing modified
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  )
}
