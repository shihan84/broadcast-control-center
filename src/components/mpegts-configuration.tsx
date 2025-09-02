"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  Play, 
  Copy, 
  Download, 
  Upload,
  Plus,
  Save,
  RotateCcw,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { MPEGTSConfig, MPEGTS_PRESETS, FFmpegCommandBuilder } from '@/lib/services/mpegts-config'

interface MPEGTSConfigProps {
  config?: MPEGTSConfig
  onChange: (config: MPEGTSConfig) => void
  onGenerateCommand?: (command: string) => void
}

export function MPEGTSConfiguration({ config, onChange, onGenerateCommand }: MPEGTSConfigProps) {
  const [localConfig, setLocalConfig] = useState<MPEGTSConfig>(config || {})
  const [showCommandDialog, setShowCommandDialog] = useState(false)
  const [generatedCommand, setGeneratedCommand] = useState('')

  const updateConfig = (updates: Partial<MPEGTSConfig>) => {
    const newConfig = { ...localConfig, ...updates }
    setLocalConfig(newConfig)
    onChange(newConfig)
  }

  const applyPreset = (preset: () => MPEGTSConfig) => {
    const newConfig = preset()
    setLocalConfig(newConfig)
    onChange(newConfig)
  }

  const generateFFmpegCommand = () => {
    const builder = FFmpegCommandBuilder.create()
      .withInput('input.mp4') // Placeholder
      .withMPEGTSConfig(localConfig)
      .withOutput('output.ts') // Placeholder
    
    const command = builder.build()
    setGeneratedCommand(command)
    setShowCommandDialog(true)
    
    if (onGenerateCommand) {
      onGenerateCommand(command)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const flags = localConfig.mpegts_flags || []
  const addFlag = (flag: string) => {
    if (!flags.includes(flag)) {
      updateConfig({ mpegts_flags: [...flags, flag] })
    }
  }

  const removeFlag = (flag: string) => {
    updateConfig({ mpegts_flags: flags.filter(f => f !== flag) })
  }

  const availableFlags = [
    'resend_headers',
    'discontinuity',
    'pes_payload',
    'system_b',
    'initial_discontinuity',
    'ratetomax'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">MPEG-TS Configuration</h3>
          <p className="text-sm text-muted-foreground">Professional broadcast MPEG-TS parameters</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Presets
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>MPEG-TS Presets</DialogTitle>
                <DialogDescription>
                  Choose from predefined MPEG-TS configurations for different use cases
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                {[
                  { id: 'standard', name: 'Standard Broadcast', preset: MPEGTS_PRESETS.standard_broadcast, description: 'Basic broadcast configuration with SCTE-35' },
                  { id: 'high-availability', name: 'High Availability', preset: MPEGTS_PRESETS.high_availability, description: 'Redundant configuration with error resilience' },
                  { id: 'cable-headend', name: 'Cable Headend', preset: MPEGTS_PRESETS.cable_headend, description: 'Cable headend compatible with standard PIDs' },
                  { id: 'iptv', name: 'IPTV', preset: MPEGTS_PRESETS.iptv, description: 'IPTV optimized with aligned timestamps' }
                ].map(({ id, name, preset, description }) => (
                  <Card key={id} className="cursor-pointer hover:bg-muted/50" onClick={() => applyPreset(preset)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{name}</CardTitle>
                        <Badge variant="outline">{id}</Badge>
                      </div>
                      <CardDescription className="text-xs">{description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={generateFFmpegCommand}>
            <Play className="h-4 w-4 mr-2" />
            Generate Command
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="pids">PIDs</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="scte35">SCTE-35</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic MPEG-TS Settings</CardTitle>
              <CardDescription>Core MPEG-TS transport stream parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service-id">Service ID</Label>
                  <Input
                    id="service-id"
                    type="number"
                    value={localConfig.mpegts_service_id || ''}
                    onChange={(e) => updateConfig({ mpegts_service_id: parseInt(e.target.value) || undefined })}
                    placeholder="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">MPEG-TS service identifier (1-65535)</p>
                </div>

                <div>
                  <Label htmlFor="service-type">Service Type</Label>
                  <Select
                    value={localConfig.mpegts_service_type?.toString() || ''}
                    onValueChange={(value) => updateConfig({ mpegts_service_type: parseInt(value) || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Digital Television</SelectItem>
                      <SelectItem value="2">Digital Radio</SelectItem>
                      <SelectItem value="3">Teletext</SelectItem>
                      <SelectItem value="4">NVOD Reference</SelectItem>
                      <SelectItem value="5">NVOD Time-shifted</SelectItem>
                      <SelectItem value="6">Mosaic</SelectItem>
                      <SelectItem value="7">FM Radio</SelectItem>
                      <SelectItem value="8">DVB SRM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="original-network-id">Original Network ID</Label>
                  <Input
                    id="original-network-id"
                    type="number"
                    value={localConfig.mpegts_original_network_id || ''}
                    onChange={(e) => updateConfig({ mpegts_original_network_id: parseInt(e.target.value) || undefined })}
                    placeholder="1"
                  />
                </div>

                <div>
                  <Label htmlFor="transport-stream-id">Transport Stream ID</Label>
                  <Input
                    id="transport-stream-id"
                    type="number"
                    value={localConfig.mpegts_transport_stream_id || ''}
                    onChange={(e) => updateConfig({ mpegts_transport_stream_id: parseInt(e.target.value) || undefined })}
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <Label>MPEG-TS Flags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {flags.map((flag) => (
                    <Badge key={flag} variant="secondary" className="cursor-pointer" onClick={() => removeFlag(flag)}>
                      {flag} ×
                    </Badge>
                  ))}
                  {availableFlags
                    .filter(flag => !flags.includes(flag))
                    .map((flag) => (
                      <Badge key={flag} variant="outline" className="cursor-pointer" onClick={() => addFlag(flag)}>
                        +{flag}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pids" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Packet Identifiers (PIDs)</CardTitle>
              <CardDescription>Configure MPEG-TS packet identifiers for different stream components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="video-pid">Video PID</Label>
                  <Input
                    id="video-pid"
                    type="number"
                    value={localConfig.mpegts_pid_video || ''}
                    onChange={(e) => updateConfig({ mpegts_pid_video: parseInt(e.target.value) || undefined })}
                    placeholder="100"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Video stream PID (16-8190)</p>
                </div>

                <div>
                  <Label htmlFor="audio-pid">Audio PID</Label>
                  <Input
                    id="audio-pid"
                    type="number"
                    value={localConfig.mpegts_pid_audio || ''}
                    onChange={(e) => updateConfig({ mpegts_pid_audio: parseInt(e.target.value) || undefined })}
                    placeholder="200"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Audio stream PID (16-8190)</p>
                </div>

                <div>
                  <Label htmlFor="scte35-pid">SCTE-35 PID</Label>
                  <Input
                    id="scte35-pid"
                    type="number"
                    value={localConfig.mpegts_pid_scte35 || ''}
                    onChange={(e) => updateConfig({ mpegts_pid_scte35: parseInt(e.target.value) || undefined })}
                    placeholder="500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">SCTE-35 stream PID (16-8190)</p>
                </div>

                <div>
                  <Label htmlFor="pmt-pid">PMT PID</Label>
                  <Input
                    id="pmt-pid"
                    type="number"
                    value={localConfig.mpegts_pid_pmt || ''}
                    onChange={(e) => updateConfig({ mpegts_pid_pmt: parseInt(e.target.value) || undefined })}
                    placeholder="1000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Program Map Table PID</p>
                </div>

                <div>
                  <Label htmlFor="pat-pid">PAT PID</Label>
                  <Input
                    id="pat-pid"
                    type="number"
                    value={localConfig.mpegts_pid_pat || ''}
                    onChange={(e) => updateConfig({ mpegts_pid_pat: parseInt(e.target.value) || undefined })}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Program Association Table PID</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">PID Information</h4>
                    <p className="text-sm text-blue-700">
                      Standard PIDs: Video (0x10-0x1FFE), Audio (0x10-0x1FFE), SCTE-35 (0x1F4), 
                      PMT (0x3E8), PAT (0x000). PIDs 0-15 are reserved.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timing and Synchronization</CardTitle>
              <CardDescription>Configure PCR periods and table repetition intervals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pcr-period">PCR Period (ms)</Label>
                  <Input
                    id="pcr-period"
                    type="number"
                    value={localConfig.mpegts_pcr_period || ''}
                    onChange={(e) => updateConfig({ mpegts_pcr_period: parseInt(e.target.value) || undefined })}
                    placeholder="20"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Program Clock Reference interval</p>
                </div>

                <div>
                  <Label htmlFor="pat-period">PAT Period (ms)</Label>
                  <Input
                    id="pat-period"
                    type="number"
                    value={localConfig.mpegts_pat_period || ''}
                    onChange={(e) => updateConfig({ mpegts_pat_period: parseInt(e.target.value) || undefined })}
                    placeholder="100"
                  />
                  <p className="text-xs text-muted-foreground mt-1">PAT table repetition interval</p>
                </div>

                <div>
                  <Label htmlFor="sdt-period">SDT Period (ms)</Label>
                  <Input
                    id="sdt-period"
                    type="number"
                    value={localConfig.mpegts_sdt_period || ''}
                    onChange={(e) => updateConfig({ mpegts_sdt_period: parseInt(e.target.value) || undefined })}
                    placeholder="1000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">SDT table repetition interval</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Start Time (ms)</Label>
                  <Input
                    id="start-time"
                    type="number"
                    value={localConfig.mpegts_start_time || ''}
                    onChange={(e) => updateConfig({ mpegts_start_time: parseInt(e.target.value) || undefined })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (ms)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={localConfig.mpegts_duration || ''}
                    onChange={(e) => updateConfig({ mpegts_duration: parseInt(e.target.value) || undefined })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="copyts"
                    checked={localConfig.mpegts_copyts || false}
                    onChange={(e) => updateConfig({ mpegts_copyts: e.target.checked })}
                  />
                  <Label htmlFor="copyts">Copy Timestamps</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="alignts"
                    checked={localConfig.mpegts_align_ts || false}
                    onChange={(e) => updateConfig({ mpegts_align_ts: e.target.checked })}
                  />
                  <Label htmlFor="alignts">Align Timestamps</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scte35" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SCTE-35 Configuration</CardTitle>
              <CardDescription>Configure SCTE-35 ad insertion signaling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="scte35-mode">SCTE-35 Mode</Label>
                <Select
                  value={localConfig.scte35_mode || ''}
                  onValueChange={(value) => updateConfig({ scte35_mode: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select SCTE-35 mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passthrough">Passthrough</SelectItem>
                    <SelectItem value="insert">Insert</SelectItem>
                    <SelectItem value="extract">Extract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="splice-insert"
                    checked={localConfig.scte35_splice_insert || false}
                    onChange={(e) => updateConfig({ scte35_splice_insert: e.target.checked })}
                  />
                  <Label htmlFor="splice-insert">Enable Splice Insert</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="time-signal"
                    checked={localConfig.scte35_time_signal || false}
                    onChange={(e) => updateConfig({ scte35_time_signal: e.target.checked })}
                  />
                  <Label htmlFor="time-signal">Enable Time Signal</Label>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">SCTE-35 Ready</h4>
                    <p className="text-sm text-green-700">
                      SCTE-35 PID is configured for ad insertion signaling. 
                      The system will automatically handle splice insert and time signal commands.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Additional MPEG-TS parameters for professional broadcasting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="discontinuity"
                    checked={localConfig.mpegts_flags_discontinuity || false}
                    onChange={(e) => updateConfig({ mpegts_flags_discontinuity: e.target.checked })}
                  />
                  <Label htmlFor="discontinuity">Allow Discontinuity</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pes-payload"
                    checked={localConfig.mpegts_flags_pes_payload || false}
                    onChange={(e) => updateConfig({ mpegts_flags_pes_payload: e.target.checked })}
                  />
                  <Label htmlFor="pes-payload">Include PES Payload</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="custom-flags">Custom MPEG-TS Flags</Label>
                <Textarea
                  id="custom-flags"
                  value={flags.join('+')}
                  onChange={(e) => {
                    const flagList = e.target.value.split('+').filter(f => f.trim())
                    updateConfig({ mpegts_flags: flagList })
                  }}
                  placeholder="resend_headers+discontinuity+..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter custom flags separated by + (e.g., resend_headers+discontinuity)
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Advanced Configuration</h4>
                    <p className="text-sm text-yellow-700">
                      These settings are for professional broadcast engineers. 
                      Incorrect configuration may cause stream compatibility issues.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCommandDialog} onOpenChange={setShowCommandDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generated FFmpeg Command</DialogTitle>
            <DialogDescription>
              FFmpeg command with your MPEG-TS configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <code className="text-sm whitespace-pre-wrap break-all">
                {generatedCommand}
              </code>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => copyToClipboard(generatedCommand)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={() => setShowCommandDialog(false)}>
                <Save className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}