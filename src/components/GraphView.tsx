import { useEffect, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
// @ts-ignore
import dagre from 'dagre'
import { cn } from '../lib/utils'

interface GraphViewProps {
  data: any
  isDark: boolean
  className?: string
  validationErrors?: any[]
}

const nodeWidth = 172
const nodeHeight = 36

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  try {
    // Handle different import styles for dagre (CommonJS vs ES Modules)
    const graphlib = dagre.graphlib || (dagre as any).default?.graphlib
    
    if (!graphlib) {
      console.warn("Dagre graphlib not found, falling back to simple layout")
      throw new Error("Dagre layout engine not found")
    }

    const dagreGraph = new graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    dagreGraph.setGraph({ rankdir: 'LR' })

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
    })

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)
      node.targetPosition = Position.Left
      node.sourcePosition = Position.Right

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      }

      return node
    })

    return { nodes, edges }
  } catch (error) {
    console.error("Layout calculation failed:", error)
    // Fallback: return nodes without layout (all at 0,0) or simple grid
    // For now, we just return them as is, they will stack but won't crash
    return { nodes, edges }
  }
}

const generateGraphFromJSON = (data: any) => {
  const nodes: Node[] = []
  const edges: Edge[] = []
  let nodeId = 0

  const traverse = (obj: any, parentId?: string, label: string = 'root', path: (string | number)[] = []) => {
    const currentId = `${nodeId++}`
    const isObject = typeof obj === 'object' && obj !== null
    const isArray = Array.isArray(obj)
    
    let displayLabel = label
    let type = typeof obj
    
    if (isArray) type = `array[${obj.length}]`
    else if (obj === null) type = 'null'
    
    // For primitive values, show the value
    let valueStr = ''
    if (!isObject) {
      valueStr = String(obj)
      if (valueStr.length > 20) valueStr = valueStr.substring(0, 20) + '...'
    }

    // Determine styling based on type
    let borderColor = 'border-zinc-200 dark:border-zinc-700'
    let bgColor = 'bg-white dark:bg-[#1e1e1e]'
    
    if (isObject) {
       borderColor = isArray ? 'border-orange-300 dark:border-orange-800' : 'border-blue-300 dark:border-blue-800'
       bgColor = isArray ? 'bg-orange-50/50 dark:bg-orange-900/20' : 'bg-blue-50/50 dark:bg-blue-900/20'
    } else {
       borderColor = 'border-emerald-300 dark:border-emerald-800'
       bgColor = 'bg-emerald-50/50 dark:bg-emerald-900/20'
    }

    nodes.push({
      id: currentId,
      data: { 
        label: (
          <div className="flex flex-col gap-1">
            <div className="font-bold text-xs truncate flex items-center gap-2" title={label}>
              {label}
              {isArray && <span className="text-[9px] px-1 rounded bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">Arr</span>}
              {isObject && !isArray && <span className="text-[9px] px-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Obj</span>}
            </div>
            <div className="text-[10px] text-zinc-500 truncate flex justify-between items-center">
              <span className="opacity-70">{type}</span>
              {valueStr && <span className="text-emerald-600 dark:text-emerald-400 font-mono ml-2 bg-emerald-100/50 dark:bg-emerald-900/50 px-1 rounded">{valueStr}</span>}
            </div>
          </div>
        ),
        path: path // Store the JSON path
      },
      position: { x: 0, y: 0 },
      style: { 
        width: nodeWidth, 
        fontSize: '12px',
        padding: '8px',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'inherit', // Will be set by class
      },
      className: cn("shadow-sm transition-colors", borderColor, bgColor, "dark:text-zinc-200")
    })

    if (parentId) {
      edges.push({
        id: `e${parentId}-${currentId}`,
        source: parentId,
        target: currentId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#94a3b8' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        },
      })
    }

    if (isObject) {
      Object.entries(obj).forEach(([key, value]) => {
        // Limit recursion for massive objects to prevent crashes
        if (nodes.length < 500 && path.length < 50) { // Limit depth to 50
          // Construct new path: if array, key is index (number), else string
          const nextPath = [...path, isArray ? parseInt(key) : key]
          traverse(value, currentId, key, nextPath)
        }
      })
    }
  }

  traverse(data)
  return getLayoutedElements(nodes, edges)
}

export function GraphView({ data, isDark, className, validationErrors }: GraphViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isTooLarge, setIsTooLarge] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!data) return

    try {
      // Simple check to prevent freezing with huge JSONs
      const jsonString = JSON.stringify(data)
      if (jsonString.length > 50000) { // Approx 50KB limit for auto-graph
         setIsTooLarge(true)
         return
      }
      
      setIsTooLarge(false)
      const { nodes: layoutedNodes, edges: layoutedEdges } = generateGraphFromJSON(data)
      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
      setError(null)
    } catch (e: any) {
      console.error("Graph generation error:", e)
      setError(e.message)
    }
  }, [data, setNodes, setEdges])

  // Update nodes when validation errors change
  useEffect(() => {
    if (!nodes.length) return

    setNodes((nds) => nds.map((node) => {
      const nodePathStr = JSON.stringify(node.data.path)
      const hasError = validationErrors?.some((err: any) => JSON.stringify(err.path) === nodePathStr)
      
      if (hasError) {
        return {
          ...node,
          style: {
            ...node.style,
            borderColor: '#ef4444',
            borderWidth: '2px',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)'
          }
        }
      } else {
        const newStyle = { ...node.style }
        // Remove error styles if they exist (simple check)
        if (newStyle.borderColor === '#ef4444') {
            delete newStyle.borderColor
            delete newStyle.borderWidth
            delete newStyle.boxShadow
        }
        return {
          ...node,
          style: newStyle
        }
      }
    }))
  }, [validationErrors, setNodes]) // We don't include nodes in dependency to avoid loop, but we check nodes.length


  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-zinc-50 dark:bg-[#1e1e1e] text-red-500", className)}>
        <div className="text-center p-4">
          <p className="font-bold">Error generating graph</p>
          <p className="text-xs mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (isTooLarge) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-zinc-50 dark:bg-[#1e1e1e] text-zinc-500 dark:text-zinc-400", className)}>
        <div className="text-center p-4">
          <p className="mb-2">JSON is too large for Graph View</p>
          <p className="text-xs opacity-70">Try using Tree or Code view for better performance</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("h-full w-full bg-zinc-50 dark:bg-[#09090b]", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        className={cn(isDark ? "dark-flow" : "")}
        minZoom={0.1}
      >
        <Background color={isDark ? '#3f3f46' : '#e4e4e7'} gap={16} />
        <Controls className="dark:bg-[#1e1e1e] dark:border-zinc-700 dark:fill-zinc-400" />
      </ReactFlow>
    </div>
  )
}
