"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Trash2, 
  Edit,
  Activity,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Film,
  Radio,
  Network,
  Key,
  Clock
} from 'lucide-react'

interface OutputConfig {
  // Basic Settings
  name: string
  type: 'HLS' | 'DASH' | 'SRT' | 'RTMP' | 'MPEGTS'
  url: string
  description?: string
  
  // Video Parameters
  videoCodec: 'h264' | 'h265' | 'vp9' | 'av1'
  videoProfile: 'baseline' | 'main' | 'high' | 'high10' | 'high422' | 'high444'
  videoLevel: string
  bitrate: number
  maxBitrate: number
  bufferSize: number
  resolution: string
  framerate: number
  keyFrameInterval: number
  bFrames: number
  referenceFrames: number
  
  // Audio Parameters
  audioCodec: 'aac' | 'mp3' | 'opus' | 'ac3' | 'mp2'
  audioBitrate: number
  audioSampleRate: number
  audioChannels: number
  
  // Streaming Parameters
  segmentDuration: number
  segmentListSize: number
  playlistType: 'event' | 'vod' | 'live'
  hlsVersion: number
  dashProfile: string
  
  // Network Parameters
  latency: number
  redundancy: number
  packetSize: number
  bandwidth: number
  
  // Security Parameters
  encryption: boolean
  drmEnabled: boolean
  drmType: 'widevine' | 'playready' | 'fairplay' | 'clearkey'
  encryptionKey?: string
  encryptionIV?: string
  
  // Advanced Parameters
  transcodingEnabled: boolean
  adaptiveBitrate: boolean
  multiAudio: boolean
  multiSubtitle: boolean
  closedCaptions: boolean
  
  // Quality Control
  qualityBased: boolean
  crfValue: number
  preset: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow'
  tune: 'film' | 'animation' | 'grain' | 'stillimage' | 'fastdecode' | 'zerolatency'
  
  // MPEG-TS Specific Parameters
  mpegtsFlags?: string[]
  mpegtsServiceId?: number
  mpegtsPidVideo?: number
  mpegtsPidAudio?: number
  mpegtsPidScte35?: number
  mpegtsPidPmt?: number
  mpegtsPidPat?: number
  mpegtsPcrPeriod?: number
  mpegtsTransportStreamId?: number
  mpegtsOriginalNetworkId?: number
  mpegtsTablesVersion?: number
  mpegtsPatPeriod?: number
  mpegtsSdtPeriod?: number
  
  // Transport Stream Options
  transportStream?: boolean
  m2tsMode?: boolean
  pesPayloadSize?: number
  videoPmtPid?: number
  audioPmtPid?: number
  scte35PmtPid?: number
  mpegtsFlags?: string[]
  mpegtsServiceType?: number
  mpegtsProviderName?: string
  mpegtsServiceName?: string
  
  // SCTE-35 Configuration
  scte35Enabled: boolean
  scte35Passthrough: boolean
  scte35Pid?: number
  scte35InsertEvents: boolean
  scte35ForcePassthrough: boolean
  scte35NullPassthrough: boolean
  
  // Broadcast Parameters
  broadcastStandard?: 'atsc' | 'dvb' | 'isdb'
  tsPacketSize?: number
  continuityCounter?: boolean
  pcrPid?: number
  pcrPeriod?: number
  patInterval?: number
  pmtInterval?: number
  sdtInterval?: number
  
  // Monitoring
  monitoringEnabled: boolean
  healthChecks: boolean
  alertThresholds: {
    cpu: number
    memory: number
    network: number
    bitrate: number
    latency: number
    droppedFrames: number
  }
}

export function StreamManagement() {
  const [activeTab, setActiveTab] = useState('inputs')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isOutputConfigOpen, setIsOutputConfigOpen] = useState(false)
  const [selectedOutput, setSelectedOutput] = useState<any>(null)
  const [outputConfig, setOutputConfig] = useState<OutputConfig>(getDefaultOutputConfig())

  // State for creating new input stream
  const [newStream, setNewStream] = useState({
    name: '',
    type: 'RTMP' as 'HLS' | 'RTMP' | 'SRT' | 'DASH',
    url: '',
    channelId: '1' // Default channel ID
  })

  const [streamInputs, setStreamInputs] = useState([
    {
      id: '1',
      name: 'News Primary Feed',
      type: 'RTMP',
      url: 'rtmp://server:1935/live/news',
      status: 'connected',
      bitrate: 8.5,
      viewers: 12450
    },
    {
      id: '2',
      name: 'Sports Backup',
      type: 'SRT',
      url: 'srt://server:9000?sportshd',
      status: 'disconnected',
      bitrate: 0,
      viewers: 0
    },
    {
      id: '3',
      name: 'Entertainment HLS',
      type: 'HLS',
      url: 'https://cdn.example.com/ent/master.m3u8',
      status: 'connected',
      bitrate: 12.0,
      viewers: 8230
    }
  ])

  const [streamOutputs, setStreamOutputs] = useState([
    {
      id: '1',
      name: 'CDN Distribution',
      type: 'HLS',
      url: 'https://cdn.example.com/out/news.m3u8',
      status: 'running',
      bitrate: 8.5,
      viewers: 12450,
      config: {
        videoCodec: 'h264',
        resolution: '1920x1080',
        bitrate: 8000,
        adaptiveBitrate: true,
        encryption: false
      }
    },
    {
      id: '2',
      name: 'Social Media',
      type: 'RTMP',
      url: 'rtmp://social-api.com/live/stream',
      status: 'running',
      bitrate: 6.0,
      viewers: 5600,
      config: {
        videoCodec: 'h264',
        resolution: '1280x720',
        bitrate: 6000,
        adaptiveBitrate: false,
        encryption: false
      }
    },
    {
      id: '3',
      name: 'Archive Server',
      type: 'SRT',
      url: 'srt://archive:9000?backup',
      status: 'stopped',
      bitrate: 0,
      viewers: 0,
      config: {
        videoCodec: 'h265',
        resolution: '1920x1080',
        bitrate: 12000,
        adaptiveBitrate: false,
        encryption: true
      }
    }
  ])

  function getDefaultOutputConfig(): OutputConfig {
    return {
      name: '',
      type: 'HLS',
      url: '',
      description: '',
      videoCodec: 'h264',
      videoProfile: 'high',
      videoLevel: '4.1',
      bitrate: 8000,
      maxBitrate: 12000,
      bufferSize: 4096,
      resolution: '1920x1080',
      framerate: 30,
      keyFrameInterval: 2,
      bFrames: 3,
      referenceFrames: 4,
      audioCodec: 'aac',
      audioBitrate: 192,
      audioSampleRate: 48000,
      audioChannels: 2,
      segmentDuration: 6,
      segmentListSize: 10,
      playlistType: 'live',
      hlsVersion: 3,
      dashProfile: 'live',
      latency: 2000,
      redundancy: 1,
      packetSize: 1316,
      bandwidth: 10000,
      encryption: false,
      drmEnabled: false,
      drmType: 'widevine',
      transcodingEnabled: true,
      adaptiveBitrate: true,
      multiAudio: false,
      multiSubtitle: false,
      closedCaptions: true,
      qualityBased: false,
      crfValue: 23,
      preset: 'medium',
      tune: 'zerolatency',
      
      // MPEG-TS Specific Parameters
      mpegtsFlags: ['+resend_headers'],
      mpegtsServiceId: 1,
      mpegtsPidVideo: 100,
      mpegtsPidAudio: 200,
      mpegtsPidScte35: 500,
      mpegtsPidPmt: 1000,
      mpegtsPidPat: 0,
      mpegtsPcrPeriod: 20,
      mpegtsTransportStreamId: 1,
      mpegtsOriginalNetworkId: 1,
      mpegtsTablesVersion: 0,
      mpegtsPatPeriod: 100,
      mpegtsSdtPeriod: 1000,
      
      // Transport Stream Options
      transportStream: true,
      m2tsMode: false,
      pesPayloadSize: 184,
      videoPmtPid: 100,
      audioPmtPid: 200,
      scte35PmtPid: 500,
      mpegtsServiceType: 1,
      mpegtsProviderName: 'Broadcast',
      mpegtsServiceName: 'Main Service',
      
      // SCTE-35 Configuration
      scte35Enabled: true,
      scte35Passthrough: true,
      scte35Pid: 500,
      scte35InsertEvents: true,
      scte35ForcePassthrough: false,
      scte35NullPassthrough: true,
      
      // Broadcast Parameters
      broadcastStandard: 'dvb',
      tsPacketSize: 188,
      continuityCounter: true,
      pcrPid: 100,
      pcrPeriod: 20,
      patInterval: 100,
      pmtInterval: 500,
      sdtInterval: 2000,
      
      monitoringEnabled: true,
      healthChecks: true,
      alertThresholds: {
        cpu: 80,
        memory: 85,
        network: 90,
        bitrate: 15000,
        latency: 3000,
        droppedFrames: 50
      }
    }
  }

  const outputPresets = [
    {
      name: 'High Quality HLS',
      type: 'HLS',
      config: {
        videoCodec: 'h264',
        videoProfile: 'high',
        bitrate: 12000,
        resolution: '1920x1080',
        framerate: 30,
        adaptiveBitrate: true,
        segmentDuration: 4,
        preset: 'slow',
        tune: 'film',
        mpegtsFlags: ['+resend_headers'],
        mpegtsServiceId: 1,
        mpegtsPidVideo: 100,
        mpegtsPidAudio: 200,
        mpegtsPidScte35: 500
      }
    },
    {
      name: 'Low Latency SRT',
      type: 'SRT',
      config: {
        videoCodec: 'h264',
        videoProfile: 'main',
        bitrate: 8000,
        resolution: '1280x720',
        framerate: 30,
        adaptiveBitrate: false,
        latency: 500,
        preset: 'ultrafast',
        tune: 'zerolatency',
        mpegtsFlags: ['+resend_headers', '+latency'],
        mpegtsServiceId: 1,
        mpegtsPidVideo: 100,
        mpegtsPidAudio: 200,
        mpegtsPidScte35: 500,
        transportStream: true,
        tsPacketSize: 188
      }
    },
    {
      name: 'Multi-bitrate DASH',
      type: 'DASH',
      config: {
        videoCodec: 'h265',
        videoProfile: 'main',
        bitrate: 15000,
        resolution: '1920x1080',
        framerate: 60,
        adaptiveBitrate: true,
        segmentDuration: 2,
        preset: 'medium',
        tune: 'film',
        mpegtsFlags: ['+resend_headers', '+adaptive'],
        mpegtsServiceId: 1,
        mpegtsPidVideo: 100,
        mpegtsPidAudio: 200,
        mpegtsPidScte35: 500
      }
    },
    {
      name: 'Social Media RTMP',
      type: 'RTMP',
      config: {
        videoCodec: 'h264',
        videoProfile: 'baseline',
        bitrate: 6000,
        resolution: '1280x720',
        framerate: 30,
        adaptiveBitrate: false,
        preset: 'fast',
        tune: 'zerolatency'
      }
    },
    {
      name: 'Broadcast MPEG-TS',
      type: 'MPEGTS',
      config: {
        videoCodec: 'h264',
        videoProfile: 'high',
        bitrate: 15000,
        resolution: '1920x1080',
        framerate: 30,
        adaptiveBitrate: false,
        preset: 'medium',
        tune: 'film',
        mpegtsFlags: ['+resend_headers', '+pat_period', '+pmt_period'],
        mpegtsServiceId: 1,
        mpegtsPidVideo: 100,
        mpegtsPidAudio: 200,
        mpegtsPidScte35: 500,
        mpegtsPidPmt: 1000,
        mpegtsPidPat: 0,
        mpegtsPcrPeriod: 20,
        mpegtsTransportStreamId: 1,
        mpegtsOriginalNetworkId: 1,
        transportStream: true,
        tsPacketSize: 188,
        continuityCounter: true,
        pcrPid: 100,
        pcrPeriod: 20,
        patInterval: 100,
        pmtInterval: 500,
        sdtInterval: 2000,
        broadcastStandard: 'dvb',
        scte35Enabled: true,
        scte35Passthrough: true,
        scte35Pid: 500,
        scte35InsertEvents: true
      }
    },
    {
      name: 'ATSC Broadcast',
      type: 'MPEGTS',
      config: {
        videoCodec: 'h264',
        videoProfile: 'high',
        bitrate: 19000,
        resolution: '1920x1080',
        framerate: 29.97,
        adaptiveBitrate: false,
        preset: 'medium',
        tune: 'film',
        mpegtsFlags: ['+resend_headers', '+atsc'],
        mpegtsServiceId: 1,
        mpegtsPidVideo: 100,
        mpegtsPidAudio: 200,
        mpegtsPidScte35: 500,
        mpegtsPcrPeriod: 30,
        mpegtsTransportStreamId: 1,
        mpegtsOriginalNetworkId: 1,
        transportStream: true,
        tsPacketSize: 188,
        continuityCounter: true,
        pcrPid: 100,
        pcrPeriod: 30,
        patInterval: 100,
        pmtInterval: 400,
        sdtInterval: 1000,
        broadcastStandard: 'atsc',
        scte35Enabled: true,
        scte35Passthrough: true,
        scte35Pid: 500,
        scte35InsertEvents: true
      }
    }
  ]

  // Function to create a new input stream
  const createInputStream = async () => {
    try {
      // Validate input
      if (!newStream.name.trim()) {
        alert('Please enter a stream name')
        return
      }
      
      if (!newStream.url.trim()) {
        alert('Please enter a stream URL')
        return
      }

      // Basic URL validation
      try {
        new URL(newStream.url)
      } catch {
        alert('Please enter a valid URL')
        return
      }

      // Create new stream object
      const newInputStream = {
        id: `input-${Date.now()}`,
        name: newStream.name,
        type: newStream.type,
        url: newStream.url,
        status: 'disconnected' as const,
        bitrate: 0,
        viewers: 0
      }

      // Add to state
      setStreamInputs(prev => [...prev, newInputStream])

      // Reset form
      setNewStream({
        name: '',
        type: 'RTMP',
        url: '',
        channelId: '1'
      })

      // Close dialog
      setIsCreateDialogOpen(false)

      // Show success message
      alert('Input stream created successfully!')
    } catch (error) {
      console.error('Error creating input stream:', error)
      alert('Failed to create input stream')
    }
  }

  // Function to start an input stream
  const startInputStream = async (inputId: string) => {
    try {
      setStreamInputs(prev => prev.map(input => 
        input.id === inputId 
          ? { ...input, status: 'connecting' as const }
          : input
      ))

      // Simulate connection delay
      setTimeout(() => {
        setStreamInputs(prev => prev.map(input => 
          input.id === inputId 
            ? { ...input, status: 'connected' as const, bitrate: Math.random() * 10 + 5, viewers: Math.floor(Math.random() * 1000) + 100 }
            : input
        ))
      }, 2000)
    } catch (error) {
      console.error('Error starting input stream:', error)
      setStreamInputs(prev => prev.map(input => 
        input.id === inputId 
          ? { ...input, status: 'error' as const }
          : input
      ))
    }
  }

  // Function to stop an input stream
  const stopInputStream = async (inputId: string) => {
    try {
      setStreamInputs(prev => prev.map(input => 
        input.id === inputId 
          ? { ...input, status: 'disconnected' as const, bitrate: 0, viewers: 0 }
          : input
      ))
    } catch (error) {
      console.error('Error stopping input stream:', error)
    }
  }

  // Function to delete an input stream
  const deleteInputStream = async (inputId: string) => {
    try {
      if (confirm('Are you sure you want to delete this input stream?')) {
        setStreamInputs(prev => prev.filter(input => input.id !== inputId))
      }
    } catch (error) {
      console.error('Error deleting input stream:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'running':
        return 'bg-green-500'
      case 'disconnected':
      case 'stopped':
        return 'bg-gray-500'
      case 'error':
        return 'bg-red-500'
      case 'connecting':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
      case 'stopped':
        return <Square className="h-4 w-4 text-gray-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'connecting':
        return <Activity className="h-4 w-4 text-yellow-500" />
      default:
        return <Square className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      connected: 'default',
      running: 'default',
      disconnected: 'secondary',
      stopped: 'secondary',
      error: 'destructive',
      connecting: 'outline'
    }
    
    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {status}
      </Badge>
    )
  }

  const handleOutputConfig = (output?: any) => {
    if (output) {
      setSelectedOutput(output)
      setOutputConfig({ ...getDefaultOutputConfig(), ...output.config })
    } else {
      setSelectedOutput(null)
      setOutputConfig(getDefaultOutputConfig())
    }
    setIsOutputConfigOpen(true)
  }

  const applyPreset = (preset: any) => {
    setOutputConfig(prev => ({
      ...prev,
      ...preset.config,
      type: preset.type
    }))
  }

  const saveOutputConfig = () => {
    if (selectedOutput) {
      // Update existing output
      setStreamOutputs(prev => prev.map(output => 
        output.id === selectedOutput.id 
          ? { ...output, config: outputConfig }
          : output
      ))
    } else {
      // Create new output
      const newOutput = {
        id: `output-${Date.now()}`,
        name: outputConfig.name,
        type: outputConfig.type,
        url: outputConfig.url,
        status: 'stopped',
        bitrate: 0,
        viewers: 0,
        config: outputConfig
      }
      setStreamOutputs(prev => [...prev, newOutput])
    }
    setIsOutputConfigOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stream Management</h2>
          <p className="text-muted-foreground">Manage input sources and output destinations</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inputs">Input Sources</TabsTrigger>
          <TabsTrigger value="outputs">Output Destinations</TabsTrigger>
        </TabsList>

        <TabsContent value="inputs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Stream Input Sources</CardTitle>
                  <CardDescription>Configure and manage your input streams (HLS/RTMP/SRT)</CardDescription>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Input Stream
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Input Stream</DialogTitle>
                      <DialogDescription>
                        Add a new input source for your broadcast channel
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="stream-name">Stream Name</Label>
                        <Input 
                          id="stream-name" 
                          placeholder="Enter stream name"
                          value={newStream.name}
                          onChange={(e) => setNewStream(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stream-type">Stream Type</Label>
                        <Select value={newStream.type} onValueChange={(value: any) => setNewStream(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stream type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RTMP">RTMP</SelectItem>
                            <SelectItem value="HLS">HLS</SelectItem>
                            <SelectItem value="SRT">SRT</SelectItem>
                            <SelectItem value="DASH">DASH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="stream-url">Stream URL</Label>
                        <Input 
                          id="stream-url" 
                          placeholder="Enter stream URL"
                          value={newStream.url}
                          onChange={(e) => setNewStream(prev => ({ ...prev, url: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Examples: rtmp://server:1935/live/stream, srt://server:9000?streamid, https://cdn.example.com/stream.m3u8
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createInputStream}>
                          Create Input Stream
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bitrate</TableHead>
                    <TableHead>Viewers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {streamInputs.map((input) => (
                    <TableRow key={input.id}>
                      <TableCell className="font-medium">{input.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{input.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{input.url}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(input.status)}`} />
                          {getStatusBadge(input.status)}
                        </div>
                      </TableCell>
                      <TableCell>{input.bitrate > 0 ? `${input.bitrate} Mbps` : '-'}</TableCell>
                      <TableCell>{input.viewers.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => input.status === 'connected' ? stopInputStream(input.id) : startInputStream(input.id)}
                            disabled={input.status === 'connecting'}
                          >
                            {input.status === 'connected' ? 
                              <Pause className="h-4 w-4" /> : 
                              <Play className="h-4 w-4" />
                            }
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteInputStream(input.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outputs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stream Output Destinations</CardTitle>
              <CardDescription>Manage your output streams to CDNs and platforms (HLS/DASH/SRT)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Button onClick={() => handleOutputConfig()}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Output
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Resolution</TableHead>
                    <TableHead>Bitrate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Viewers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {streamOutputs.map((output) => (
                    <TableRow key={output.id}>
                      <TableCell className="font-medium">{output.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{output.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{output.url}</TableCell>
                      <TableCell>{output.config?.resolution || '-'}</TableCell>
                      <TableCell>{output.config?.bitrate ? `${output.config.bitrate} Mbps` : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(output.status)}`} />
                          {getStatusBadge(output.status)}
                        </div>
                      </TableCell>
                      <TableCell>{output.viewers.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            {output.status === 'running' ? 
                              <Square className="h-4 w-4" /> : 
                              <Play className="h-4 w-4" />
                            }
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOutputConfig(output)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Output Configuration Dialog */}
      <Dialog open={isOutputConfigOpen} onOpenChange={setIsOutputConfigOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedOutput ? 'Edit Output Configuration' : 'Create New Output'}
            </DialogTitle>
            <DialogDescription>
              Configure advanced parameters for output destination
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Basic Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="output-name">Output Name</Label>
                    <Input
                      id="output-name"
                      value={outputConfig.name}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter output name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="output-type">Output Type</Label>
                    <Select 
                      value={outputConfig.type} 
                      onValueChange={(value: any) => setOutputConfig(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HLS">HLS</SelectItem>
                        <SelectItem value="DASH">DASH</SelectItem>
                        <SelectItem value="SRT">SRT</SelectItem>
                        <SelectItem value="RTMP">RTMP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="output-url">Output URL</Label>
                  <Input
                    id="output-url"
                    value={outputConfig.url}
                    onChange={(e) => setOutputConfig(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="Enter output URL"
                  />
                </div>
                <div>
                  <Label htmlFor="output-description">Description</Label>
                  <Textarea
                    id="output-description"
                    value={outputConfig.description}
                    onChange={(e) => setOutputConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter output description"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Video Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Video Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="video-codec">Video Codec</Label>
                    <Select 
                      value={outputConfig.videoCodec} 
                      onValueChange={(value: any) => setOutputConfig(prev => ({ ...prev, videoCodec: value }))}
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
                  <div>
                    <Label htmlFor="video-profile">Profile</Label>
                    <Select 
                      value={outputConfig.videoProfile} 
                      onValueChange={(value: any) => setOutputConfig(prev => ({ ...prev, videoProfile: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baseline">Baseline</SelectItem>
                        <SelectItem value="main">Main</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="high10">High 10</SelectItem>
                        <SelectItem value="high422">High 4:2:2</SelectItem>
                        <SelectItem value="high444">High 4:4:4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="video-level">Level</Label>
                    <Input
                      id="video-level"
                      value={outputConfig.videoLevel}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, videoLevel: e.target.value }))}
                      placeholder="4.1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="resolution">Resolution</Label>
                    <Select 
                      value={outputConfig.resolution} 
                      onValueChange={(value) => setOutputConfig(prev => ({ ...prev, resolution: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                        <SelectItem value="2560x1440">2K (2560x1440)</SelectItem>
                        <SelectItem value="1920x1080">Full HD (1920x1080)</SelectItem>
                        <SelectItem value="1280x720">HD (1280x720)</SelectItem>
                        <SelectItem value="854x480">SD (854x480)</SelectItem>
                        <SelectItem value="640x360">nHD (640x360)</SelectItem>
                        <SelectItem value="426x240">240p (426x240)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="framerate">Framerate</Label>
                    <Select 
                      value={outputConfig.framerate.toString()} 
                      onValueChange={(value) => setOutputConfig(prev => ({ ...prev, framerate: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 fps</SelectItem>
                        <SelectItem value="25">25 fps</SelectItem>
                        <SelectItem value="30">30 fps</SelectItem>
                        <SelectItem value="50">50 fps</SelectItem>
                        <SelectItem value="60">60 fps</SelectItem>
                        <SelectItem value="120">120 fps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="keyframe-interval">Key Frame Interval (s)</Label>
                    <Input
                      id="keyframe-interval"
                      type="number"
                      value={outputConfig.keyFrameInterval}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, keyFrameInterval: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bitrate">Bitrate (Kbps)</Label>
                    <Input
                      id="bitrate"
                      type="number"
                      value={outputConfig.bitrate}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, bitrate: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-bitrate">Max Bitrate (Kbps)</Label>
                    <Input
                      id="max-bitrate"
                      type="number"
                      value={outputConfig.maxBitrate}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, maxBitrate: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="buffer-size">Buffer Size (KB)</Label>
                    <Input
                      id="buffer-size"
                      type="number"
                      value={outputConfig.bufferSize}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, bufferSize: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="b-frames">B-frames</Label>
                    <Input
                      id="b-frames"
                      type="number"
                      value={outputConfig.bFrames}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, bFrames: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference-frames">Reference Frames</Label>
                    <Input
                      id="reference-frames"
                      type="number"
                      value={outputConfig.referenceFrames}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, referenceFrames: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="crf-value">CRF Value</Label>
                    <Slider
                      value={[outputConfig.crfValue]}
                      onValueChange={(value) => setOutputConfig(prev => ({ ...prev, crfValue: value[0] }))}
                      max={51}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      Current: {outputConfig.crfValue} (Lower = better quality)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  Audio Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="audio-codec">Audio Codec</Label>
                    <Select 
                      value={outputConfig.audioCodec} 
                      onValueChange={(value: any) => setOutputConfig(prev => ({ ...prev, audioCodec: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aac">AAC</SelectItem>
                        <SelectItem value="mp3">MP3</SelectItem>
                        <SelectItem value="opus">Opus</SelectItem>
                        <SelectItem value="ac3">AC-3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="audio-bitrate">Audio Bitrate (Kbps)</Label>
                    <Select 
                      value={outputConfig.audioBitrate.toString()} 
                      onValueChange={(value) => setOutputConfig(prev => ({ ...prev, audioBitrate: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="64">64 Kbps</SelectItem>
                        <SelectItem value="96">96 Kbps</SelectItem>
                        <SelectItem value="128">128 Kbps</SelectItem>
                        <SelectItem value="192">192 Kbps</SelectItem>
                        <SelectItem value="256">256 Kbps</SelectItem>
                        <SelectItem value="320">320 Kbps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="audio-channels">Audio Channels</Label>
                    <Select 
                      value={outputConfig.audioChannels.toString()} 
                      onValueChange={(value) => setOutputConfig(prev => ({ ...prev, audioChannels: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Mono</SelectItem>
                        <SelectItem value="2">Stereo</SelectItem>
                        <SelectItem value="6">5.1 Surround</SelectItem>
                        <SelectItem value="8">7.1 Surround</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="audio-sample-rate">Sample Rate (Hz)</Label>
                  <Select 
                    value={outputConfig.audioSampleRate.toString()} 
                    onValueChange={(value) => setOutputConfig(prev => ({ ...prev, audioSampleRate: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="22050">22.05 kHz</SelectItem>
                      <SelectItem value="44100">44.1 kHz</SelectItem>
                      <SelectItem value="48000">48 kHz</SelectItem>
                      <SelectItem value="96000">96 kHz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Streaming Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Streaming Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="segment-duration">Segment Duration (s)</Label>
                    <Input
                      id="segment-duration"
                      type="number"
                      value={outputConfig.segmentDuration}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, segmentDuration: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="segment-list-size">Segment List Size</Label>
                    <Input
                      id="segment-list-size"
                      type="number"
                      value={outputConfig.segmentListSize}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, segmentListSize: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="playlist-type">Playlist Type</Label>
                    <Select 
                      value={outputConfig.playlistType} 
                      onValueChange={(value: any) => setOutputConfig(prev => ({ ...prev, playlistType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="vod">Video on Demand</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {outputConfig.type === 'HLS' && (
                  <div>
                    <Label htmlFor="hls-version">HLS Version</Label>
                    <Select 
                      value={outputConfig.hlsVersion.toString()} 
                      onValueChange={(value) => setOutputConfig(prev => ({ ...prev, hlsVersion: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">Version 3</SelectItem>
                        <SelectItem value="4">Version 4</SelectItem>
                        <SelectItem value="5">Version 5</SelectItem>
                        <SelectItem value="6">Version 6</SelectItem>
                        <SelectItem value="7">Version 7</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {outputConfig.type === 'DASH' && (
                  <div>
                    <Label htmlFor="dash-profile">DASH Profile</Label>
                    <Input
                      id="dash-profile"
                      value={outputConfig.dashProfile}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, dashProfile: e.target.value }))}
                      placeholder="urn:mpeg:dash:profile:isoff-live:2011"
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="latency">Latency (ms)</Label>
                    <Input
                      id="latency"
                      type="number"
                      value={outputConfig.latency}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, latency: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="redundancy">Redundancy</Label>
                    <Input
                      id="redundancy"
                      type="number"
                      value={outputConfig.redundancy}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, redundancy: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="packet-size">Packet Size (bytes)</Label>
                    <Input
                      id="packet-size"
                      type="number"
                      value={outputConfig.packetSize}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, packetSize: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="encryption">Enable Encryption</Label>
                    <div className="text-sm text-muted-foreground">
                      Encrypt the output stream
                    </div>
                  </div>
                  <Switch
                    id="encryption"
                    checked={outputConfig.encryption}
                    onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, encryption: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="drm">Enable DRM</Label>
                    <div className="text-sm text-muted-foreground">
                      Digital Rights Management protection
                    </div>
                  </div>
                  <Switch
                    id="drm"
                    checked={outputConfig.drmEnabled}
                    onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, drmEnabled: checked }))}
                  />
                </div>

                {outputConfig.drmEnabled && (
                  <div>
                    <Label htmlFor="drm-type">DRM Type</Label>
                    <Select 
                      value={outputConfig.drmType} 
                      onValueChange={(value: any) => setOutputConfig(prev => ({ ...prev, drmType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="widevine">Widevine</SelectItem>
                        <SelectItem value="playready">PlayReady</SelectItem>
                        <SelectItem value="fairplay">FairPlay</SelectItem>
                        <SelectItem value="clearkey">ClearKey</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {outputConfig.encryption && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="encryption-key">Encryption Key</Label>
                      <Input
                        id="encryption-key"
                        type="password"
                        value={outputConfig.encryptionKey || ''}
                        onChange={(e) => setOutputConfig(prev => ({ ...prev, encryptionKey: e.target.value }))}
                        placeholder="Enter encryption key"
                      />
                    </div>
                    <div>
                      <Label htmlFor="encryption-iv">Initialization Vector</Label>
                      <Input
                        id="encryption-iv"
                        type="password"
                        value={outputConfig.encryptionIV || ''}
                        onChange={(e) => setOutputConfig(prev => ({ ...prev, encryptionIV: e.target.value }))}
                        placeholder="Enter IV"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Advanced Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Advanced Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preset">Encoding Preset</Label>
                    <Select 
                      value={outputConfig.preset} 
                      onValueChange={(value: any) => setOutputConfig(prev => ({ ...prev, preset: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ultrafast">Ultrafast</SelectItem>
                        <SelectItem value="superfast">Superfast</SelectItem>
                        <SelectItem value="veryfast">Veryfast</SelectItem>
                        <SelectItem value="faster">Faster</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="slow">Slow</SelectItem>
                        <SelectItem value="slower">Slower</SelectItem>
                        <SelectItem value="veryslow">Veryslow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tune">Tuning</Label>
                    <Select 
                      value={outputConfig.tune} 
                      onValueChange={(value: any) => setOutputConfig(prev => ({ ...prev, tune: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="film">Film</SelectItem>
                        <SelectItem value="animation">Animation</SelectItem>
                        <SelectItem value="grain">Grain</SelectItem>
                        <SelectItem value="stillimage">Still Image</SelectItem>
                        <SelectItem value="fastdecode">Fast Decode</SelectItem>
                        <SelectItem value="zerolatency">Zero Latency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="transcoding">Enable Transcoding</Label>
                      <div className="text-sm text-muted-foreground">
                        Transcode input to output format
                      </div>
                    </div>
                    <Switch
                      id="transcoding"
                      checked={outputConfig.transcodingEnabled}
                      onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, transcodingEnabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="adaptive-bitrate">Adaptive Bitrate</Label>
                      <div className="text-sm text-muted-foreground">
                        Multiple bitrate variants
                      </div>
                    </div>
                    <Switch
                      id="adaptive-bitrate"
                      checked={outputConfig.adaptiveBitrate}
                      onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, adaptiveBitrate: checked }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="multi-audio">Multi Audio</Label>
                      <div className="text-sm text-muted-foreground">
                        Multiple audio tracks
                      </div>
                    </div>
                    <Switch
                      id="multi-audio"
                      checked={outputConfig.multiAudio}
                      onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, multiAudio: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="multi-subtitle">Multi Subtitle</Label>
                      <div className="text-sm text-muted-foreground">
                        Multiple subtitle tracks
                      </div>
                    </div>
                    <Switch
                      id="multi-subtitle"
                      checked={outputConfig.multiSubtitle}
                      onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, multiSubtitle: checked }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="closed-captions">Closed Captions</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable closed captions support
                    </div>
                  </div>
                  <Switch
                    id="closed-captions"
                    checked={outputConfig.closedCaptions}
                    onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, closedCaptions: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quality-based">Quality Based</Label>
                    <div className="text-sm text-muted-foreground">
                      Use CRF instead of bitrate
                    </div>
                  </div>
                  <Switch
                    id="quality-based"
                    checked={outputConfig.qualityBased}
                    onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, qualityBased: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* MPEG-TS Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  MPEG-TS Parameters
                </CardTitle>
                <CardDescription>
                  Transport stream configuration for MPEG-TS outputs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="mpegts-service-id">Service ID</Label>
                    <Input
                      id="mpegts-service-id"
                      type="number"
                      value={outputConfig.mpegtsServiceId}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsServiceId: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mpegts-transport-stream-id">Transport Stream ID</Label>
                    <Input
                      id="mpegts-transport-stream-id"
                      type="number"
                      value={outputConfig.mpegtsTransportStreamId}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsTransportStreamId: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mpegts-original-network-id">Original Network ID</Label>
                    <Input
                      id="mpegts-original-network-id"
                      type="number"
                      value={outputConfig.mpegtsOriginalNetworkId}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsOriginalNetworkId: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="mpegts-pid-video">Video PID</Label>
                    <Input
                      id="mpegts-pid-video"
                      type="number"
                      value={outputConfig.mpegtsPidVideo}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsPidVideo: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mpegts-pid-audio">Audio PID</Label>
                    <Input
                      id="mpegts-pid-audio"
                      type="number"
                      value={outputConfig.mpegtsPidAudio}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsPidAudio: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mpegts-pid-scte35">SCTE-35 PID</Label>
                    <Input
                      id="mpegts-pid-scte35"
                      type="number"
                      value={outputConfig.mpegtsPidScte35}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsPidScte35: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mpegts-pid-pmt">PMT PID</Label>
                    <Input
                      id="mpegts-pid-pmt"
                      type="number"
                      value={outputConfig.mpegtsPidPmt}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsPidPmt: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="mpegts-pid-pat">PAT PID</Label>
                    <Input
                      id="mpegts-pid-pat"
                      type="number"
                      value={outputConfig.mpegtsPidPat}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsPidPat: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mpegts-pcr-period">PCR Period (ms)</Label>
                    <Input
                      id="mpegts-pcr-period"
                      type="number"
                      value={outputConfig.mpegtsPcrPeriod}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsPcrPeriod: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mpegts-tables-version">Tables Version</Label>
                    <Input
                      id="mpegts-tables-version"
                      type="number"
                      value={outputConfig.mpegtsTablesVersion}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsTablesVersion: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="mpegts-pat-period">PAT Period (ms)</Label>
                    <Input
                      id="mpegts-pat-period"
                      type="number"
                      value={outputConfig.mpegtsPatPeriod}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsPatPeriod: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mpegts-sdt-period">SDT Period (ms)</Label>
                    <Input
                      id="mpegts-sdt-period"
                      type="number"
                      value={outputConfig.mpegtsSdtPeriod}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsSdtPeriod: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pes-payload-size">PES Payload Size</Label>
                    <Input
                      id="pes-payload-size"
                      type="number"
                      value={outputConfig.pesPayloadSize}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, pesPayloadSize: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="mpegts-flags">MPEG-TS Flags</Label>
                  <div className="space-y-2">
                    {[
                      'resend_headers',
                      'pat_period',
                      'pmt_period',
                      'sdt_period',
                      'latency',
                      'adaptive',
                      'atsc',
                      'dvb',
                      'isdb'
                    ].map((flag) => (
                      <div key={flag} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`mpegts-flag-${flag}`}
                          checked={outputConfig.mpegtsFlags?.includes(`+${flag}`) || false}
                          onChange={(e) => {
                            const currentFlags = outputConfig.mpegtsFlags || []
                            if (e.target.checked) {
                              setOutputConfig(prev => ({ 
                                ...prev, 
                                mpegtsFlags: [...currentFlags, `+${flag}`]
                              }))
                            } else {
                              setOutputConfig(prev => ({ 
                                ...prev, 
                                mpegtsFlags: currentFlags.filter(f => f !== `+${flag}`)
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={`mpegts-flag-${flag}`} className="text-sm">
                          +{flag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="transport-stream">Transport Stream</Label>
                      <div className="text-sm text-muted-foreground">
                        Enable MPEG-TS transport stream
                      </div>
                    </div>
                    <Switch
                      id="transport-stream"
                      checked={outputConfig.transportStream}
                      onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, transportStream: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="m2ts-mode">M2TS Mode</Label>
                      <div className="text-sm text-muted-foreground">
                        Blu-ray M2TS format
                      </div>
                    </div>
                    <Switch
                      id="m2ts-mode"
                      checked={outputConfig.m2tsMode}
                      onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, m2tsMode: checked }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mpegts-service-type">Service Type</Label>
                    <Select 
                      value={outputConfig.mpegtsServiceType?.toString()} 
                      onValueChange={(value) => setOutputConfig(prev => ({ ...prev, mpegtsServiceType: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label htmlFor="ts-packet-size">TS Packet Size</Label>
                    <Select 
                      value={outputConfig.tsPacketSize?.toString()} 
                      onValueChange={(value) => setOutputConfig(prev => ({ ...prev, tsPacketSize: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="188">188 bytes (Standard)</SelectItem>
                        <SelectItem value="192">192 bytes (M2TS)</SelectItem>
                        <SelectItem value="204">204 bytes (ATSC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mpegts-provider-name">Provider Name</Label>
                    <Input
                      id="mpegts-provider-name"
                      value={outputConfig.mpegtsProviderName}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsProviderName: e.target.value }))}
                      placeholder="Provider name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mpegts-service-name">Service Name</Label>
                    <Input
                      id="mpegts-service-name"
                      value={outputConfig.mpegtsServiceName}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsServiceName: e.target.value }))}
                      placeholder="Service name"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SCTE-35 Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  SCTE-35 Parameters
                </CardTitle>
                <CardDescription>
                  SCTE-35 cue tone configuration for ad insertion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="scte35-enabled">Enable SCTE-35</Label>
                      <div className="text-sm text-muted-foreground">
                        Enable SCTE-35 cue tone processing
                      </div>
                    </div>
                    <Switch
                      id="scte35-enabled"
                      checked={outputConfig.scte35Enabled}
                      onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, scte35Enabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="scte35-passthrough">Passthrough</Label>
                      <div className="text-sm text-muted-foreground">
                        Pass through SCTE-35 from input
                      </div>
                    </div>
                    <Switch
                      id="scte35-passthrough"
                      checked={outputConfig.scte35Passthrough}
                      onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, scte35Passthrough: checked }))}
                    />
                  </div>
                </div>

                {outputConfig.scte35Enabled && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="scte35-pid">SCTE-35 PID</Label>
                        <Input
                          id="scte35-pid"
                          type="number"
                          value={outputConfig.scte35Pid}
                          onChange={(e) => setOutputConfig(prev => ({ ...prev, scte35Pid: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="scte35-pmt-pid">SCTE-35 PMT PID</Label>
                        <Input
                          id="scte35-pmt-pid"
                          type="number"
                          value={outputConfig.scte35PmtPid}
                          onChange={(e) => setOutputConfig(prev => ({ ...prev, scte35PmtPid: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="video-pmt-pid">Video PMT PID</Label>
                        <Input
                          id="video-pmt-pid"
                          type="number"
                          value={outputConfig.videoPmtPid}
                          onChange={(e) => setOutputConfig(prev => ({ ...prev, videoPmtPid: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="audio-pmt-pid">Audio PMT PID</Label>
                        <Input
                          id="audio-pmt-pid"
                          type="number"
                          value={outputConfig.audioPmtPid}
                          onChange={(e) => setOutputConfig(prev => ({ ...prev, audioPmtPid: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pcr-pid">PCR PID</Label>
                        <Input
                          id="pcr-pid"
                          type="number"
                          value={outputConfig.pcrPid}
                          onChange={(e) => setOutputConfig(prev => ({ ...prev, pcrPid: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="scte35-insert-events">Insert Events</Label>
                          <div className="text-sm text-muted-foreground">
                            Insert SCTE-35 events
                          </div>
                        </div>
                        <Switch
                          id="scte35-insert-events"
                          checked={outputConfig.scte35InsertEvents}
                          onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, scte35InsertEvents: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="scte35-force-passthrough">Force Passthrough</Label>
                          <div className="text-sm text-muted-foreground">
                            Force SCTE-35 passthrough
                          </div>
                        </div>
                        <Switch
                          id="scte35-force-passthrough"
                          checked={outputConfig.scte35ForcePassthrough}
                          onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, scte35ForcePassthrough: checked }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="scte35-null-passthrough">Null Passthrough</Label>
                        <div className="text-sm text-muted-foreground">
                          Passthrough null SCTE-35 packets
                        </div>
                      </div>
                      <Switch
                        id="scte35-null-passthrough"
                        checked={outputConfig.scte35NullPassthrough}
                        onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, scte35NullPassthrough: checked }))}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Broadcast Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  Broadcast Parameters
                </CardTitle>
                <CardDescription>
                  Broadcast standard and transport stream settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="broadcast-standard">Broadcast Standard</Label>
                    <Select 
                      value={outputConfig.broadcastStandard} 
                      onValueChange={(value: any) => setOutputConfig(prev => ({ ...prev, broadcastStandard: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="atsc">ATSC</SelectItem>
                        <SelectItem value="dvb">DVB</SelectItem>
                        <SelectItem value="isdb">ISDB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pcr-period">PCR Period (ms)</Label>
                    <Input
                      id="pcr-period"
                      type="number"
                      value={outputConfig.pcrPeriod}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, pcrPeriod: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pat-interval">PAT Interval (ms)</Label>
                    <Input
                      id="pat-interval"
                      type="number"
                      value={outputConfig.patInterval}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, patInterval: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pmt-interval">PMT Interval (ms)</Label>
                    <Input
                      id="pmt-interval"
                      type="number"
                      value={outputConfig.pmtInterval}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, pmtInterval: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sdt-interval">SDT Interval (ms)</Label>
                    <Input
                      id="sdt-interval"
                      type="number"
                      value={outputConfig.sdtInterval}
                      onChange={(e) => setOutputConfig(prev => ({ ...prev, sdtInterval: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ts-packet-size-broadcast">TS Packet Size</Label>
                    <Select 
                      value={outputConfig.tsPacketSize?.toString()} 
                      onValueChange={(value) => setOutputConfig(prev => ({ ...prev, tsPacketSize: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="188">188 bytes</SelectItem>
                        <SelectItem value="192">192 bytes</SelectItem>
                        <SelectItem value="204">204 bytes</SelectItem>
                        <SelectItem value="208">208 bytes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="continuity-counter">Continuity Counter</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable continuity counter
                    </div>
                  </div>
                  <Switch
                    id="continuity-counter"
                    checked={outputConfig.continuityCounter}
                    onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, continuityCounter: checked }))}
                  />
                </div>

                {outputConfig.broadcastStandard === 'atsc' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900">ATSC Configuration</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        ATSC broadcast standard configuration for North American markets
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="atsc-video-pid">Video PID (ATSC)</Label>
                        <Input
                          id="atsc-video-pid"
                          type="number"
                          value={outputConfig.mpegtsPidVideo}
                          onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsPidVideo: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="atsc-audio-pid">Audio PID (ATSC)</Label>
                        <Input
                          id="atsc-audio-pid"
                          type="number"
                          value={outputConfig.mpegtsPidAudio}
                          onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsPidAudio: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {outputConfig.broadcastStandard === 'dvb' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-900">DVB Configuration</h5>
                      <p className="text-sm text-green-700 mt-1">
                        DVB broadcast standard configuration for European and international markets
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dvb-video-pid">Video PID (DVB)</Label>
                        <Input
                          id="dvb-video-pid"
                          type="number"
                          value={outputConfig.mpegtsPidVideo}
                          onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsPidVideo: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dvb-audio-pid">Audio PID (DVB)</Label>
                        <Input
                          id="dvb-audio-pid"
                          type="number"
                          value={outputConfig.mpegtsPidAudio}
                          onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsPidAudio: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {outputConfig.broadcastStandard === 'isdb' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-medium text-purple-900">ISDB Configuration</h5>
                      <p className="text-sm text-purple-700 mt-1">
                        ISDB broadcast standard configuration for Japanese and South American markets
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="isdb-video-pid">Video PID (ISDB)</Label>
                        <Input
                          id="isdb-video-pid"
                          type="number"
                          value={outputConfig.mpegtsPidVideo}
                          onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsPidVideo: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="isdb-audio-pid">Audio PID (ISDB)</Label>
                        <Input
                          id="isdb-audio-pid"
                          type="number"
                          value={outputConfig.mpegtsPidAudio}
                          onChange={(e) => setOutputConfig(prev => ({ ...prev, mpegtsPidAudio: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monitoring Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Monitoring Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="monitoring">Enable Monitoring</Label>
                      <div className="text-sm text-muted-foreground">
                        Monitor stream health
                      </div>
                    </div>
                    <Switch
                      id="monitoring"
                      checked={outputConfig.monitoringEnabled}
                      onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, monitoringEnabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="health-checks">Health Checks</Label>
                      <div className="text-sm text-muted-foreground">
                        Automated health checks
                      </div>
                    </div>
                    <Switch
                      id="health-checks"
                      checked={outputConfig.healthChecks}
                      onCheckedChange={(checked) => setOutputConfig(prev => ({ ...prev, healthChecks: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Alert Thresholds</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cpu-threshold">CPU (%)</Label>
                      <Slider
                        value={[outputConfig.alertThresholds.cpu]}
                        onValueChange={(value) => setOutputConfig(prev => ({ 
                          ...prev, 
                          alertThresholds: { ...prev.alertThresholds, cpu: value[0] }
                        }))}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {outputConfig.alertThresholds.cpu}%
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="memory-threshold">Memory (%)</Label>
                      <Slider
                        value={[outputConfig.alertThresholds.memory]}
                        onValueChange={(value) => setOutputConfig(prev => ({ 
                          ...prev, 
                          alertThresholds: { ...prev.alertThresholds, memory: value[0] }
                        }))}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {outputConfig.alertThresholds.memory}%
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="network-threshold">Network (%)</Label>
                      <Slider
                        value={[outputConfig.alertThresholds.network]}
                        onValueChange={(value) => setOutputConfig(prev => ({ 
                          ...prev, 
                          alertThresholds: { ...prev.alertThresholds, network: value[0] }
                        }))}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {outputConfig.alertThresholds.network}%
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bitrate-threshold">Bitrate (Kbps)</Label>
                      <Slider
                        value={[outputConfig.alertThresholds.bitrate]}
                        onValueChange={(value) => setOutputConfig(prev => ({ 
                          ...prev, 
                          alertThresholds: { ...prev.alertThresholds, bitrate: value[0] }
                        }))}
                        max={50000}
                        min={0}
                        step={100}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {outputConfig.alertThresholds.bitrate} Kbps
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="latency-threshold">Latency (ms)</Label>
                      <Slider
                        value={[outputConfig.alertThresholds.latency]}
                        onValueChange={(value) => setOutputConfig(prev => ({ 
                          ...prev, 
                          alertThresholds: { ...prev.alertThresholds, latency: value[0] }
                        }))}
                        max={10000}
                        min={0}
                        step={100}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {outputConfig.alertThresholds.latency} ms
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="dropped-frames-threshold">Dropped Frames</Label>
                      <Slider
                        value={[outputConfig.alertThresholds.droppedFrames]}
                        onValueChange={(value) => setOutputConfig(prev => ({ 
                          ...prev, 
                          alertThresholds: { ...prev.alertThresholds, droppedFrames: value[0] }
                        }))}
                        max={1000}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {outputConfig.alertThresholds.droppedFrames}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Presets
                </CardTitle>
                <CardDescription>
                  Apply pre-configured settings for common use cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {outputPresets.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start"
                      onClick={() => applyPreset(preset)}
                    >
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-sm text-muted-foreground">{preset.type}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {preset.config.resolution} • {preset.config.bitrate} Kbps
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOutputConfigOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveOutputConfig}>
                {selectedOutput ? 'Update Output' : 'Create Output'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}