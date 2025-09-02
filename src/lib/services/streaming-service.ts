import { db } from '@/lib/db'
import { FFmpegService, FFmpegProcess } from './ffmpeg-service'

export interface StreamConfig {
  bitrate?: number
  resolution?: string
  framerate?: number
  codec?: string
  keyFrameInterval?: number
  bufferSize?: number
  latency?: number
  redundancy?: number
  
  // Advanced video parameters
  videoCodec?: 'h264' | 'h265' | 'vp9' | 'av1'
  videoProfile?: 'baseline' | 'main' | 'high' | 'high10' | 'high422' | 'high444'
  videoLevel?: string
  maxBitrate?: number
  bFrames?: number
  referenceFrames?: number
  crfValue?: number
  preset?: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow'
  tune?: 'film' | 'animation' | 'grain' | 'stillimage' | 'fastdecode' | 'zerolatency'
  
  // Audio parameters
  audioCodec?: 'aac' | 'mp3' | 'opus' | 'ac3' | 'mp2'
  audioBitrate?: number
  audioSampleRate?: number
  audioChannels?: number
  
  // Streaming parameters
  segmentDuration?: number
  segmentListSize?: number
  playlistType?: 'event' | 'vod' | 'live'
  hlsVersion?: number
  dashProfile?: string
  
  // Network parameters
  packetSize?: number
  bandwidth?: number
  
  // Security parameters
  encryption?: boolean
  drmEnabled?: boolean
  drmType?: 'widevine' | 'playready' | 'fairplay' | 'clearkey'
  encryptionKey?: string
  encryptionIV?: string
  
  // Advanced features
  transcodingEnabled?: boolean
  adaptiveBitrate?: boolean
  multiAudio?: boolean
  multiSubtitle?: boolean
  closedCaptions?: boolean
  qualityBased?: boolean
  
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
  mpegtsServiceType?: number
  mpegtsProviderName?: string
  mpegtsServiceName?: string
  
  // SCTE-35 Configuration
  scte35Enabled?: boolean
  scte35Passthrough?: boolean
  scte35Pid?: number
  scte35InsertEvents?: boolean
  scte35ForcePassthrough?: boolean
  scte35NullPassthrough?: boolean
  
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
  monitoringEnabled?: boolean
  healthChecks?: boolean
  alertThresholds?: {
    cpu?: number
    memory?: number
    network?: number
    bitrate?: number
    latency?: number
    droppedFrames?: number
  }
}

export interface StreamInputData {
  name: string
  type: 'HLS' | 'RTMP' | 'SRT'
  url: string
  channelId: string
  config?: StreamConfig
}

export interface StreamOutputData {
  name: string
  type: 'HLS' | 'DASH' | 'SRT'
  url: string
  channelId: string
  config?: StreamConfig
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface TestResult {
  success: boolean
  latency?: number
  bitrate?: number
  resolution?: string
  framerate?: number
  droppedFrames?: number
  errors: string[]
  warnings: string[]
  suggestions: string[]
  timestamp: Date
}

export class StreamingService {
  private static instance: StreamingService
  private activeStreams: Map<string, any> = new Map()
  private streamMetrics: Map<string, any> = new Map()
  private ffmpegService: FFmpegService

  private constructor() {
    this.ffmpegService = FFmpegService.getInstance()
    
    // Set up FFmpeg event listeners
    this.ffmpegService.on('process-started', (process: FFmpegProcess) => {
      console.log(`FFmpeg process started for stream ${process.id}`)
    })
    
    this.ffmpegService.on('process-stopped', (data: any) => {
      console.log(`FFmpeg process stopped for stream ${data.streamId}`)
      this.handleProcessStopped(data.streamId, data.code, data.signal)
    })
    
    this.ffmpegService.on('process-error', (data: any) => {
      console.error(`FFmpeg process error for stream ${data.streamId}: ${data.error}`)
      this.handleProcessError(data.streamId, data.error)
    })
  }

  static getInstance(): StreamingService {
    if (!StreamingService.instance) {
      StreamingService.instance = new StreamingService()
    }
    return StreamingService.instance
  }

  async createStreamInput(inputData: StreamInputData) {
    try {
      // Validate input data before creation
      const validation = await this.validateStreamInput(inputData)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      const streamInput = await db.streamInput.create({
        data: {
          name: inputData.name,
          type: inputData.type,
          url: inputData.url,
          channelId: inputData.channelId,
          config: JSON.stringify(inputData.config || {}),
          status: 'DISCONNECTED'
        },
        include: {
          channel: true
        }
      })

      return streamInput
    } catch (error) {
      console.error('Error creating stream input:', error)
      throw error
    }
  }

  async createStreamOutput(outputData: StreamOutputData) {
    try {
      // Validate output data before creation
      const validation = await this.validateStreamOutput(outputData)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      const streamOutput = await db.streamOutput.create({
        data: {
          name: outputData.name,
          type: outputData.type,
          url: outputData.url,
          channelId: outputData.channelId,
          config: JSON.stringify(outputData.config || {}),
          status: 'STOPPED'
        },
        include: {
          channel: true
        }
      })

      return streamOutput
    } catch (error) {
      console.error('Error creating stream output:', error)
      throw error
    }
  }

  async validateStreamInput(inputData: StreamInputData): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Basic validation
    if (!inputData.name || inputData.name.trim() === '') {
      errors.push('Stream input name is required')
    }

    if (!inputData.type || !['HLS', 'RTMP', 'SRT'].includes(inputData.type)) {
      errors.push('Valid input type is required (HLS, RTMP, SRT)')
    }

    if (!inputData.url || inputData.url.trim() === '') {
      errors.push('Stream URL is required')
    }

    // URL validation
    try {
      const urlObj = new URL(inputData.url)
      
      // Protocol validation
      switch (inputData.type) {
        case 'HLS':
          if (!['http:', 'https:'].includes(urlObj.protocol)) {
            errors.push('HLS input must use HTTP or HTTPS protocol')
          }
          if (!urlObj.pathname.endsWith('.m3u8') && !urlObj.pathname.includes('.m3u8')) {
            warnings.push('HLS URL should typically point to an .m3u8 playlist')
          }
          break
        case 'RTMP':
          if (!['rtmp:', 'rtmps:'].includes(urlObj.protocol)) {
            errors.push('RTMP input must use RTMP or RTMPS protocol')
          }
          break
        case 'SRT':
          if (!['srt:'].includes(urlObj.protocol)) {
            errors.push('SRT input must use SRT protocol')
          }
          break
      }
    } catch (urlError) {
      errors.push('Invalid URL format')
    }

    // Configuration validation
    if (inputData.config) {
      const config = inputData.config
      
      // Video codec validation
      if (config.videoCodec && !['h264', 'h265', 'vp9', 'av1'].includes(config.videoCodec)) {
        errors.push('Invalid video codec specified')
      }

      // Bitrate validation
      if (config.bitrate) {
        if (config.bitrate < 100 || config.bitrate > 100000) {
          warnings.push('Bitrate should be between 100 Kbps and 100 Mbps')
        }
      }

      // Resolution validation
      if (config.resolution) {
        const validResolutions = [
          '426x240', '640x360', '854x480', '1280x720', 
          '1920x1080', '2560x1440', '3840x2160'
        ]
        if (!validResolutions.includes(config.resolution)) {
          warnings.push('Non-standard resolution detected')
        }
      }

      // Framerate validation
      if (config.framerate) {
        const validFramerates = [24, 25, 30, 50, 60, 120]
        if (!validFramerates.includes(config.framerate)) {
          warnings.push('Non-standard framerate may cause compatibility issues')
        }
      }

      // Audio validation
      if (config.audioCodec && !['aac', 'mp3', 'opus', 'ac3'].includes(config.audioCodec)) {
        errors.push('Invalid audio codec specified')
      }

      if (config.audioBitrate) {
        if (config.audioBitrate < 32 || config.audioBitrate > 320) {
          warnings.push('Audio bitrate should be between 32 Kbps and 320 Kbps')
        }
      }
    }

    // Performance suggestions
    if (inputData.type === 'SRT' && inputData.config?.latency) {
      if (inputData.config.latency > 5000) {
        suggestions.push('For better SRT performance, consider reducing latency below 5000ms')
      }
    }

    if (inputData.type === 'HLS' && inputData.config?.segmentDuration) {
      if (inputData.config.segmentDuration > 10) {
        suggestions.push('For live streaming, consider using segment durations of 2-6 seconds')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  async validateStreamOutput(outputData: StreamOutputData): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Basic validation
    if (!outputData.name || outputData.name.trim() === '') {
      errors.push('Stream output name is required')
    }

    if (!outputData.type || !['HLS', 'DASH', 'SRT'].includes(outputData.type)) {
      errors.push('Valid output type is required (HLS, DASH, SRT)')
    }

    if (!outputData.url || outputData.url.trim() === '') {
      errors.push('Stream URL is required')
    }

    // URL validation
    try {
      const urlObj = new URL(outputData.url)
      
      // Protocol validation
      switch (outputData.type) {
        case 'HLS':
          if (!['http:', 'https:'].includes(urlObj.protocol)) {
            errors.push('HLS output must use HTTP or HTTPS protocol')
          }
          if (!urlObj.pathname.endsWith('.m3u8') && !urlObj.pathname.includes('.m3u8')) {
            warnings.push('HLS output URL should typically point to an .m3u8 playlist')
          }
          break
        case 'DASH':
          if (!['http:', 'https:'].includes(urlObj.protocol)) {
            errors.push('DASH output must use HTTP or HTTPS protocol')
          }
          if (!urlObj.pathname.endsWith('.mpd') && !urlObj.pathname.includes('.mpd')) {
            warnings.push('DASH output URL should typically point to an .mpd manifest')
          }
          break
        case 'SRT':
          if (!['srt:'].includes(urlObj.protocol)) {
            errors.push('SRT output must use SRT protocol')
          }
          break
      }
    } catch (urlError) {
      errors.push('Invalid URL format')
    }

    // Configuration validation
    if (outputData.config) {
      const config = outputData.config
      
      // Video codec validation
      if (config.videoCodec && !['h264', 'h265', 'vp9', 'av1'].includes(config.videoCodec)) {
        errors.push('Invalid video codec specified')
      }

      // Bitrate validation
      if (config.bitrate) {
        if (config.bitrate < 100 || config.bitrate > 100000) {
          warnings.push('Bitrate should be between 100 Kbps and 100 Mbps')
        }
        
        if (config.maxBitrate && config.maxBitrate < config.bitrate) {
          errors.push('Max bitrate must be greater than target bitrate')
        }
      }

      // Resolution validation
      if (config.resolution) {
        const validResolutions = [
          '426x240', '640x360', '854x480', '1280x720', 
          '1920x1080', '2560x1440', '3840x2160'
        ]
        if (!validResolutions.includes(config.resolution)) {
          warnings.push('Non-standard resolution detected')
        }
      }

      // Framerate validation
      if (config.framerate) {
        const validFramerates = [24, 25, 30, 50, 60, 120]
        if (!validFramerates.includes(config.framerate)) {
          warnings.push('Non-standard framerate may cause compatibility issues')
        }
      }

      // Audio validation
      if (config.audioCodec && !['aac', 'mp3', 'opus', 'ac3'].includes(config.audioCodec)) {
        errors.push('Invalid audio codec specified')
      }

      if (config.audioBitrate) {
        if (config.audioBitrate < 32 || config.audioBitrate > 320) {
          warnings.push('Audio bitrate should be between 32 Kbps and 320 Kbps')
        }
      }

      // HLS-specific validation
      if (outputData.type === 'HLS') {
        if (config.segmentDuration) {
          if (config.segmentDuration < 1 || config.segmentDuration > 60) {
            warnings.push('HLS segment duration should be between 1 and 60 seconds')
          }
        }
        
        if (config.hlsVersion && (config.hlsVersion < 3 || config.hlsVersion > 7)) {
          warnings.push('HLS version should be between 3 and 7')
        }
      }

      // DASH-specific validation
      if (outputData.type === 'DASH') {
        if (config.segmentDuration) {
          if (config.segmentDuration < 1 || config.segmentDuration > 10) {
            warnings.push('DASH segment duration should be between 1 and 10 seconds')
          }
        }
      }

      // SRT-specific validation
      if (outputData.type === 'SRT') {
        if (config.latency) {
          if (config.latency < 50 || config.latency > 10000) {
            warnings.push('SRT latency should be between 50ms and 10000ms')
          }
        }
        
        if (config.packetSize) {
          if (config.packetSize < 188 || config.packetSize > 1456) {
            warnings.push('SRT packet size should be between 188 and 1456 bytes')
          }
        }
      }

      // Security validation
      if (config.encryption && !config.encryptionKey) {
        errors.push('Encryption key is required when encryption is enabled')
      }

      if (config.drmEnabled && !config.drmType) {
        errors.push('DRM type is required when DRM is enabled')
      }

      // Advanced features validation
      if (config.adaptiveBitrate && !config.bitrate) {
        warnings.push('Target bitrate is recommended for adaptive bitrate streams')
      }

      if (config.qualityBased && config.bitrate) {
        warnings.push('Quality-based encoding (CRF) may conflict with fixed bitrate settings')
      }
    }

    // Performance suggestions
    if (outputData.type === 'HLS') {
      if (!outputData.config?.adaptiveBitrate) {
        suggestions.push('Consider enabling adaptive bitrate for better viewer experience')
      }
    }

    if (outputData.type === 'SRT' && outputData.config?.latency) {
      if (outputData.config.latency > 2000) {
        suggestions.push('For interactive content, consider SRT latency below 2000ms')
      }
    }

    if (outputData.config?.videoCodec === 'h265') {
      suggestions.push('H.265 offers better compression but may have limited device compatibility')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  async testStreamConnection(url: string, type: 'HLS' | 'RTMP' | 'SRT' | 'DASH'): Promise<TestResult> {
    try {
      const startTime = Date.now()
      
      // Simulate connection test with realistic delays
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))
      
      const latency = Date.now() - startTime
      
      // Simulate random success/failure with different probabilities by type
      const successRates = {
        HLS: 0.9,
        RTMP: 0.85,
        SRT: 0.8,
        DASH: 0.9
      }
      
      const success = Math.random() < successRates[type]
      
      if (!success) {
        return {
          success: false,
          errors: ['Connection failed', 'Unable to establish connection to stream'],
          warnings: [],
          suggestions: [
            'Check if the stream URL is correct',
            'Verify the stream source is available',
            'Check network connectivity and firewall settings'
          ],
          timestamp: new Date()
        }
      }

      // Generate realistic test results
      const bitrates = {
        HLS: [8000, 12000, 15000, 20000],
        RTMP: [6000, 8000, 10000, 12000],
        SRT: [8000, 10000, 12000, 15000],
        DASH: [10000, 15000, 20000, 25000]
      }
      
      const resolutions = ['1280x720', '1920x1080', '2560x1440', '3840x2160']
      const framerates = [24, 25, 30, 50, 60]
      
      const bitrate = bitrates[type][Math.floor(Math.random() * bitrates[type].length)]
      const resolution = resolutions[Math.floor(Math.random() * resolutions.length)]
      const framerate = framerates[Math.floor(Math.random() * framerates.length)]
      const droppedFrames = Math.floor(Math.random() * 10)

      const warnings: string[] = []
      const suggestions: string[] = []

      // Generate warnings based on metrics
      if (latency > 3000) {
        warnings.push('High latency detected')
        suggestions.push('Consider optimizing network path or reducing distance to server')
      }

      if (droppedFrames > 5) {
        warnings.push('Frame drops detected')
        suggestions.push('Check network stability and reduce bitrate if necessary')
      }

      if (bitrate > 15000) {
        warnings.push('High bitrate may cause buffering on slower connections')
        suggestions.push('Consider adaptive bitrate for better compatibility')
      }

      return {
        success: true,
        latency,
        bitrate,
        resolution,
        framerate,
        droppedFrames,
        errors: [],
        warnings,
        suggestions,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        warnings: [],
        suggestions: [
          'Check if the stream URL is correct',
          'Verify the stream source is available',
          'Check network connectivity and firewall settings'
        ],
        timestamp: new Date()
      }
    }
  }

  async validateStreamConfig(config: StreamConfig, type: 'HLS' | 'DASH' | 'SRT'): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Video codec validation
    if (config.videoCodec && !['h264', 'h265', 'vp9', 'av1'].includes(config.videoCodec)) {
      errors.push('Invalid video codec specified')
    }

    // Audio codec validation
    if (config.audioCodec && !['aac', 'mp3', 'opus', 'ac3'].includes(config.audioCodec)) {
      errors.push('Invalid audio codec specified')
    }

    // Bitrate validation
    if (config.bitrate) {
      if (config.bitrate < 100 || config.bitrate > 100000) {
        warnings.push('Bitrate should be between 100 Kbps and 100 Mbps')
      }
      
      if (config.maxBitrate && config.maxBitrate < config.bitrate) {
        errors.push('Max bitrate must be greater than target bitrate')
      }
    }

    // Resolution validation
    if (config.resolution) {
      const validResolutions = [
        '426x240', '640x360', '854x480', '1280x720', 
        '1920x1080', '2560x1440', '3840x2160'
      ]
      if (!validResolutions.includes(config.resolution)) {
        warnings.push('Non-standard resolution detected')
      }
    }

    // Framerate validation
    if (config.framerate) {
      const validFramerates = [24, 25, 30, 50, 60, 120]
      if (!validFramerates.includes(config.framerate)) {
        warnings.push('Non-standard framerate may cause compatibility issues')
      }
    }

    // Type-specific validation
    switch (type) {
      case 'HLS':
        if (config.segmentDuration) {
          if (config.segmentDuration < 1 || config.segmentDuration > 60) {
            warnings.push('HLS segment duration should be between 1 and 60 seconds')
          }
        }
        
        if (config.hlsVersion && (config.hlsVersion < 3 || config.hlsVersion > 7)) {
          warnings.push('HLS version should be between 3 and 7')
        }
        
        if (!config.adaptiveBitrate) {
          suggestions.push('Consider enabling adaptive bitrate for HLS streams')
        }
        break

      case 'DASH':
        if (config.segmentDuration) {
          if (config.segmentDuration < 1 || config.segmentDuration > 10) {
            warnings.push('DASH segment duration should be between 1 and 10 seconds')
          }
        }
        
        if (!config.adaptiveBitrate) {
          suggestions.push('Consider enabling adaptive bitrate for DASH streams')
        }
        break

      case 'SRT':
        if (config.latency) {
          if (config.latency < 50 || config.latency > 10000) {
            warnings.push('SRT latency should be between 50ms and 10000ms')
          }
        }
        
        if (config.packetSize) {
          if (config.packetSize < 188 || config.packetSize > 1456) {
            warnings.push('SRT packet size should be between 188 and 1456 bytes')
          }
        }
        break
    }

    // Security validation
    if (config.encryption && !config.encryptionKey) {
      errors.push('Encryption key is required when encryption is enabled')
    }

    if (config.drmEnabled && !config.drmType) {
      errors.push('DRM type is required when DRM is enabled')
    }

    // Advanced features validation
    if (config.qualityBased && config.bitrate) {
      warnings.push('Quality-based encoding (CRF) may conflict with fixed bitrate settings')
    }

    if (config.crfValue) {
      if (config.crfValue < 0 || config.crfValue > 51) {
        errors.push('CRF value must be between 0 and 51')
      }
    }

    // Performance suggestions
    if (config.videoCodec === 'h265') {
      suggestions.push('H.265 offers better compression but may have limited device compatibility')
    }

    if (config.videoCodec === 'av1') {
      suggestions.push('AV1 provides excellent compression but requires modern devices for playback')
    }

    if (config.preset === 'veryslow' && type === 'SRT') {
      warnings.push('Very slow preset may cause high latency for real-time streaming')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  async startStreamInput(inputId: string) {
    try {
      const input = await db.streamInput.findUnique({
        where: { id: inputId },
        include: { channel: true }
      })

      if (!input) {
        throw new Error('Stream input not found')
      }

      // Validate configuration before starting
      const config = JSON.parse(input.config)
      const validation = await this.validateStreamConfig(config, input.type)
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`)
      }

      // Update status to connecting
      await db.streamInput.update({
        where: { id: inputId },
        data: { status: 'CONNECTING' }
      })

      // Simulate connection process
      setTimeout(async () => {
        try {
          // Here you would integrate with your streaming infrastructure
          // to actually connect to the input source
          console.log(`Connecting to ${input.type} input: ${input.url}`)
          
          // Test connection before finalizing
          const testResult = await this.testStreamConnection(input.url, input.type)
          if (!testResult.success) {
            throw new Error(`Connection test failed: ${testResult.errors.join(', ')}`)
          }
          
          // Store active stream reference
          this.activeStreams.set(inputId, {
            type: 'input',
            url: input.url,
            connected: true,
            startTime: new Date(),
            config: config
          })

          // Store initial metrics
          this.streamMetrics.set(inputId, {
            ...testResult,
            lastUpdate: new Date()
          })

          // Update status to connected
          await db.streamInput.update({
            where: { id: inputId },
            data: { status: 'CONNECTED' }
          })

          // Update channel status if this is the first input
          const channelInputs = await db.streamInput.findMany({
            where: { 
              channelId: input.channelId,
              status: 'CONNECTED'
            }
          })

          if (channelInputs.length === 1) {
            await db.broadcastChannel.update({
              where: { id: input.channelId },
              data: { status: 'ONLINE' }
            })
          }
        } catch (error) {
          console.error('Error connecting to stream input:', error)
          await db.streamInput.update({
            where: { id: inputId },
            data: { status: 'ERROR' }
          })
        }
      }, 2000)

      return input
    } catch (error) {
      console.error('Error starting stream input:', error)
      throw error
    }
  }

  async stopStreamInput(inputId: string) {
    try {
      const input = await db.streamInput.findUnique({
        where: { id: inputId },
        include: { channel: true }
      })

      if (!input) {
        throw new Error('Stream input not found')
      }

      // Remove from active streams
      this.activeStreams.delete(inputId)
      this.streamMetrics.delete(inputId)

      // Update status to disconnected
      await db.streamInput.update({
        where: { id: inputId },
        data: { status: 'DISCONNECTED' }
      })

      // Check if channel should go offline
      const channelInputs = await db.streamInput.findMany({
        where: { 
          channelId: input.channelId,
          status: 'CONNECTED'
        }
      })

      if (channelInputs.length === 0) {
        await db.broadcastChannel.update({
          where: { id: input.channelId },
          data: { status: 'OFFLINE' }
        })
      }

      return input
    } catch (error) {
      console.error('Error stopping stream input:', error)
      throw error
    }
  }

  async startStreamOutput(outputId: string) {
    try {
      const output = await db.streamOutput.findUnique({
        where: { id: outputId },
        include: { channel: true }
      })

      if (!output) {
        throw new Error('Stream output not found')
      }

      // Validate configuration before starting
      const config = JSON.parse(output.config)
      const validation = await this.validateStreamConfig(config, output.type)
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`)
      }

      // Update status to starting
      await db.streamOutput.update({
        where: { id: outputId },
        data: { status: 'STARTING' }
      })

      // Get input URL from channel (first connected input)
      const channelInputs = await db.streamInput.findMany({
        where: { 
          channelId: output.channelId,
          status: 'CONNECTED'
        }
      })

      if (channelInputs.length === 0) {
        throw new Error('No connected input streams found for this channel')
      }

      // Check if there are already running outputs for this channel
      const runningOutputs = await db.streamOutput.findMany({
        where: { 
          channelId: output.channelId,
          status: 'RUNNING'
        }
      })

      if (runningOutputs.length > 0) {
        console.warn(`Channel ${output.channelId} already has ${runningOutputs.length} running outputs`)
        // Allow multiple outputs but log a warning
      }

      const inputUrl = channelInputs[0].url

      // Test FFmpeg installation
      const ffmpegAvailable = await this.ffmpegService.testFFmpegInstallation()
      if (!ffmpegAvailable) {
        throw new Error('FFmpeg is not installed or not available in PATH')
      }

      // Start real FFmpeg process with distributor compliance
      const ffmpegProcess = await this.ffmpegService.startStream(
        outputId,
        inputUrl,
        output.url,
        config,
        'output',
        true // Use distributor-compliant mode
      )

      // Store active stream reference
      this.activeStreams.set(outputId, {
        type: 'output',
        url: output.url,
        running: true,
        startTime: new Date(),
        config: config,
        ffmpegProcess: ffmpegProcess
      })

      // Store initial metrics
      this.streamMetrics.set(outputId, {
        success: true,
        bitrate: config.bitrate || 8000,
        resolution: config.resolution || '1920x1080',
        framerate: config.framerate || 30,
        latency: config.latency || 2000,
        lastUpdate: new Date()
      })

      // Update status to running (FFmpeg process will handle this via events)
      console.log(`FFmpeg process started for output ${outputId}`)

      return output
    } catch (error) {
      console.error('Error starting stream output:', error)
      await db.streamOutput.update({
        where: { id: outputId },
        data: { status: 'ERROR' }
      })
      throw error
    }
  }

  async stopStreamOutput(outputId: string) {
    try {
      const output = await db.streamOutput.findUnique({
        where: { id: outputId },
        include: { channel: true }
      })

      if (!output) {
        throw new Error('Stream output not found')
      }

      // Update status to stopping
      await db.streamOutput.update({
        where: { id: outputId },
        data: { status: 'STOPPING' }
      })

      // Stop FFmpeg process
      try {
        await this.ffmpegService.stopStream(outputId)
      } catch (ffmpegError) {
        console.warn('Error stopping FFmpeg process:', ffmpegError)
        // Continue with cleanup even if FFmpeg stop fails
      }

      // Remove from active streams
      this.activeStreams.delete(outputId)
      this.streamMetrics.delete(outputId)

      // Update status to stopped
      await db.streamOutput.update({
        where: { id: outputId },
        data: { status: 'STOPPED' }
      })

      return output
    } catch (error) {
      console.error('Error stopping stream output:', error)
      await db.streamOutput.update({
        where: { id: outputId },
        data: { status: 'ERROR' }
      })
      throw error
    }
  }

  async getStreamMetrics(streamId: string) {
    try {
      const activeStream = this.activeStreams.get(streamId)
      if (!activeStream) {
        throw new Error('Stream not active')
      }

      // Get existing metrics or create new ones
      let metrics = this.streamMetrics.get(streamId)
      
      // Simulate collecting stream metrics with realistic variations
      const baseMetrics = metrics || {
        bitrate: Math.random() * 10 + 5, // 5-15 Mbps
        framerate: 30,
        resolution: '1920x1080',
        droppedFrames: Math.floor(Math.random() * 10),
        latency: Math.random() * 2000 + 500, // 500-2500ms
        viewers: Math.floor(Math.random() * 10000) + 1000
      }

      // Add realistic variations
      const newMetrics = {
        bitrate: Math.max(0, baseMetrics.bitrate + (Math.random() - 0.5) * 2),
        framerate: baseMetrics.framerate,
        resolution: baseMetrics.resolution,
        droppedFrames: Math.max(0, baseMetrics.droppedFrames + Math.floor((Math.random() - 0.5) * 3)),
        latency: Math.max(100, baseMetrics.latency + (Math.random() - 0.5) * 200),
        viewers: Math.max(0, baseMetrics.viewers + Math.floor((Math.random() - 0.5) * 100)),
        uptime: Date.now() - activeStream.startTime.getTime(),
        timestamp: new Date()
      }

      // Update stored metrics
      this.streamMetrics.set(streamId, {
        ...newMetrics,
        lastUpdate: new Date()
      })

      // Store metrics in database
      await db.monitoringData.create({
        data: {
          metricType: 'BITRATE',
          value: newMetrics.bitrate,
          metadata: JSON.stringify({ streamId, type: activeStream.type })
        }
      })

      await db.monitoringData.create({
        data: {
          metricType: 'DROPPED_FRAMES',
          value: newMetrics.droppedFrames,
          metadata: JSON.stringify({ streamId, type: activeStream.type })
        }
      })

      await db.monitoringData.create({
        data: {
          metricType: 'LATENCY',
          value: newMetrics.latency,
          metadata: JSON.stringify({ streamId, type: activeStream.type })
        }
      })

      await db.monitoringData.create({
        data: {
          metricType: 'FRAMERATE',
          value: newMetrics.framerate,
          metadata: JSON.stringify({ streamId, type: activeStream.type })
        }
      })

      return newMetrics
    } catch (error) {
      console.error('Error getting stream metrics:', error)
      throw error
    }
  }

  async getActiveStreams() {
    try {
      const streams = Array.from(this.activeStreams.entries()).map(([id, stream]) => ({
        id,
        ...stream
      }))

      return streams
    } catch (error) {
      console.error('Error getting active streams:', error)
      throw error
    }
  }

  async getFFmpegProcesses() {
    try {
      return this.ffmpegService.getAllProcesses()
    } catch (error) {
      console.error('Error getting FFmpeg processes:', error)
      throw error
    }
  }

  async getFFmpegProcessStatus(streamId: string) {
    try {
      return this.ffmpegService.getProcess(streamId)
    } catch (error) {
      console.error('Error getting FFmpeg process status:', error)
      throw error
    }
  }

  validateStreamUrl(url: string, type: 'HLS' | 'RTMP' | 'SRT' | 'DASH'): boolean {
    try {
      const urlObj = new URL(url)
      
      switch (type) {
        case 'HLS':
          return urlObj.pathname.endsWith('.m3u8') || urlObj.pathname.includes('.m3u8')
        case 'RTMP':
          return urlObj.protocol === 'rtmp:' || urlObj.protocol === 'rtmps:'
        case 'SRT':
          return urlObj.protocol === 'srt:'
        case 'DASH':
          return urlObj.pathname.endsWith('.mpd') || urlObj.pathname.includes('.mpd')
        default:
          return false
      }
    } catch (error) {
      return false
    }
  }

  async getStreamHealth(streamId: string): Promise<{
    status: 'healthy' | 'warning' | 'critical'
    issues: string[]
    recommendations: string[]
    metrics: any
  }> {
    try {
      const metrics = await this.getStreamMetrics(streamId)
      const issues: string[] = []
      const recommendations: string[] = []

      // Health checks based on metrics
      if (metrics.latency > 5000) {
        issues.push('High latency detected')
        recommendations.push('Check network connectivity and reduce distance to server')
      }

      if (metrics.droppedFrames > 50) {
        issues.push('Excessive frame drops')
        recommendations.push('Reduce bitrate or check network stability')
      }

      if (metrics.bitrate === 0) {
        issues.push('No bitrate detected')
        recommendations.push('Check stream source and connection')
      }

      if (metrics.framerate < 24) {
        issues.push('Low framerate detected')
        recommendations.push('Check source framerate and encoding settings')
      }

      // Determine overall health status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      if (issues.length >= 2 || metrics.latency > 10000 || metrics.droppedFrames > 100) {
        status = 'critical'
      } else if (issues.length > 0) {
        status = 'warning'
      }

      return {
        status,
        issues,
        recommendations,
        metrics
      }
    } catch (error) {
      return {
        status: 'critical',
        issues: ['Unable to retrieve stream metrics'],
        recommendations: ['Check stream connection and try again'],
        metrics: {}
      }
    }
  }

  async optimizeStreamConfig(streamId: string, targetQuality: 'low' | 'medium' | 'high' | 'auto'): Promise<StreamConfig> {
    try {
      const currentMetrics = await this.getStreamMetrics(streamId)
      const activeStream = this.activeStreams.get(streamId)
      
      if (!activeStream) {
        throw new Error('Stream not active')
      }

      const currentConfig = activeStream.config || {}
      const optimizedConfig: StreamConfig = { ...currentConfig }

      // Optimization logic based on target quality and current metrics
      switch (targetQuality) {
        case 'low':
          optimizedConfig.bitrate = Math.max(1000, (currentMetrics.bitrate * 0.6))
          optimizedConfig.resolution = '1280x720'
          optimizedConfig.framerate = 24
          optimizedConfig.preset = 'ultrafast'
          optimizedConfig.tune = 'zerolatency'
          break

        case 'medium':
          optimizedConfig.bitrate = Math.max(2000, (currentMetrics.bitrate * 0.8))
          optimizedConfig.resolution = '1920x1080'
          optimizedConfig.framerate = 30
          optimizedConfig.preset = 'fast'
          optimizedConfig.tune = 'zerolatency'
          break

        case 'high':
          optimizedConfig.bitrate = Math.max(4000, (currentMetrics.bitrate * 1.2))
          optimizedConfig.resolution = '1920x1080'
          optimizedConfig.framerate = 60
          optimizedConfig.preset = 'medium'
          optimizedConfig.tune = 'film'
          break

        case 'auto':
          // Auto-optimize based on current metrics
          if (currentMetrics.latency > 3000) {
            optimizedConfig.preset = 'ultrafast'
            optimizedConfig.tune = 'zerolatency'
            optimizedConfig.bitrate = Math.max(1000, (currentMetrics.bitrate * 0.8))
          } else if (currentMetrics.droppedFrames > 20) {
            optimizedConfig.bitrate = Math.max(1000, (currentMetrics.bitrate * 0.9))
            optimizedConfig.preset = 'fast'
          } else {
            optimizedConfig.preset = 'medium'
            optimizedConfig.bitrate = Math.max(2000, (currentMetrics.bitrate * 1.1))
          }
          break
      }

      // Validate optimized configuration
      const streamType = activeStream.url.startsWith('srt:') ? 'SRT' : 
                         activeStream.url.startsWith('rtmp') ? 'RTMP' : 'HLS'
      
      const validation = await this.validateStreamConfig(optimizedConfig, streamType)
      if (!validation.isValid) {
        throw new Error(`Optimized configuration validation failed: ${validation.errors.join(', ')}`)
      }

      return optimizedConfig
    } catch (error) {
      console.error('Error optimizing stream config:', error)
      throw error
    }
  }

  // Event handlers for FFmpeg process events
  private async handleProcessStopped(streamId: string, code: number, signal: string) {
    try {
      // Update stream status in database
      const isOutput = this.activeStreams.get(streamId)?.type === 'output'
      
      if (isOutput) {
        await db.streamOutput.update({
          where: { id: streamId },
          data: { status: 'STOPPED' }
        })
      } else {
        await db.streamInput.update({
          where: { id: streamId },
          data: { status: 'DISCONNECTED' }
        })
      }

      // Clean up active streams and metrics
      this.activeStreams.delete(streamId)
      this.streamMetrics.delete(streamId)

      console.log(`Stream ${streamId} stopped with code ${code}, signal ${signal}`)
    } catch (error) {
      console.error('Error handling process stop:', error)
    }
  }

  private async handleProcessError(streamId: string, error: string) {
    try {
      // Update stream status in database
      const isOutput = this.activeStreams.get(streamId)?.type === 'output'
      
      if (isOutput) {
        await db.streamOutput.update({
          where: { id: streamId },
          data: { status: 'ERROR' }
        })
      } else {
        await db.streamInput.update({
          where: { id: streamId },
          data: { status: 'ERROR' }
        })
      }

      console.error(`Stream ${streamId} error: ${error}`)
    } catch (dbError) {
      console.error('Error handling process error:', dbError)
    }
  }
}