import { useEffect, useRef, useState, useCallback } from 'react'

type WorkerStatus = 'idle' | 'working' | 'error'

interface UseJsonWorkerReturn {
  parse: (json: string) => Promise<any>
  stringify: (data: any, space?: number) => Promise<string>
  yamlLoad: (yamlStr: string) => Promise<any>
  yamlDump: (data: any) => Promise<string>
  query: (data: any, query: string) => Promise<any>
  status: WorkerStatus
  error: string | null
}

export function useJsonWorker(): UseJsonWorkerReturn {
  const workerRef = useRef<Worker | null>(null)
  const [status, setStatus] = useState<WorkerStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const pendingPromise = useRef<{
    requestId: number
    resolve: (value: any) => void
    reject: (reason: any) => void
  } | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/json.worker.ts', import.meta.url),
      { type: 'module' }
    )

    workerRef.current.onmessage = (e) => {
      const { requestId, type, data, error, errorCount } = e.data

      if (!pendingPromise.current || pendingPromise.current.requestId !== requestId) {
        return
      }
      
      if (type === 'SUCCESS') {
        setStatus('idle')
        pendingPromise.current?.resolve(data)
      } else if (type === 'ERROR') {
        setStatus('error')
        setError(error)
        const err: any = new Error(error)
        if (typeof errorCount === 'number') err.errorCount = errorCount
        pendingPromise.current?.reject(err)
      }
      
      pendingPromise.current = null
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const execute = useCallback((type: string, payload: any) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'))
        return
      }

      if (pendingPromise.current) {
        // Cancel previous operation if needed, or queue it
        // For now, we'll just reject the previous one
        pendingPromise.current.reject(new Error('Cancelled by new operation'))
      }

      setStatus('working')
      setError(null)
      const requestId = ++requestIdRef.current
      pendingPromise.current = { requestId, resolve, reject }
      
      workerRef.current.postMessage({ requestId, type, payload })
    })
  }, [])

  const parse = useCallback((json: string) => {
    return execute('PARSE', json)
  }, [execute])

  const stringify = useCallback((data: any, space?: number) => {
    return execute('STRINGIFY', { data, space }) as Promise<string>
  }, [execute])

  const yamlLoad = useCallback((yamlStr: string) => {
    return execute('YAML_LOAD', yamlStr)
  }, [execute])

  const yamlDump = useCallback((data: any) => {
    return execute('YAML_DUMP', data) as Promise<string>
  }, [execute])

  const query = useCallback((data: any, q: string) => {
    return execute('QUERY', { data, query: q })
  }, [execute])

  return { parse, stringify, yamlLoad, yamlDump, query, status, error }
}
