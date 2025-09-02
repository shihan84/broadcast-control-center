import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { StreamConfig } from './streaming-service'
import { db } from '@/lib/db'

export interface FFmpegProcess {
  id: string
  process: ChildProcess
  command: string
  startTime: Date
  config: StreamConfig
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error'
  error?: string
  isSimulation?: boolean
  useDistributorCompliance?: boolean
}

export class FFmpegService extends EventEmitter {
  private static instance: FFmpegService
  private processes: Map<string, FFmpegProcess> = new Map()
  private ffmpegPath: string = 'ffmpeg' // Default to system ffmpeg
  private settingsLoaded: boolean = false
  private initializationError: string | null = null
  private ffmpegAvailable: boolean = false
  private simulationMode: boolean = false

  private constructor() {
    super()
    this.initializeService()
  }

  private async initializeService() {
    try {
      await this.loadSettings()
      // Check FFmpeg availability after loading settings
      await this.checkFFmpegAvailability()
    } catch (error) {
      this.initializationError = error instanceof Error ? error.message : 'Unknown initialization error'
      console.error('FFmpegService initialization error:', this.initializationError)
      // Still mark as loaded to prevent hanging
      this.settingsLoaded = true
    }
  }

  private async loadSettings() {
    try {
      // Check if the SystemSettings table exists by trying to query it
      const settings = await db.systemSettings.findFirst()
      if (settings) {
        const systemConfig = JSON.parse(settings.systemConfig)
        if (!systemConfig.ffmpegAutoDetect && systemConfig.ffmpegPath) {
          this.ffmpegPath = systemConfig.ffmpegPath
          console.log(`FFmpeg path configured: ${this.ffmpegPath}`)
        }
      } else {
        console.log('No system settings found, using default FFmpeg path')
      }
      this.settingsLoaded = true
    } catch (error) {
      console.error('Error loading FFmpeg settings (this is normal on first run):', error)
      console.log('Using default FFmpeg path:', this.ffmpegPath)
      this.settingsLoaded = true
    }
  }

  private async checkFFmpegAvailability() {
    try {
      const isAvailable = await this.testFFmpegInstallation()
      this.ffmpegAvailable = isAvailable
      
      if (!isAvailable) {
        console.warn('FFmpeg not found, enabling simulation mode for testing')
        this.simulationMode = true
        this.initializationError = 'FFmpeg is not installed. Running in simulation mode for testing purposes.'
      } else {
        console.log('FFmpeg is available and ready')
        this.simulationMode = false
      }
    } catch (error) {
      console.warn('Error checking FFmpeg availability, enabling simulation mode:', error)
      this.ffmpegAvailable = false
      this.simulationMode = true
      this.initializationError = 'FFmpeg check failed. Running in simulation mode for testing purposes.'
    }
  }

  static getInstance(): FFmpegService {
    if (!FFmpegService.instance) {
      FFmpegService.instance = new FFmpegService()
    }
    return FFmpegService.instance
  }

  isInitialized(): boolean {
    return this.settingsLoaded
  }

  getInitializationError(): string | null {
    return this.initializationError
  }

  setFFmpegPath(path: string) {
    this.ffmpegPath = path
    console.log(`FFmpeg path updated to: ${this.ffmpegPath}`)
  }

  async startStream(
    streamId: string,
    inputUrl: string,
    outputUrl: string,
    config: StreamConfig,
    type: 'input' | 'output',
    useDistributorCompliance: boolean = false
  ): Promise<FFmpegProcess> {
    try {
      // Check if service is properly initialized
      if (!this.isInitialized()) {
        throw new Error(`FFmpegService not initialized. Error: ${this.getInitializationError() || 'Unknown error'}`)
      }

      // Wait for settings to load if not already loaded
      if (!this.settingsLoaded) {
        await new Promise(resolve => setTimeout(resolve, 100))
        if (!this.settingsLoaded) {
          console.warn('Settings not fully loaded, using default FFmpeg path')
        }
      }

      // Generate FFmpeg command based on configuration
      let command: string
      if (useDistributorCompliance && type === 'output') {
        command = this.buildDistributorCompliantCommand(inputUrl, outputUrl, config)
        console.log(`Using DISTRIBUTOR-COMPLIANT FFmpeg command for ${type} ${streamId}`)
      } else {
        command = this.buildFFmpegCommand(inputUrl, outputUrl, config, type)
        console.log(`Using standard FFmpeg command for ${type} ${streamId}`)
      }
      
      console.log(`Starting ${this.simulationMode ? 'SIMULATED ' : ''}FFmpeg process for ${type} ${streamId}:`)
      console.log(`Using FFmpeg path: ${this.ffmpegPath}`)
      console.log(`Command: ${command}`)

      let ffmpegProcess: FFmpegProcess

      if (this.simulationMode) {
        // Create simulated process
        ffmpegProcess = await this.createSimulatedProcess(streamId, command, config, type)
      } else {
        // Spawn real FFmpeg process
        const process = spawn(this.ffmpegPath, command.split(' '), {
          stdio: ['pipe', 'pipe', 'pipe']
        })

        ffmpegProcess = {
          id: streamId,
          process,
          command,
          startTime: new Date(),
          config,
          status: 'starting',
          isSimulation: false,
          useDistributorCompliance
        }

        // Handle real process events
        this.setupRealProcessHandlers(process, ffmpegProcess, type, streamId)
      }

      this.processes.set(streamId, ffmpegProcess)
      return ffmpegProcess
    } catch (error) {
      console.error('Error starting FFmpeg process:', error)
      throw error
    }
  }

  private async createSimulatedProcess(
    streamId: string,
    command: string,
    config: StreamConfig,
    type: 'input' | 'output'
  ): Promise<FFmpegProcess> {
    // Create a mock process object
    const mockProcess = {
      pid: Math.floor(Math.random() * 100000) + 1000,
      kill: (signal?: string) => {
        console.log(`[SIMULATION] Killing process ${streamId} with signal ${signal || 'SIGTERM'}`)
      },
      on: (event: string, callback: (...args: any[]) => void) => {
        // Mock event handler
      },
      stdout: {
        on: (event: string, callback: (...args: any[]) => void) => {
          if (event === 'data') {
            // Simulate some output after a delay
            setTimeout(() => {
              callback(Buffer.from('[SIMULATION] FFmpeg output data'))
            }, 100)
          }
        }
      },
      stderr: {
        on: (event: string, callback: (...args: any[]) => void) => {
          if (event === 'data') {
            // Simulate some error output after a delay
            setTimeout(() => {
              callback(Buffer.from('[SIMULATION] FFmpeg log output'))
            }, 150)
          }
        }
      }
    } as any

    const ffmpegProcess: FFmpegProcess = {
      id: streamId,
      process: mockProcess,
      command,
      startTime: new Date(),
      config,
      status: 'starting',
      isSimulation: true
    }

    // Simulate process startup
    setTimeout(() => {
      ffmpegProcess.status = 'running'
      this.emit('process-started', ffmpegProcess)
      console.log(`[SIMULATION] FFmpeg process started for ${type} ${streamId}`)
    }, 500)

    // Simulate process running with periodic metrics
    const simulationInterval = setInterval(() => {
      if (ffmpegProcess.status === 'running') {
        this.emit('process-output', {
          streamId,
          output: `[SIMULATION] Stream metrics: bitrate=${config.bitrate || 8000}k, fps=${config.framerate || 30}`,
          type: 'stdout'
        })
      } else {
        clearInterval(simulationInterval)
      }
    }, 2000)

    return ffmpegProcess
  }

  private setupRealProcessHandlers(
    process: ChildProcess,
    ffmpegProcess: FFmpegProcess,
    type: 'input' | 'output',
    streamId: string
  ) {
    process.on('spawn', () => {
      ffmpegProcess.status = 'running'
      this.emit('process-started', ffmpegProcess)
      console.log(`FFmpeg process started for ${type} ${streamId}`)
    })

    process.on('exit', (code, signal) => {
      ffmpegProcess.status = 'stopped'
      this.emit('process-stopped', { streamId, code, signal })
      console.log(`FFmpeg process exited for ${type} ${streamId}: code ${code}, signal ${signal}`)
    })

    process.on('error', (error) => {
      ffmpegProcess.status = 'error'
      ffmpegProcess.error = error.message
      this.emit('process-error', { streamId, error: error.message })
      console.error(`FFmpeg process error for ${type} ${streamId}:`, error)
    })

    // Handle stdout and stderr for logging
    process.stdout?.on('data', (data) => {
      const output = data.toString()
      this.emit('process-output', { streamId, output, type: 'stdout' })
      console.log(`FFmpeg stdout [${streamId}]:`, output)
    })

    process.stderr?.on('data', (data) => {
      const output = data.toString()
      this.emit('process-output', { streamId, output, type: 'stderr' })
      console.log(`FFmpeg stderr [${streamId}]:`, output)
    })
  }

  async stopStream(streamId: string): Promise<void> {
    const ffmpegProcess = this.processes.get(streamId)
    
    if (!ffmpegProcess) {
      throw new Error(`No FFmpeg process found for stream ${streamId}`)
    }

    try {
      ffmpegProcess.status = 'stopping'
      
      if (ffmpegProcess.isSimulation) {
        // Simulated process stop
        console.log(`[SIMULATION] Stopping process ${streamId}`)
        setTimeout(() => {
          ffmpegProcess.status = 'stopped'
          this.processes.delete(streamId)
          this.emit('process-stopped', { streamId, code: 0, signal: 'SIGTERM' })
          console.log(`[SIMULATION] Process ${streamId} stopped`)
        }, 300)
      } else {
        // Real process stop
        // Try graceful shutdown first
        ffmpegProcess.process.kill('SIGTERM')
        
        // Wait for graceful shutdown
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('FFmpeg process did not stop gracefully'))
          }, 5000)

          ffmpegProcess.process.on('exit', () => {
            clearTimeout(timeout)
            resolve(true)
          })
        })

        this.processes.delete(streamId)
        this.emit('process-stopped', { streamId, code: 0, signal: 'SIGTERM' })
      }
    } catch (error) {
      if (ffmpegProcess.isSimulation) {
        // Simulated force kill
        console.log(`[SIMULATION] Force killing process ${streamId}`)
        ffmpegProcess.status = 'stopped'
        this.processes.delete(streamId)
        this.emit('process-stopped', { streamId, code: 1, signal: 'SIGKILL' })
      } else {
        // Force kill if graceful shutdown failed
        console.warn(`Force killing FFmpeg process for stream ${streamId}`)
        ffmpegProcess.process.kill('SIGKILL')
        this.processes.delete(streamId)
        this.emit('process-stopped', { streamId, code: 1, signal: 'SIGKILL' })
      }
    }
  }

  getProcess(streamId: string): FFmpegProcess | undefined {
    return this.processes.get(streamId)
  }

  getAllProcesses(): FFmpegProcess[] {
    return Array.from(this.processes.values())
  }

  isProcessRunning(streamId: string): boolean {
    const process = this.processes.get(streamId)
    return process?.status === 'running'
  }

  private buildFFmpegCommand(
    inputUrl: string,
    outputUrl: string,
    config: StreamConfig,
    type: 'input' | 'output'
  ): string {
    let command = ''

    // Global options
    command += '-y ' // Overwrite output files
    command += '-loglevel warning ' // Reduce log verbosity
    command += '-thread_queue_size 1024 ' // Thread queue size

    // Input options
    if (type === 'input') {
      command += this.buildInputOptions(config)
    }
    command += `-i "${inputUrl}" `

    // Output options
    command += this.buildOutputOptions(config, outputUrl)

    return command.trim()
  }

  // Generate distributor-compliant FFmpeg command
  buildDistributorCompliantCommand(
    inputUrl: string,
    outputUrl: string,
    config: StreamConfig
  ): string {
    let command = ''

    // Global options
    command += '-y '
    command += '-loglevel warning '
    command += '-thread_queue_size 1024 '

    // Input options
    command += '-reconnect 1 '
    command += '-reconnect_at_eof 1 '
    command += '-reconnect_streamed 1 '
    command += '-reconnect_delay_max 30 '
    command += `-i "${inputUrl}" `

    // Video codec and settings (exactly matching distributor requirements)
    command += '-c:v libx264 '
    command += '-profile:v high '
    command += '-level 40 '
    command += '-pix_fmt yuv420p '
    command += '-s 1920x1080 '
    command += '-r 25 '
    command += '-g 50 ' // 25fps * 2 seconds = 50 frames
    command += '-b:v 5000k '
    command += '-maxrate 5000k '
    command += '-bufsize 10000k '
    command += '-colorspace bt709 '
    command += '-color_primaries bt709 '
    command += '-color_trc bt709 '
    command += '-color_range tv '
    command += '-movflags +faststart '

    // Audio codec and settings (exactly matching distributor requirements)
    command += '-c:a aac '
    command += '-profile:a aac_low '
    command += '-b:a 128k '
    command += '-ar 48000 '
    command += '-ac 2 '

    // MPEG-TS container with specific settings
    command += '-f mpegts '
    command += '-mpegts_original_network_id 1 '
    command += '-mpegts_transport_stream_id 1 '
    command += '-mpegts_service_id 1 '

    // PID assignments (exactly matching distributor requirements)
    command += '-mpegts_pmt_video_pid 101 '
    command += '-mpegts_pid_video 101 '
    command += '-mpegts_pmt_audio_pid 102 '
    command += '-mpegts_pid_audio 102 '
    command += '-mpegts_pmt_scte35_pid 500 '
    command += '-mpegts_pid_scte35 500 '
    command += '-mpegts_pmt_pmt_pid 1000 '
    command += '-mpegts_pmt_pcr_pid 101 '

    // SCTE-35 enablement
    command += '-scte35 1 '

    // Stream metadata (exactly matching distributor requirements)
    command += '-metadata:s:0 language=eng '
    command += '-metadata:s:1 language=eng '
    command += '-metadata:s:2 language=eng '
    command += '-metadata:s:0 pid=101 '
    command += '-metadata:s:1 pid=102 '
    command += '-metadata:s:2 pid=500 '
    command += '-metadata:s:2 stream_type=0x86 '

    // Output URL
    command += `"${outputUrl}"`

    return command.trim()
  }

  private buildInputOptions(config: StreamConfig): string {
    let options = ''

    // Input format options
    if (config.transportStream) {
      options += '-f mpegts '
    }

    // Input timeout
    if (config.latency) {
      options += `-timeout ${config.latency}000 `
    }

    // Buffer size
    if (config.bufferSize) {
      options += `-buffer_size ${config.bufferSize} `
    }

    // Retry options
    options += '-reconnect 1 '
    options += '-reconnect_at_eof 1 '
    options += '-reconnect_streamed 1 '
    options += '-reconnect_delay_max 30 '

    return options
  }

  private buildOutputOptions(config: StreamConfig, outputUrl: string): string {
    let options = ''

    // Video codec
    if (config.videoCodec) {
      options += `-c:v ${config.videoCodec} `
    }

    // Video profile
    if (config.videoProfile) {
      options += `-profile:v ${config.videoProfile} `
    }

    // Video level
    if (config.videoLevel) {
      options += `-level ${config.videoLevel} `
    }

    // Bitrate
    if (config.bitrate) {
      options += `-b:v ${config.bitrate}k `
    }

    // Max bitrate
    if (config.maxBitrate) {
      options += `-maxrate ${config.maxBitrate}k `
    }

    // Buffer size
    if (config.bufferSize) {
      options += `-bufsize ${config.bufferSize}k `
    }

    // Resolution
    if (config.resolution) {
      options += `-s ${config.resolution} `
    }

    // Framerate
    if (config.framerate) {
      options += `-r ${config.framerate} `
    }

    // Keyframe interval
    if (config.keyFrameInterval) {
      options += `-g ${config.keyFrameInterval * config.framerate!} `
    }

    // B-frames
    if (config.bFrames) {
      options += `-bf ${config.bFrames} `
    }

    // Reference frames
    if (config.referenceFrames) {
      options += `-refs ${config.referenceFrames} `
    }

    // Preset
    if (config.preset) {
      options += `-preset ${config.preset} `
    }

    // Tune
    if (config.tune) {
      options += `-tune ${config.tune} `
    }

    // CRF (quality-based encoding)
    if (config.qualityBased && config.crfValue) {
      options += `-crf ${config.crfValue} `
    }

    // Audio codec
    if (config.audioCodec) {
      options += `-c:a ${config.audioCodec} `
    }

    // Audio bitrate
    if (config.audioBitrate) {
      options += `-b:a ${config.audioBitrate}k `
    }

    // Audio sample rate
    if (config.audioSampleRate) {
      options += `-ar ${config.audioSampleRate} `
    }

    // Audio channels
    if (config.audioChannels) {
      options += `-ac ${config.audioChannels} `
    }

    // MPEG-TS specific options
    if (config.mpegtsFlags && config.mpegtsFlags.length > 0) {
      options += `-mpegts_flags ${config.mpegtsFlags.join(' ')} `
    }

    if (config.mpegtsServiceId) {
      options += `-mpegts_service_id ${config.mpegtsServiceId} `
    }

    if (config.mpegtsPidVideo) {
      options += `-mpegts_pid_video ${config.mpegtsPidVideo} `
    }

    if (config.mpegtsPidAudio) {
      options += `-mpegts_pid_audio ${config.mpegtsPidAudio} `
    }

    if (config.mpegtsPidScte35) {
      options += `-mpegts_pid_scte35 ${config.mpegtsPidScte35} `
    }

    if (config.mpegtsPidPmt) {
      options += `-mpegts_pid_pmt ${config.mpegtsPidPmt} `
    }

    if (config.mpegtsPidPat) {
      options += `-mpegts_pid_pat ${config.mpegtsPidPat} `
    }

    if (config.mpegtsPcrPeriod) {
      options += `-mpegts_pcr_period ${config.mpegtsPcrPeriod} `
    }

    if (config.mpegtsTransportStreamId) {
      options += `-mpegts_transport_stream_id ${config.mpegtsTransportStreamId} `
    }

    if (config.mpegtsOriginalNetworkId) {
      options += `-mpegts_original_network_id ${config.mpegtsOriginalNetworkId} `
    }

    if (config.mpegtsTablesVersion) {
      options += `-mpegts_tables_version ${config.mpegtsTablesVersion} `
    }

    // Transport stream options
    if (config.tsPacketSize) {
      options += `-mpegts_packet_size ${config.tsPacketSize} `
    }

    if (config.pcrPid) {
      options += `-pcr_pid ${config.pcrPid} `
    }

    if (config.pcrPeriod) {
      options += `-pcr_period ${config.pcrPeriod} `
    }

    // SCTE-35 options
    if (config.scte35Enabled) {
      options += '-scte35 1 '
    }

    if (config.scte35Pid) {
      options += `-scte35_pid ${config.scte35Pid} `
    }

    // Format-specific options
    if (outputUrl.includes('.m3u8') || outputUrl.includes('hls')) {
      // HLS options
      options += '-f hls '
      
      if (config.segmentDuration) {
        options += `-hls_time ${config.segmentDuration} `
      }
      
      if (config.segmentListSize) {
        options += `-hls_list_size ${config.segmentListSize} `
      }
      
      if (config.playlistType) {
        options += `-hls_playlist_type ${config.playlistType} `
      }
      
      if (config.hlsVersion) {
        options += `-hls_version ${config.hlsVersion} `
      }

      // Encryption
      if (config.encryption && config.encryptionKey) {
        options += `-hls_key_info_file ${config.encryptionKey} `
      }
    } else if (outputUrl.includes('.mpd') || outputUrl.includes('dash')) {
      // DASH options
      options += '-f dash '
      
      if (config.segmentDuration) {
        options += `-seg_duration ${config.segmentDuration} `
      }
      
      if (config.dashProfile) {
        options += `-dash_profile ${config.dashProfile} `
      }
    } else if (outputUrl.includes('rtmp')) {
      // RTMP options
      options += '-f flv '
    } else if (outputUrl.includes('srt')) {
      // SRT options
      options += '-f mpegts '
      
      if (config.latency) {
        options += `-latency ${config.latency} `
      }
      
      if (config.packetSize) {
        options += `-packet_size ${config.packetSize} `
      }
    }

    // Output URL
    options += `"${outputUrl}"`

    return options
  }

  async testFFmpegInstallation(): Promise<boolean> {
    try {
      // Wait for settings to load if not already loaded
      if (!this.settingsLoaded) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      console.log(`Testing FFmpeg installation at: ${this.ffmpegPath}`)
      const process = spawn(this.ffmpegPath, ['-version'])
      
      return new Promise((resolve) => {
        process.on('exit', (code) => {
          const success = code === 0
          console.log(`FFmpeg test result: ${success ? 'SUCCESS' : 'FAILED'} (code: ${code})`)
          if (!success) {
            console.warn('FFmpeg not found - will run in simulation mode')
          }
          resolve(success)
        })
        
        process.on('error', (error) => {
          console.error('FFmpeg process error:', error.message)
          console.warn('FFmpeg not available - will run in simulation mode')
          resolve(false)
        })
      })
    } catch (error) {
      console.error('Error testing FFmpeg installation:', error)
      console.warn('FFmpeg test failed - will run in simulation mode')
      return false
    }
  }

  getCurrentFFmpegPath(): string {
    return this.ffmpegPath
  }

  async getFFmpegVersion(): Promise<string | null> {
    try {
      // Wait for settings to load if not already loaded
      if (!this.settingsLoaded) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      return new Promise((resolve) => {
        const process = spawn(this.ffmpegPath, ['-version'])
        
        let stdout = ''
        let stderr = ''

        process.stdout?.on('data', (data) => {
          stdout += data.toString()
        })

        process.stderr?.on('data', (data) => {
          stderr += data.toString()
        })

        process.on('close', (code) => {
          if (code === 0) {
            // Extract version from output
            const versionMatch = stdout.match(/ffmpeg version (\d+\.\d+\.\d+)/)
            if (versionMatch) {
              resolve(versionMatch[1])
            } else {
              // Try stderr as well
              const versionMatch2 = stderr.match(/ffmpeg version (\d+\.\d+\.\d+)/)
              resolve(versionMatch2 ? versionMatch2[1] : 'Unknown version')
            }
          } else {
            resolve(null)
          }
        })

        process.on('error', () => {
          resolve(null)
        })

        // Set a timeout
        setTimeout(() => {
          process.kill('SIGTERM')
          resolve(null)
        }, 5000)
      })
    } catch (error) {
      console.error('Error getting FFmpeg version:', error)
      return null
    }
  }

  // Utility methods for status information
  isFFmpegAvailable(): boolean {
    return this.ffmpegAvailable
  }

  isSimulationMode(): boolean {
    return this.simulationMode
  }

  getInitializationError(): string | null {
    return this.initializationError
  }

  getServiceStatus(): {
    available: boolean
    simulationMode: boolean
    initialized: boolean
    error: string | null
    ffmpegPath: string
    processCount: number
  } {
    return {
      available: this.ffmpegAvailable,
      simulationMode: this.simulationMode,
      initialized: this.settingsLoaded,
      error: this.initializationError,
      ffmpegPath: this.ffmpegPath,
      processCount: this.processes.size
    }
  }
}