'use client'

import { Shield, Plus, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'
import { toArrayOfStrings } from '@/lib/array-normalizers'

interface SecurityCardProps {
  cardId: string
  content?: {
    authentication?: string
    authorization?: string
    encryption?: string
    measures?: string[]
    compliance?: string[]
  }
  onAiClick?: () => void
  onSave?: (content: any) => Promise<void>
}

export function SecurityCard({ cardId, content, onAiClick, onSave }: SecurityCardProps) {
  const [localAuthentication, setLocalAuthentication] = useState(content?.authentication || '')
  const [localAuthorization, setLocalAuthorization] = useState(content?.authorization || '')
  const [localEncryption, setLocalEncryption] = useState(content?.encryption || '')
  const [localMeasures, setLocalMeasures] = useState<string[]>(() =>
    toArrayOfStrings(content?.measures)
  )
  const [localCompliance, setLocalCompliance] = useState<string[]>(() =>
    toArrayOfStrings(content?.compliance)
  )

  const dataToSave = useMemo(
    () => ({
      authentication: localAuthentication.trim(),
      authorization: localAuthorization.trim(),
      encryption: localEncryption.trim(),
      measures: localMeasures.map((m: string) => m.trim()).filter(Boolean),
      compliance: localCompliance.map((c: string) => c.trim()).filter(Boolean),
    }),
    [localAuthentication, localAuthorization, localEncryption, localMeasures, localCompliance]
  )

  useAutosave(dataToSave, { onSave: onSave || (async () => {}), delay: 1500 })

  // Measures handlers
  const addMeasure = () => {
    setLocalMeasures([...localMeasures, ''])
  }

  const removeMeasure = (index: number) => {
    setLocalMeasures(localMeasures.filter((_, i) => i !== index))
  }

  const updateMeasure = (index: number, value: string) => {
    setLocalMeasures(localMeasures.map((m, i) => (i === index ? value : m)))
  }

  // Compliance handlers
  const addCompliance = () => {
    setLocalCompliance([...localCompliance, ''])
  }

  const removeCompliance = (index: number) => {
    setLocalCompliance(localCompliance.filter((_, i) => i !== index))
  }

  const updateCompliance = (index: number, value: string) => {
    setLocalCompliance(localCompliance.map((c, i) => (i === index ? value : c)))
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Segurança"
      icon={Shield}
      stageColor="#E879F9"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        {/* Authentication */}
        <div>
          <label className="block text-sm font-medium mb-1">Autenticação</label>
          <input
            type="text"
            value={localAuthentication}
            onChange={(e) => setLocalAuthentication(e.target.value)}
            placeholder="Ex: JWT, OAuth 2.0, Multi-factor..."
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        {/* Authorization */}
        <div>
          <label className="block text-sm font-medium mb-1">Autorização</label>
          <input
            type="text"
            value={localAuthorization}
            onChange={(e) => setLocalAuthorization(e.target.value)}
            placeholder="Ex: RBAC, ABAC, ACL..."
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        {/* Encryption */}
        <div>
          <label className="block text-sm font-medium mb-1">Criptografia</label>
          <input
            type="text"
            value={localEncryption}
            onChange={(e) => setLocalEncryption(e.target.value)}
            placeholder="Ex: AES-256, TLS 1.3, RSA..."
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        {/* Security Measures */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Medidas de Segurança</label>
            <button
              onClick={addMeasure}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {localMeasures.map((measure, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={measure}
                  onChange={(e) => updateMeasure(idx, e.target.value)}
                  placeholder="Ex: Rate limiting, WAF, DDoS protection..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <button
                  onClick={() => removeMeasure(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Compliance</label>
            <button
              onClick={addCompliance}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {localCompliance.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateCompliance(idx, e.target.value)}
                  placeholder="Ex: LGPD, GDPR, PCI-DSS, HIPAA..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <button
                  onClick={() => removeCompliance(idx)}
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
