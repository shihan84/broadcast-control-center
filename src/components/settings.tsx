"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  HardDrive,
  Cpu,
  Wifi,
  Shield,
  Zap,
  Monitor,
  Globe,
  Database,
  Key,
  Film,
  Radio
} from 'lucide-react'

interface SystemSettings {
  ffmpegPath: string
  ffmpegAutoDetect: boolean
  maxConcurrentStreams: number
  defaultStreamTimeout: number
  enableMetrics: boolean
  metricsInterval: number
  enableWebSocketCompression: boolean
  logLevel: 'debug' | 'info' | 'warning' | 'error'
  backupEnabled: boolean
  backupInterval: number
  backupRetention: number
}

interface StreamSettings {
  defaultVideoCodec: 'h264' | 'h265' | 'vp9' | 'av1'
  defaultAudioCodec: 'aac' | 'mp3' | 'opus' | 'ac3'
  defaultResolution: string
  defaultBitrate: number
  defaultFramerate: number
  defaultSegmentDuration: number
  enableAdaptiveBitrate: boolean
  enableTranscoding: boolean
  enableEncryption: boolean
  defaultKeyFrameInterval: number
  enableSCTE35: boolean
  scte35DefaultPID: number
}

interface NetworkSettings {
  streamBufferSize: number
  connectionTimeout: number
  retryAttempts: number
  retryDelay: number
  enableKeepAlive: boolean
  keepAliveInterval: number
  maxBandwidth: number
  enableQoS: boolean
  preferredProtocol: 'auto' | 'tcp' | 'udp'
}

export function SystemSettingsComponent() {
  const [activeTab, setActiveTab] = useState('system')
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [ffmpegStatus, setFfmpegStatus] = useState<'unknown' | 'available' | 'unavailable'>('unknown')
  const [ffmpegVersion, setFfmpegVersion] = useState<string>('')

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    ffmpegPath: 'ffmpeg',
    ffmpegAutoDetect: true,
    maxConcurrentStreams: 10,
    defaultStreamTimeout: 300,
    enableMetrics: true,
    metricsInterval: 2,
    enableWebSocketCompression: true,
    logLevel: 'info',
    backupEnabled: true,
    backupInterval: 24,
    backupRetention: 7
  })

  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    defaultVideoCodec: 'h264',
    defaultAudioCodec: 'aac',
    defaultResolution: '1920x1080',
    defaultBitrate: 8000,
    defaultFramerate: 30,
    defaultSegmentDuration: 6,
    enableAdaptiveBitrate: true,
    enableTranscoding: true,
    enableEncryption: false,
    defaultKeyFrameInterval: 2,
    enableSCTE35: true,
    scte35DefaultPID: 500
  })

  const [networkSettings, setNetworkSettings] = useState<NetworkSettings>({
    streamBufferSize: 4096,
    connectionTimeout: 30,
    retryAttempts: 3,
    retryDelay: 5,
    enableKeepAlive: true,
    keepAliveInterval: 30,
    maxBandwidth: 100,
    enableQoS: true,
    preferredProtocol: 'auto'
  })

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
    checkFFmpegStatus()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const settings = await response.json()
        if (settings.system) setSystemSettings(settings.system)
        if (settings.stream) setStreamSettings(settings.stream)
        if (settings.network) setNetworkSettings(settings.network)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const checkFFmpegStatus = async () => {
    try {
      const response = await fetch('/api/streams/ffmpeg-status')
      if (response.ok) {
        const data = await response.json()
        setFfmpegStatus(data.ffmpegAvailable ? 'available' : 'unavailable')
        
        // Get FFmpeg version if available
        if (data.ffmpegAvailable) {
          try {
            const versionResponse = await fetch('/api/ffmpeg/version')
            if (versionResponse.ok) {
              const versionData = await versionResponse.json()
              setFfmpegVersion(versionData.version || '')
            }
          } catch (error) {
            console.error('Error getting FFmpeg version:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error checking FFmpeg status:', error)
      setFfmpegStatus('unavailable')
    }
  }

  const testFFmpegPath = async (path: string) => {
    try {
      const response = await fetch('/api/ffmpeg/test-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.valid
      }
      return false
    } catch (error) {
      console.error('Error testing FFmpeg path:', error)
      return false
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    setSaveStatus('saving')

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system: systemSettings,
          stream: streamSettings,
          network: networkSettings,
        }),
      })

      if (response.ok) {
        setSaveStatus('success')
        // Check FFmpeg status after saving
        await checkFFmpegStatus()
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
    } finally {
      setIsLoading(false)
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    }
  }

  const handleFFmpegPathChange = async (path: string) => {
    setSystemSettings(prev => ({ ...prev, ffmpegPath: path }))
    
    // Test the path if it's not empty
    if (path.trim()) {
      const isValid = await testFFmpegPath(path)
      setFfmpegStatus(isValid ? 'available' : 'unavailable')
    } else {
      setFfmpegStatus('unknown')
    }
  }

  const getStatusIcon = (status: 'unknown' | 'available' | 'unavailable') => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'unavailable':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusText = (status: 'unknown' | 'available' | 'unavailable') => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'unavailable':
        return 'Not Found'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="stream">Stream</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Film className="h-5 w-5" />
                <span>FFmpeg Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure FFmpeg settings for stream processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ffmpeg-auto-detect"
                  checked={systemSettings.ffmpegAutoDetect}
                  onCheckedChange={(checked) => 
                    setSystemSettings(prev => ({ ...prev, ffmpegAutoDetect: checked }))
                  }
                />
                <Label htmlFor="ffmpeg-auto-detect">Auto-detect FFmpeg</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ffmpeg-path">FFmpeg Path</Label>
                <div className="flex space-x-2">
                  <Input
                    id="ffmpeg-path"
                    value={systemSettings.ffmpegPath}
                    onChange={(e) => handleFFmpegPathChange(e.target.value)}
                    placeholder="ffmpeg"
                    disabled={systemSettings.ffmpegAutoDetect}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => checkFFmpegStatus()}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {getStatusIcon(ffmpegStatus)}
                  <span>FFmpeg Status: {getStatusText(ffmpegStatus)}</span>
                  {ffmpegVersion && (
                    <Badge variant="secondary" className="ml-2">
                      {ffmpegVersion}
                    </Badge>
                  )}
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>FFmpeg Requirements</AlertTitle>
                <AlertDescription>
                  FFmpeg must be installed and accessible from the configured path. 
                  For best performance, use FFmpeg version 4.0 or higher with support for 
                  HLS, DASH, SRT, and MPEG-TS formats.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="h-5 w-5" />
                <span>Performance Settings</span>
              </CardTitle>
              <CardDescription>
                Configure system performance and resource limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-streams">Max Concurrent Streams</Label>
                <Input
                  id="max-streams"
                  type="number"
                  value={systemSettings.maxConcurrentStreams}
                  onChange={(e) => setSystemSettings(prev => ({ 
                    ...prev, 
                    maxConcurrentStreams: parseInt(e.target.value) 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream-timeout">Default Stream Timeout (seconds)</Label>
                <Input
                  id="stream-timeout"
                  type="number"
                  value={systemSettings.defaultStreamTimeout}
                  onChange={(e) => setSystemSettings(prev => ({ 
                    ...prev, 
                    defaultStreamTimeout: parseInt(e.target.value) 
                  }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-metrics"
                  checked={systemSettings.enableMetrics}
                  onCheckedChange={(checked) => 
                    setSystemSettings(prev => ({ ...prev, enableMetrics: checked }))
                  }
                />
                <Label htmlFor="enable-metrics">Enable Metrics Collection</Label>
              </div>

              {systemSettings.enableMetrics && (
                <div className="space-y-2">
                  <Label htmlFor="metrics-interval">Metrics Collection Interval (seconds)</Label>
                  <Input
                    id="metrics-interval"
                    type="number"
                    value={systemSettings.metricsInterval}
                    onChange={(e) => setSystemSettings(prev => ({ 
                      ...prev, 
                      metricsInterval: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Backup & Logging</span>
              </CardTitle>
              <CardDescription>
                Configure backup and logging settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="log-level">Log Level</Label>
                <Select
                  value={systemSettings.logLevel}
                  onValueChange={(value: any) => 
                    setSystemSettings(prev => ({ ...prev, logLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="backup-enabled"
                  checked={systemSettings.backupEnabled}
                  onCheckedChange={(checked) => 
                    setSystemSettings(prev => ({ ...prev, backupEnabled: checked }))
                  }
                />
                <Label htmlFor="backup-enabled">Enable Backups</Label>
              </div>

              {systemSettings.backupEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backup-interval">Backup Interval (hours)</Label>
                    <Input
                      id="backup-interval"
                      type="number"
                      value={systemSettings.backupInterval}
                      onChange={(e) => setSystemSettings(prev => ({ 
                        ...prev, 
                        backupInterval: parseInt(e.target.value) 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-retention">Retention (days)</Label>
                    <Input
                      id="backup-retention"
                      type="number"
                      value={systemSettings.backupRetention}
                      onChange={(e) => setSystemSettings(prev => ({ 
                        ...prev, 
                        backupRetention: parseInt(e.target.value) 
                      }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stream" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Radio className="h-5 w-5" />
                <span>Default Stream Settings</span>
              </CardTitle>
              <CardDescription>
                Configure default settings for new streams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-video-codec">Default Video Codec</Label>
                  <Select
                    value={streamSettings.defaultVideoCodec}
                    onValueChange={(value: any) => 
                      setStreamSettings(prev => ({ ...prev, defaultVideoCodec: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h264">H.264</SelectItem>
                      <SelectItem value="h265">H.265</SelectItem>
                      <SelectItem value="vp9">VP9</SelectItem>
                      <SelectItem value="av1">AV1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-audio-codec">Default Audio Codec</Label>
                  <Select
                    value={streamSettings.defaultAudioCodec}
                    onValueChange={(value: any) => 
                      setStreamSettings(prev => ({ ...prev, defaultAudioCodec: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aac">AAC</SelectItem>
                      <SelectItem value="mp3">MP3</SelectItem>
                      <SelectItem value="opus">Opus</SelectItem>
                      <SelectItem value="ac3">AC3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-resolution">Default Resolution</Label>
                  <Select
                    value={streamSettings.defaultResolution}
                    onValueChange={(value) => 
                      setStreamSettings(prev => ({ ...prev, defaultResolution: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="640x360">640x360</SelectItem>
                      <SelectItem value="854x480">854x480</SelectItem>
                      <SelectItem value="1280x720">1280x720</SelectItem>
                      <SelectItem value="1920x1080">1920x1080</SelectItem>
                      <SelectItem value="2560x1440">2560x1440</SelectItem>
                      <SelectItem value="3840x2160">3840x2160</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-bitrate">Default Bitrate (kbps)</Label>
                  <Input
                    id="default-bitrate"
                    type="number"
                    value={streamSettings.defaultBitrate}
                    onChange={(e) => setStreamSettings(prev => ({ 
                      ...prev, 
                      defaultBitrate: parseInt(e.target.value) 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-framerate">Default Framerate</Label>
                  <Select
                    value={streamSettings.defaultFramerate.toString()}
                    onValueChange={(value) => 
                      setStreamSettings(prev => ({ 
                        ...prev, 
                        defaultFramerate: parseInt(value) 
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="segment-duration">Default Segment Duration (seconds)</Label>
                <Input
                  id="segment-duration"
                  type="number"
                  value={streamSettings.defaultSegmentDuration}
                  onChange={(e) => setStreamSettings(prev => ({ 
                    ...prev, 
                    defaultSegmentDuration: parseInt(e.target.value) 
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Advanced Features</span>
              </CardTitle>
              <CardDescription>
                Configure advanced streaming features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="adaptive-bitrate"
                    checked={streamSettings.enableAdaptiveBitrate}
                    onCheckedChange={(checked) => 
                      setStreamSettings(prev => ({ ...prev, enableAdaptiveBitrate: checked }))
                    }
                  />
                  <Label htmlFor="adaptive-bitrate">Enable Adaptive Bitrate</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="transcoding"
                    checked={streamSettings.enableTranscoding}
                    onCheckedChange={(checked) => 
                      setStreamSettings(prev => ({ ...prev, enableTranscoding: checked }))
                    }
                  />
                  <Label htmlFor="transcoding">Enable Transcoding</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="encryption"
                    checked={streamSettings.enableEncryption}
                    onCheckedChange={(checked) => 
                      setStreamSettings(prev => ({ ...prev, enableEncryption: checked }))
                    }
                  />
                  <Label htmlFor="encryption">Enable Encryption</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="scte35"
                    checked={streamSettings.enableSCTE35}
                    onCheckedChange={(checked) => 
                      setStreamSettings(prev => ({ ...prev, enableSCTE35: checked }))
                    }
                  />
                  <Label htmlFor="scte35">Enable SCTE-35</Label>
                </div>
              </div>

              {streamSettings.enableSCTE35 && (
                <div className="space-y-2">
                  <Label htmlFor="scte35-pid">Default SCTE-35 PID</Label>
                  <Input
                    id="scte35-pid"
                    type="number"
                    value={streamSettings.scte35DefaultPID}
                    onChange={(e) => setStreamSettings(prev => ({ 
                      ...prev, 
                      scte35DefaultPID: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="keyframe-interval">Default Keyframe Interval (seconds)</Label>
                <Input
                  id="keyframe-interval"
                  type="number"
                  value={streamSettings.defaultKeyFrameInterval}
                  onChange={(e) => setStreamSettings(prev => ({ 
                    ...prev, 
                    defaultKeyFrameInterval: parseInt(e.target.value) 
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wifi className="h-5 w-5" />
                <span>Network Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure network and connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buffer-size">Stream Buffer Size (KB)</Label>
                  <Input
                    id="buffer-size"
                    type="number"
                    value={networkSettings.streamBufferSize}
                    onChange={(e) => setNetworkSettings(prev => ({ 
                      ...prev, 
                      streamBufferSize: parseInt(e.target.value) 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="connection-timeout">Connection Timeout (seconds)</Label>
                  <Input
                    id="connection-timeout"
                    type="number"
                    value={networkSettings.connectionTimeout}
                    onChange={(e) => setNetworkSettings(prev => ({ 
                      ...prev, 
                      connectionTimeout: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retry-attempts">Retry Attempts</Label>
                  <Input
                    id="retry-attempts"
                    type="number"
                    value={networkSettings.retryAttempts}
                    onChange={(e) => setNetworkSettings(prev => ({ 
                      ...prev, 
                      retryAttempts: parseInt(e.target.value) 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retry-delay">Retry Delay (seconds)</Label>
                  <Input
                    id="retry-delay"
                    type="number"
                    value={networkSettings.retryDelay}
                    onChange={(e) => setNetworkSettings(prev => ({ 
                      ...prev, 
                      retryDelay: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-bandwidth">Max Bandwidth (Mbps)</Label>
                  <Input
                    id="max-bandwidth"
                    type="number"
                    value={networkSettings.maxBandwidth}
                    onChange={(e) => setNetworkSettings(prev => ({ 
                      ...prev, 
                      maxBandwidth: parseInt(e.target.value) 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred-protocol">Preferred Protocol</Label>
                  <Select
                    value={networkSettings.preferredProtocol}
                    onValueChange={(value: any) => 
                      setNetworkSettings(prev => ({ ...prev, preferredProtocol: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="tcp">TCP</SelectItem>
                      <SelectItem value="udp">UDP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Connection Management</span>
              </CardTitle>
              <CardDescription>
                Configure connection management and reliability settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="keep-alive"
                    checked={networkSettings.enableKeepAlive}
                    onCheckedChange={(checked) => 
                      setNetworkSettings(prev => ({ ...prev, enableKeepAlive: checked }))
                    }
                  />
                  <Label htmlFor="keep-alive">Enable Keep Alive</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="qos"
                    checked={networkSettings.enableQoS}
                    onCheckedChange={(checked) => 
                      setNetworkSettings(prev => ({ ...prev, enableQoS: checked }))
                    }
                  />
                  <Label htmlFor="qos">Enable QoS</Label>
                </div>
              </div>

              {networkSettings.enableKeepAlive && (
                <div className="space-y-2">
                  <Label htmlFor="keep-alive-interval">Keep Alive Interval (seconds)</Label>
                  <Input
                    id="keep-alive-interval"
                    type="number"
                    value={networkSettings.keepAliveInterval}
                    onChange={(e) => setNetworkSettings(prev => ({ 
                      ...prev, 
                      keepAliveInterval: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {saveStatus === 'saving' && (
            <div className="flex items-center space-x-2 text-blue-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {saveStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Settings saved successfully!</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-4 w-4" />
              <span>Failed to save settings</span>
            </div>
          )}
        </div>

        <Button 
          onClick={saveSettings} 
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </Button>
      </div>
    </div>
  )
}