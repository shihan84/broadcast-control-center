export interface MPEGTSConfig {
  // Basic MPEG-TS flags
  mpegts_flags?: string[]
  mpegts_service_id?: number
  mpegts_pid_video?: number
  mpegts_pid_audio?: number
  mpegts_pid_scte35?: number
  mpegts_pid_pmt?: number
  mpegts_pid_pat?: number
  
  // Additional MPEG-TS parameters
  mpegts_original_network_id?: number
  mpegts_transport_stream_id?: number
  mpegts_service_type?: number
  mpegts_pcr_period?: number
  mpegts_pat_period?: number
  mpegts_sdt_period?: number
  
  // SCTE-35 specific settings
  scte35_mode?: 'passthrough' | 'insert' | 'extract'
  scte35_pid?: number
  scte35_splice_insert?: boolean
  scte35_time_signal?: boolean
  
  // Stream timing and synchronization
  mpegts_copyts?: boolean
  mpegts_start_time?: number
  mpegts_duration?: number
  mpegts_align_ts?: boolean
  
  // Error handling and resilience
  mpegts_flags_resend_headers?: boolean
  mpegts_flags_discontinuity?: boolean
  mpegts_flags_pes_payload?: boolean
}

export interface StreamConfiguration {
  id?: string
  name: string
  config: {
    input?: {
      type: 'HLS' | 'RTMP' | 'SRT'
      url: string
      bufferSize?: number
      latency?: number
      redundancy?: number
    }
    output?: {
      type: 'HLS' | 'DASH' | 'SRT' | 'MPEGTS'
      url: string
      bitrate?: number
      resolution?: string
      framerate?: number
      codec?: string
      keyFrameInterval?: number
      mpegts?: MPEGTSConfig
    }
    transcoding?: {
      enabled: boolean
      profile?: string
      preset?: string
      tune?: string
      crf?: number
      bitrate?: number
      maxrate?: number
      bufsize?: number
      pix_fmt?: string
    }
    scte35?: {
      enabled: boolean
      passthrough: boolean
      insertEvents: boolean
      pid?: number
      mode?: 'passthrough' | 'insert' | 'extract'
    }
    monitoring?: {
      enabled: boolean
      metrics: string[]
      alertThresholds: {
        cpu?: number
        memory?: number
        network?: number
        bitrate?: number
        latency?: number
      }
    }
  }
  isActive?: boolean
  userId: string
}

export class MPEGTSConfigBuilder {
  private config: MPEGTSConfig = {}

  static create(): MPEGTSConfigBuilder {
    return new MPEGTSConfigBuilder()
  }

  withFlags(flags: string[]): MPEGTSConfigBuilder {
    this.config.mpegts_flags = flags
    return this
  }

  withServiceId(id: number): MPEGTSConfigBuilder {
    this.config.mpegts_service_id = id
    return this
  }

  withVideoPID(pid: number): MPEGTSConfigBuilder {
    this.config.mpegts_pid_video = pid
    return this
  }

  withAudioPID(pid: number): MPEGTSConfigBuilder {
    this.config.mpegts_pid_audio = pid
    return this
  }

  withSCTE35PID(pid: number): MPEGTSConfigBuilder {
    this.config.mpegts_pid_scte35 = pid
    return this
  }

  withPMTPID(pid: number): MPEGTSConfigBuilder {
    this.config.mpegts_pid_pmt = pid
    return this
  }

  withPATPID(pid: number): MPEGTSConfigBuilder {
    this.config.mpegts_pid_pat = pid
    return this
  }

  withOriginalNetworkId(id: number): MPEGTSConfigBuilder {
    this.config.mpegts_original_network_id = id
    return this
  }

  withTransportStreamId(id: number): MPEGTSConfigBuilder {
    this.config.mpegts_transport_stream_id = id
    return this
  }

  withServiceType(type: number): MPEGTSConfigBuilder {
    this.config.mpegts_service_type = type
    return this
  }

  withPCRPeriod(period: number): MPEGTSConfigBuilder {
    this.config.mpegts_pcr_period = period
    return this
  }

  withPATPeriod(period: number): MPEGTSConfigBuilder {
    this.config.mpegts_pat_period = period
    return this
  }

  withSDTPeriod(period: number): MPEGTSConfigBuilder {
    this.config.mpegts_sdt_period = period
    return this
  }

  withSCTE35Mode(mode: 'passthrough' | 'insert' | 'extract'): MPEGTSConfigBuilder {
    this.config.scte35_mode = mode
    return this
  }

  withSCTE35SpliceInsert(enabled: boolean): MPEGTSConfigBuilder {
    this.config.scte35_splice_insert = enabled
    return this
  }

  withSCTE35TimeSignal(enabled: boolean): MPEGTSConfigBuilder {
    this.config.scte35_time_signal = enabled
    return this
  }

  withCopyTS(enabled: boolean): MPEGTSConfigBuilder {
    this.config.mpegts_copyts = enabled
    return this
  }

  withStartTime(time: number): MPEGTSConfigBuilder {
    this.config.mpegts_start_time = time
    return this
  }

  withDuration(duration: number): MPEGTSConfigBuilder {
    this.config.mpegts_duration = duration
    return this
  }

  withAlignTS(enabled: boolean): MPEGTSConfigBuilder {
    this.config.mpegts_align_ts = enabled
    return this
  }

  withResendHeaders(enabled: boolean): MPEGTSConfigBuilder {
    this.config.mpegts_flags_resend_headers = enabled
    return this
  }

  withDiscontinuity(enabled: boolean): MPEGTSConfigBuilder {
    this.config.mpegts_flags_discontinuity = enabled
    return this
  }

  withPESPayload(enabled: boolean): MPEGTSConfigBuilder {
    this.config.mpegts_flags_pes_payload = enabled
    return this
  }

  build(): MPEGTSConfig {
    return { ...this.config }
  }
}

export class FFmpegCommandBuilder {
  private commands: string[] = []

  static create(): FFmpegCommandBuilder {
    return new FFmpegCommandBuilder()
  }

  withInput(input: string): FFmpegCommandBuilder {
    this.commands.push(`-i "${input}"`)
    return this
  }

  withMPEGTSConfig(config: MPEGTSConfig): FFmpegCommandBuilder {
    if (config.mpegts_flags && config.mpegts_flags.length > 0) {
      this.commands.push(`-mpegts_flags "${config.mpegts_flags.join('+')}"`)
    }
    
    if (config.mpegts_service_id !== undefined) {
      this.commands.push(`-mpegts_service_id ${config.mpegts_service_id}`)
    }
    
    if (config.mpegts_pid_video !== undefined) {
      this.commands.push(`-mpegts_pid_video ${config.mpegts_pid_video}`)
    }
    
    if (config.mpegts_pid_audio !== undefined) {
      this.commands.push(`-mpegts_pid_audio ${config.mpegts_pid_audio}`)
    }
    
    if (config.mpegts_pid_scte35 !== undefined) {
      this.commands.push(`-mpegts_pid_scte35 ${config.mpegts_pid_scte35}`)
    }
    
    if (config.mpegts_pid_pmt !== undefined) {
      this.commands.push(`-mpegts_pid_pmt ${config.mpegts_pid_pmt}`)
    }
    
    if (config.mpegts_pid_pat !== undefined) {
      this.commands.push(`-mpegts_pid_pat ${config.mpegts_pid_pat}`)
    }
    
    if (config.mpegts_original_network_id !== undefined) {
      this.commands.push(`-mpegts_original_network_id ${config.mpegts_original_network_id}`)
    }
    
    if (config.mpegts_transport_stream_id !== undefined) {
      this.commands.push(`-mpegts_transport_stream_id ${config.mpegts_transport_stream_id}`)
    }
    
    if (config.mpegts_service_type !== undefined) {
      this.commands.push(`-mpegts_service_type ${config.mpegts_service_type}`)
    }
    
    if (config.mpegts_pcr_period !== undefined) {
      this.commands.push(`-mpegts_pcr_period ${config.mpegts_pcr_period}`)
    }
    
    if (config.mpegts_pat_period !== undefined) {
      this.commands.push(`-mpegts_pat_period ${config.mpegts_pat_period}`)
    }
    
    if (config.mpegts_sdt_period !== undefined) {
      this.commands.push(`-mpegts_sdt_period ${config.mpegts_sdt_period}`)
    }
    
    if (config.mpegts_copyts !== undefined) {
      this.commands.push(`-mpegts_copyts ${config.mpegts_copyts ? '1' : '0'}`)
    }
    
    if (config.mpegts_start_time !== undefined) {
      this.commands.push(`-mpegts_start_time ${config.mpegts_start_time}`)
    }
    
    if (config.mpegts_duration !== undefined) {
      this.commands.push(`-mpegts_duration ${config.mpegts_duration}`)
    }
    
    if (config.mpegts_align_ts !== undefined) {
      this.commands.push(`-mpegts_align_ts ${config.mpegts_align_ts ? '1' : '0'}`)
    }

    return this
  }

  withCodec(codec: string): FFmpegCommandBuilder {
    this.commands.push(`-c:v ${codec}`)
    return this
  }

  withAudioCodec(codec: string): FFmpegCommandBuilder {
    this.commands.push(`-c:a ${codec}`)
    return this
  }

  withBitrate(bitrate: number): FFmpegCommandBuilder {
    this.commands.push(`-b:v ${bitrate}k`)
    return this
  }

  withAudioBitrate(bitrate: number): FFmpegCommandBuilder {
    this.commands.push(`-b:a ${bitrate}k`)
    return this
  }

  withResolution(resolution: string): FFmpegCommandBuilder {
    this.commands.push(`-s ${resolution}`)
    return this
  }

  withFramerate(framerate: number): FFmpegCommandBuilder {
    this.commands.push(`-r ${framerate}`)
    return this
  }

  withKeyFrameInterval(interval: number): FFmpegCommandBuilder {
    this.commands.push(`-g ${interval}`)
    return this
  }

  withOutput(output: string): FFmpegCommandBuilder {
    this.commands.push(`"${output}"`)
    return this
  }

  withCustomFlag(flag: string): FFmpegCommandBuilder {
    this.commands.push(flag)
    return this
  }

  build(): string {
    return `ffmpeg ${this.commands.join(' ')}`
  }
}

// Predefined MPEG-TS configurations for different use cases
export const MPEGTS_PRESETS = {
  // Standard broadcast configuration
  standard_broadcast: () => MPEGTSConfigBuilder.create()
    .withFlags(['resend_headers'])
    .withServiceId(1)
    .withVideoPID(100)
    .withAudioPID(200)
    .withSCTE35PID(500)
    .withPMTPID(1000)
    .withPATPID(0)
    .withOriginalNetworkId(1)
    .withTransportStreamId(1)
    .withServiceType(1)
    .withPCRPeriod(20)
    .withPATPeriod(100)
    .withSDTPeriod(1000)
    .withSCTE35Mode('passthrough')
    .withCopyTS(true)
    .withResendHeaders(true)
    .build(),

  // High availability configuration
  high_availability: () => MPEGTSConfigBuilder.create()
    .withFlags(['resend_headers', 'discontinuity'])
    .withServiceId(1)
    .withVideoPID(100)
    .withAudioPID(200)
    .withSCTE35PID(500)
    .withPMTPID(1000)
    .withPATPID(0)
    .withOriginalNetworkId(1)
    .withTransportStreamId(1)
    .withServiceType(1)
    .withPCRPeriod(20)
    .withPATPeriod(100)
    .withSDTPeriod(1000)
    .withSCTE35Mode('insert')
    .withSCTE35SpliceInsert(true)
    .withSCTE35TimeSignal(true)
    .withCopyTS(true)
    .withResendHeaders(true)
    .withDiscontinuity(true)
    .build(),

  // Cable headend configuration
  cable_headend: () => MPEGTSConfigBuilder.create()
    .withFlags(['resend_headers', 'pes_payload'])
    .withServiceId(1)
    .withVideoPID(0x10) // 16
    .withAudioPID(0x14) // 20
    .withSCTE35PID(0x1F4) // 500
    .withPMTPID(0x3E8) // 1000
    .withPATPID(0)
    .withOriginalNetworkId(0x0001)
    .withTransportStreamId(0x0001)
    .withServiceType(0x02) // Digital television service
    .withPCRPeriod(20)
    .withPATPeriod(100)
    .withSDTPeriod(1000)
    .withSCTE35Mode('passthrough')
    .withCopyTS(true)
    .withResendHeaders(true)
    .withPESPayload(true)
    .build(),

  // IPTV configuration
  iptv: () => MPEGTSConfigBuilder.create()
    .withFlags(['resend_headers'])
    .withServiceId(1)
    .withVideoPID(100)
    .withAudioPID(200)
    .withSCTE35PID(500)
    .withPMTPID(1000)
    .withPATPID(0)
    .withOriginalNetworkId(1)
    .withTransportStreamId(1)
    .withServiceType(1)
    .withPCRPeriod(20)
    .withPATPeriod(100)
    .withSDTPeriod(1000)
    .withSCTE35Mode('insert')
    .withCopyTS(true)
    .withResendHeaders(true)
    .withAlignTS(true)
    .build()
}

// Example FFmpeg command generation
export function generateFFmpegCommand(
  inputUrl: string,
  outputUrl: string,
  mpegtsConfig: MPEGTSConfig,
  transcodingConfig?: {
    codec?: string
    bitrate?: number
    resolution?: string
    framerate?: number
  }
): string {
  const builder = FFmpegCommandBuilder.create()
    .withInput(inputUrl)
    .withMPEGTSConfig(mpegtsConfig)

  if (transcodingConfig) {
    if (transcodingConfig.codec) {
      builder.withCodec(transcodingConfig.codec)
    }
    if (transcodingConfig.bitrate) {
      builder.withBitrate(transcodingConfig.bitrate)
    }
    if (transcodingConfig.resolution) {
      builder.withResolution(transcodingConfig.resolution)
    }
    if (transcodingConfig.framerate) {
      builder.withFramerate(transcodingConfig.framerate)
    }
  }

  return builder.withOutput(outputUrl).build()
}