import { parse, printParseErrorCode, type ParseError } from 'jsonc-parser'
import yaml from 'js-yaml'
import jmespath from 'jmespath'

type WorkerRequest =
  | { requestId: number; type: 'PARSE'; payload: string }
  | { requestId: number; type: 'STRINGIFY'; payload: { data: any; space?: number } }
  | { requestId: number; type: 'YAML_LOAD'; payload: string }
  | { requestId: number; type: 'YAML_DUMP'; payload: any }
  | { requestId: number; type: 'QUERY'; payload: { data: any; query: string } }

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { requestId, type, payload } = e.data

  try {
    switch (type) {
      case 'PARSE': {
        const errors: ParseError[] = []
        const parsed = parse(payload, errors, {
          allowTrailingComma: true,
          disallowComments: false,
          allowEmptyContent: false,
        })

        if (errors.length > 0) {
          self.postMessage({
            requestId,
            type: 'ERROR',
            error: `Parse error: ${printParseErrorCode(errors[0].error)}`,
            errorCount: errors.length,
          })
          break
        }

        self.postMessage({ requestId, type: 'SUCCESS', data: parsed })
        break
      }
      
      case 'STRINGIFY': {
        const stringified = JSON.stringify(payload.data, null, payload.space)
        self.postMessage({ requestId, type: 'SUCCESS', data: stringified })
        break
      }

      case 'YAML_LOAD': {
        const parsed = yaml.load(payload)
        self.postMessage({ requestId, type: 'SUCCESS', data: parsed })
        break
      }

      case 'YAML_DUMP': {
        const dumped = yaml.dump(payload)
        self.postMessage({ requestId, type: 'SUCCESS', data: dumped })
        break
      }

      case 'QUERY': {
        const result = jmespath.search(payload.data, payload.query)
        self.postMessage({ requestId, type: 'SUCCESS', data: result })
        break
      }

      default:
        throw new Error(`Unknown message type: ${(type as any)}`)
    }
  } catch (error: any) {
    self.postMessage({
      requestId,
      type: 'ERROR',
      error: error.message,
      errorCount: 1,
    })
  }
}
