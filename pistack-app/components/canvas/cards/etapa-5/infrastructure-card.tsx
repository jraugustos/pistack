'use client'

import { Server, Plus, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'
import { toArrayOfStrings } from '@/lib/array-normalizers'

interface InfrastructureCardProps {
  cardId: string
  content?: {
    hosting?: string
    cicd?: string
    monitoring?: string[]
    logging?: string[]
    deployment?: string
  }
  onAiClick?: () => void
  onSave?: (content: any) => Promise<void>
}

export function InfrastructureCard({ cardId, content, onAiClick, onSave }: InfrastructureCardProps) {
  const [localHosting, setLocalHosting] = useState(content?.hosting || '')
  const [localCicd, setLocalCicd] = useState(content?.cicd || '')
  const [localMonitoring, setLocalMonitoring] = useState<string[]>(() =>
    toArrayOfStrings(content?.monitoring)
  )
  const [localLogging, setLocalLogging] = useState<string[]>(() =>
    toArrayOfStrings(content?.logging)
  )
  const [localDeployment, setLocalDeployment] = useState(content?.deployment || '')

  const dataToSave = useMemo(
    () => ({
      hosting: localHosting.trim(),
      cicd: localCicd.trim(),
      monitoring: localMonitoring.map((m: string) => m.trim()).filter(Boolean),
      logging: localLogging.map((l: string) => l.trim()).filter(Boolean),
      deployment: localDeployment.trim(),
    }),
    [localHosting, localCicd, localMonitoring, localLogging, localDeployment]
  )

  useAutosave(dataToSave, { onSave: onSave || (async () => {}), delay: 1500 })

  // Monitoring handlers
  const addMonitoring = () => {
    setLocalMonitoring([...localMonitoring, ''])
  }

  const removeMonitoring = (index: number) => {
    setLocalMonitoring(localMonitoring.filter((_, i) => i !== index))
  }

  const updateMonitoring = (index: number, value: string) => {
    setLocalMonitoring(localMonitoring.map((m, i) => (i === index ? value : m)))
  }

  // Logging handlers
  const addLogging = () => {
    setLocalLogging([...localLogging, ''])
  }

  const removeLogging = (index: number) => {
    setLocalLogging(localLogging.filter((_, i) => i !== index))
  }

  const updateLogging = (index: number, value: string) => {
    setLocalLogging(localLogging.map((l, i) => (i === index ? value : l)))
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Infraestrutura"
      icon={Server}
      stageColor="#E879F9"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        {/* Hosting */}
        <div>
          <label className="block text-sm font-medium mb-1">Hosting</label>
          <input
            type="text"
            value={localHosting}
            onChange={(e) => setLocalHosting(e.target.value)}
            placeholder="Ex: AWS, Google Cloud, Vercel, Heroku..."
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        {/* CI/CD */}
        <div>
          <label className="block text-sm font-medium mb-1">CI/CD</label>
          <input
            type="text"
            value={localCicd}
            onChange={(e) => setLocalCicd(e.target.value)}
            placeholder="Ex: GitHub Actions, GitLab CI, Jenkins..."
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        {/* Deployment */}
        <div>
          <label className="block text-sm font-medium mb-1">Estratégia de Deploy</label>
          <select
            value={localDeployment}
            onChange={(e) => setLocalDeployment(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Selecione...</option>
            <option value="Rolling">Rolling Deployment</option>
            <option value="Blue-Green">Blue-Green Deployment</option>
            <option value="Canary">Canary Deployment</option>
            <option value="Manual">Manual Deployment</option>
          </select>
        </div>

        {/* Monitoring */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Monitoramento</label>
            <button
              onClick={addMonitoring}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {localMonitoring.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateMonitoring(idx, e.target.value)}
                  placeholder="Ex: Datadog, New Relic, Prometheus..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <button
                  onClick={() => removeMonitoring(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Logging */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Logging</label>
            <button
              onClick={addLogging}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {localLogging.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateLogging(idx, e.target.value)}
                  placeholder="Ex: CloudWatch, Splunk, ELK Stack..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <button
                  onClick={() => removeLogging(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseCard>
  )
}
