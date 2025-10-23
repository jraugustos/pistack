'use client'

import { Globe, Plus, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface EndpointItem {
  method?: string
  path?: string
  description?: string
  requestBody?: string
  responseBody?: string
}

interface ApiDesignCardProps {
  cardId: string
  content?: {
    architecture?: string
    authentication?: string
    endpoints?: EndpointItem[]
  }
  onAiClick?: () => void
  onSave?: (content: any) => Promise<void>
}

function toEndpointArray(input: unknown): EndpointItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((i) =>
      typeof i === 'string'
        ? { method: 'GET', path: i, description: '', requestBody: '', responseBody: '' }
        : {
            method: i?.method || 'GET',
            path: i?.path || '',
            description: i?.description || '',
            requestBody: i?.requestBody || '',
            responseBody: i?.responseBody || '',
          }
    )
  }
  return []
}

export function ApiDesignCard({ cardId, content, onAiClick, onSave }: ApiDesignCardProps) {
  const [localArchitecture, setLocalArchitecture] = useState(content?.architecture || '')
  const [localAuthentication, setLocalAuthentication] = useState(content?.authentication || '')
  const [localEndpoints, setLocalEndpoints] = useState<EndpointItem[]>(() =>
    toEndpointArray(content?.endpoints)
  )

  const dataToSave = useMemo(
    () => ({
      architecture: localArchitecture.trim(),
      authentication: localAuthentication.trim(),
      endpoints: localEndpoints
        .map((e: EndpointItem) => ({
          method: e.method?.trim() || 'GET',
          path: e.path?.trim() || '',
          description: e.description?.trim() || '',
          requestBody: e.requestBody?.trim() || '',
          responseBody: e.responseBody?.trim() || '',
        }))
        .filter((e: EndpointItem) => e.path),
    }),
    [localArchitecture, localAuthentication, localEndpoints]
  )

  useAutosave(dataToSave, { onSave: onSave || (async () => {}), delay: 1500 })

  const addEndpoint = () => {
    setLocalEndpoints([
      ...localEndpoints,
      { method: 'GET', path: '', description: '', requestBody: '', responseBody: '' },
    ])
  }

  const removeEndpoint = (index: number) => {
    setLocalEndpoints(localEndpoints.filter((_, i) => i !== index))
  }

  const updateEndpoint = (index: number, field: keyof EndpointItem, value: string) => {
    setLocalEndpoints(localEndpoints.map((e, i) => (i === index ? { ...e, [field]: value } : e)))
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Design de API"
      icon={Globe}
      stageColor="#E879F9"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        {/* Architecture */}
        <div>
          <label className="block text-sm font-medium mb-1">Arquitetura</label>
          <select
            value={localArchitecture}
            onChange={(e) => setLocalArchitecture(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Selecione...</option>
            <option value="REST">REST</option>
            <option value="GraphQL">GraphQL</option>
            <option value="gRPC">gRPC</option>
            <option value="WebSocket">WebSocket</option>
            <option value="Híbrido">Híbrido</option>
          </select>
        </div>

        {/* Authentication */}
        <div>
          <label className="block text-sm font-medium mb-1">Autenticação</label>
          <input
            type="text"
            value={localAuthentication}
            onChange={(e) => setLocalAuthentication(e.target.value)}
            placeholder="Ex: JWT, OAuth 2.0, API Key..."
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        {/* Endpoints */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Endpoints</label>
            <button
              onClick={addEndpoint}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>

          <div className="space-y-3">
            {localEndpoints.map((endpoint, idx) => (
              <div key={idx} className="border rounded-md p-3 bg-gray-50 space-y-2">
                <div className="flex items-start gap-2">
                  <select
                    value={endpoint.method || 'GET'}
                    onChange={(e) => updateEndpoint(idx, 'method', e.target.value)}
                    className="px-2 py-1 border rounded text-xs font-mono font-bold"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <input
                    type="text"
                    value={endpoint.path || ''}
                    onChange={(e) => updateEndpoint(idx, 'path', e.target.value)}
                    placeholder="/api/resource"
                    className="flex-1 px-2 py-1 border rounded text-sm font-mono"
                  />
                  <button
                    onClick={() => removeEndpoint(idx)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={endpoint.description || ''}
                  onChange={(e) => updateEndpoint(idx, 'description', e.target.value)}
                  placeholder="Descrição do endpoint"
                  className="w-full px-2 py-1 border rounded text-sm"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Request Body
                    </label>
                    <textarea
                      value={endpoint.requestBody || ''}
                      onChange={(e) => updateEndpoint(idx, 'requestBody', e.target.value)}
                      placeholder='{"key": "value"}'
                      className="w-full px-2 py-1 border rounded text-xs font-mono resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Response Body
                    </label>
                    <textarea
                      value={endpoint.responseBody || ''}
                      onChange={(e) => updateEndpoint(idx, 'responseBody', e.target.value)}
                      placeholder='{"status": "ok"}'
                      className="w-full px-2 py-1 border rounded text-xs font-mono resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseCard>
  )
}
