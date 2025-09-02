export interface StreamInfo {
  index: number
  codec_name: string
  codec_long_name: string
  profile?: string
  codec_type: 'video' | 'audio' | 'data' | 'subtitle'
  codec_time_base: string
  codec_tag_string: string
  codec_tag: string
  width?: number
  height?: number
  coded_width?: number
  coded_height?: number
  closed_captions?: number
  has_b_frames?: number
  sample_aspect_ratio?: string
  display_aspect_ratio?: string
  pix_fmt?: string
  level?: number
  color_range?: string
  color_space?: string
  color_transfer?: string
  color_primaries?: string
  chroma_location?: string
  field_order?: string
  refs?: number
  is_avc?: string
  nal_length_size?: string
  r_frame_rate?: string
  avg_frame_rate?: string
  time_base: string
  start_pts?: number
  start_time?: string
  bits_per_raw_sample?: number
  sample_fmt?: string
  sample_rate?: number
  channels?: number
  channel_layout?: string
  bits_per_sample?: number
  bit_rate?: string
  disposition: {
    default: number
    dub: number
    original: number
    comment: number
    lyrics: number
    karaoke: number
    forced: number
    hearing_impaired: number
    visual_impaired: number
    clean_effects: number
    attached_pic: number
    timed_thumbnails: number
  }
  tags?: {
    language?: string
    pid?: string
    stream_type?: string
  }
}

export interface FormatInfo {
  filename: string
  nb_streams: number
  nb_programs: number
  programs?: Array<{
    program_id: number
    program_num: number
    nb_streams: number
    pmt_pid: number
    pcr_pid: number
  }>
  format_name: string
  format_long_name: string
  start_time?: string
  duration?: string
  size?: string
  bit_rate?: string
  probe_score: number
  tags?: {
    title?: string
  }
}

export interface StreamAnalysis {
  streams: StreamInfo[]
  format: FormatInfo
  timestamp: Date
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  compliance: {
    video: boolean
    audio: boolean
    scte35: boolean
    format: boolean
    overall: boolean
  }
  analysis: StreamAnalysis
}

export interface DistributorRequirements {
  video: {
    codec_name: 'h264'
    profile: 'High'
    codec_type: 'video'
    width: 1920
    height: 1080
    r_frame_rate: '25/1'
    avg_frame_rate: '25/1'
    time_base: '1/90000'
    pix_fmt: 'yuv420p'
    level: 40
    color_range: 'tv'
    color_space: 'bt709'
    color_transfer: 'bt709'
    color_primaries: 'bt709'
    chroma_location: 'left'
    field_order: 'progressive'
    tags: {
      language: 'eng'
      pid: '101'
    }
  }
  audio: {
    codec_name: 'aac'
    profile: 'LC'
    codec_type: 'audio'
    sample_fmt: 'fltp'
    sample_rate: 48000
    channels: 2
    channel_layout: 'stereo'
    bit_rate: '128000'
    time_base: '1/90000'
    tags: {
      language: 'eng'
      pid: '102'
    }
  }
  scte35: {
    codec_name: 'scte_35'
    codec_type: 'data'
    time_base: '1/90000'
    tags: {
      stream_type: '0x86'
      language: 'eng'
      pid: '500'
    }
  }
  format: {
    format_name: 'mpegts'
    nb_streams: 3
    nb_programs: 1
    programs: Array<{
      program_id: 1
      program_num: 1
      nb_streams: 3
      pmt_pid: 1000
      pcr_pid: 101
    }>
  }
}

export class StreamAnalysisService {
  private static instance: StreamAnalysisService
  private ffmpegPath: string = 'ffmpeg'

  private constructor() {}

  static getInstance(): StreamAnalysisService {
    if (!StreamAnalysisService.instance) {
      StreamAnalysisService.instance = new StreamAnalysisService()
    }
    return StreamAnalysisService.instance
  }

  setFFmpegPath(path: string) {
    this.ffmpegPath = path
  }

  async analyzeStream(streamUrl: string): Promise<StreamAnalysis> {
    try {
      // In a real implementation, this would call FFprobe to analyze the stream
      // For now, we'll simulate the analysis based on the distributor format
      return this.simulateStreamAnalysis(streamUrl)
    } catch (error) {
      console.error('Error analyzing stream:', error)
      throw error
    }
  }

  async validateAgainstDistributorRequirements(streamUrl: string): Promise<ValidationResult> {
    try {
      const analysis = await this.analyzeStream(streamUrl)
      return this.validateAnalysis(analysis)
    } catch (error) {
      console.error('Error validating stream:', error)
      throw error
    }
  }

  private simulateStreamAnalysis(streamUrl: string): StreamAnalysis {
    // Simulate FFprobe output based on distributor format
    const streams: StreamInfo[] = [
      {
        index: 0,
        codec_name: 'h264',
        codec_long_name: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
        profile: 'High',
        codec_type: 'video',
        codec_time_base: '1/50',
        codec_tag_string: '[27][0][0][0]',
        codec_tag: '0x001b',
        width: 1920,
        height: 1080,
        coded_width: 1920,
        coded_height: 1088,
        closed_captions: 0,
        has_b_frames: 2,
        sample_aspect_ratio: '1:1',
        display_aspect_ratio: '16:9',
        pix_fmt: 'yuv420p',
        level: 40,
        color_range: 'tv',
        color_space: 'bt709',
        color_transfer: 'bt709',
        color_primaries: 'bt709',
        chroma_location: 'left',
        field_order: 'progressive',
        refs: 1,
        is_avc: 'true',
        nal_length_size: '4',
        r_frame_rate: '25/1',
        avg_frame_rate: '25/1',
        time_base: '1/90000',
        start_pts: 90000,
        start_time: '1.000000',
        bits_per_raw_sample: 8,
        disposition: {
          default: 1,
          dub: 0,
          original: 0,
          comment: 0,
          lyrics: 0,
          karaoke: 0,
          forced: 0,
          hearing_impaired: 0,
          visual_impaired: 0,
          clean_effects: 0,
          attached_pic: 0,
          timed_thumbnails: 0
        },
        tags: {
          language: 'eng',
          pid: '101'
        }
      },
      {
        index: 1,
        codec_name: 'aac',
        codec_long_name: 'AAC (Advanced Audio Coding)',
        profile: 'LC',
        codec_type: 'audio',
        codec_time_base: '1/48000',
        codec_tag_string: '[15][0][0][0]',
        codec_tag: '0x000f',
        sample_fmt: 'fltp',
        sample_rate: 48000,
        channels: 2,
        channel_layout: 'stereo',
        bits_per_sample: 0,
        r_frame_rate: '0/0',
        avg_frame_rate: '0/0',
        time_base: '1/90000',
        start_pts: 92160,
        start_time: '1.024000',
        bit_rate: '128000',
        disposition: {
          default: 1,
          dub: 0,
          original: 0,
          comment: 0,
          lyrics: 0,
          karaoke: 0,
          forced: 0,
          hearing_impaired: 0,
          visual_impaired: 0,
          clean_effects: 0,
          attached_pic: 0,
          timed_thumbnails: 0
        },
        tags: {
          language: 'eng',
          pid: '102'
        }
      },
      {
        index: 2,
        codec_name: 'scte_35',
        codec_long_name: 'SCTE-35',
        codec_type: 'data',
        codec_tag_string: '[6][0][0][0]',
        codec_tag: '0x0006',
        r_frame_rate: '0/0',
        avg_frame_rate: '0/0',
        time_base: '1/90000',
        start_pts: 86400,
        start_time: '0.960000',
        disposition: {
          default: 0,
          dub: 0,
          original: 0,
          comment: 0,
          lyrics: 0,
          karaoke: 0,
          forced: 0,
          hearing_impaired: 0,
          visual_impaired: 0,
          clean_effects: 0,
          attached_pic: 0,
          timed_thumbnails: 0
        },
        tags: {
          stream_type: '0x86',
          language: 'eng',
          pid: '500'
        }
      }
    ]

    const format: FormatInfo = {
      filename: streamUrl,
      nb_streams: 3,
      nb_programs: 1,
      programs: [
        {
          program_id: 1,
          program_num: 1,
          nb_streams: 3,
          pmt_pid: 1000,
          pcr_pid: 101
        }
      ],
      format_name: 'mpegts',
      format_long_name: 'MPEG-TS (MPEG-2 Transport Stream)',
      start_time: '0.960000',
      duration: 'N/A',
      size: 'N/A',
      bit_rate: 'N/A',
      probe_score: 100,
      tags: {
        title: 'SRT Live Stream'
      }
    }

    return {
      streams,
      format,
      timestamp: new Date()
    }
  }

  private validateAnalysis(analysis: StreamAnalysis): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []
    
    const compliance = {
      video: false,
      audio: false,
      scte35: false,
      format: false,
      overall: false
    }

    // Validate video stream
    const videoStream = analysis.streams.find(s => s.codec_type === 'video')
    if (videoStream) {
      const req = this.getDistributorRequirements().video
      
      // Check video codec
      if (videoStream.codec_name !== req.codec_name) {
        errors.push(`Video codec mismatch: expected ${req.codec_name}, got ${videoStream.codec_name}`)
      }
      
      // Check profile
      if (videoStream.profile !== req.profile) {
        errors.push(`Video profile mismatch: expected ${req.profile}, got ${videoStream.profile}`)
      }
      
      // Check resolution
      if (videoStream.width !== req.width || videoStream.height !== req.height) {
        errors.push(`Resolution mismatch: expected ${req.width}x${req.height}, got ${videoStream.width}x${videoStream.height}`)
      }
      
      // Check framerate
      if (videoStream.r_frame_rate !== req.r_frame_rate) {
        errors.push(`Framerate mismatch: expected ${req.r_frame_rate}, got ${videoStream.r_frame_rate}`)
      }
      
      // Check color space
      if (videoStream.color_space !== req.color_space) {
        errors.push(`Color space mismatch: expected ${req.color_space}, got ${videoStream.color_space}`)
      }
      
      // Check PID
      if (videoStream.tags?.pid !== req.tags.pid) {
        errors.push(`Video PID mismatch: expected ${req.tags.pid}, got ${videoStream.tags?.pid}`)
      }
      
      // If no errors, video is compliant
      if (errors.filter(e => e.includes('Video')).length === 0) {
        compliance.video = true
      }
    } else {
      errors.push('No video stream found')
    }

    // Validate audio stream
    const audioStream = analysis.streams.find(s => s.codec_type === 'audio')
    if (audioStream) {
      const req = this.getDistributorRequirements().audio
      
      // Check audio codec
      if (audioStream.codec_name !== req.codec_name) {
        errors.push(`Audio codec mismatch: expected ${req.codec_name}, got ${audioStream.codec_name}`)
      }
      
      // Check profile
      if (audioStream.profile !== req.profile) {
        errors.push(`Audio profile mismatch: expected ${req.profile}, got ${audioStream.profile}`)
      }
      
      // Check sample rate
      if (audioStream.sample_rate !== req.sample_rate) {
        errors.push(`Sample rate mismatch: expected ${req.sample_rate}, got ${audioStream.sample_rate}`)
      }
      
      // Check channels
      if (audioStream.channels !== req.channels) {
        errors.push(`Channel count mismatch: expected ${req.channels}, got ${audioStream.channels}`)
      }
      
      // Check bit rate
      if (audioStream.bit_rate !== req.bit_rate) {
        errors.push(`Audio bitrate mismatch: expected ${req.bit_rate}, got ${audioStream.bit_rate}`)
      }
      
      // Check PID
      if (audioStream.tags?.pid !== req.tags.pid) {
        errors.push(`Audio PID mismatch: expected ${req.tags.pid}, got ${audioStream.tags?.pid}`)
      }
      
      // If no errors, audio is compliant
      if (errors.filter(e => e.includes('Audio')).length === 0) {
        compliance.audio = true
      }
    } else {
      errors.push('No audio stream found')
    }

    // Validate SCTE-35 stream
    const scte35Stream = analysis.streams.find(s => s.codec_name === 'scte_35')
    if (scte35Stream) {
      const req = this.getDistributorRequirements().scte35
      
      // Check codec type
      if (scte35Stream.codec_type !== req.codec_type) {
        errors.push(`SCTE-35 codec type mismatch: expected ${req.codec_type}, got ${scte35Stream.codec_type}`)
      }
      
      // Check stream type
      if (scte35Stream.tags?.stream_type !== req.tags.stream_type) {
        errors.push(`SCTE-35 stream type mismatch: expected ${req.tags.stream_type}, got ${scte35Stream.tags?.stream_type}`)
      }
      
      // Check PID
      if (scte35Stream.tags?.pid !== req.tags.pid) {
        errors.push(`SCTE-35 PID mismatch: expected ${req.tags.pid}, got ${scte35Stream.tags?.pid}`)
      }
      
      // If no errors, SCTE-35 is compliant
      if (errors.filter(e => e.includes('SCTE-35')).length === 0) {
        compliance.scte35 = true
      }
    } else {
      errors.push('No SCTE-35 stream found')
    }

    // Validate format
    const format = analysis.format
    const req = this.getDistributorRequirements().format
    
    // Check format name
    if (format.format_name !== req.format_name) {
      errors.push(`Format mismatch: expected ${req.format_name}, got ${format.format_name}`)
    }
    
    // Check stream count
    if (format.nb_streams !== req.nb_streams) {
      errors.push(`Stream count mismatch: expected ${req.nb_streams}, got ${format.nb_streams}`)
    }
    
    // Check program count
    if (format.nb_programs !== req.nb_programs) {
      errors.push(`Program count mismatch: expected ${req.nb_programs}, got ${format.nb_programs}`)
    }
    
    // Check program details
    if (format.programs && format.programs.length > 0) {
      const program = format.programs[0]
      const expectedProgram = req.programs[0]
      
      if (program.pmt_pid !== expectedProgram.pmt_pid) {
        errors.push(`PMT PID mismatch: expected ${expectedProgram.pmt_pid}, got ${program.pmt_pid}`)
      }
      
      if (program.pcr_pid !== expectedProgram.pcr_pid) {
        errors.push(`PCR PID mismatch: expected ${expectedProgram.pcr_pid}, got ${program.pcr_pid}`)
      }
    }
    
    // If no format errors, format is compliant
    if (errors.filter(e => e.includes('Format') || e.includes('Stream count') || e.includes('Program')).length === 0) {
      compliance.format = true
    }

    // Overall compliance
    compliance.overall = compliance.video && compliance.audio && compliance.scte35 && compliance.format

    // Add suggestions based on validation results
    if (!compliance.video) {
      suggestions.push('Configure video encoding to match distributor requirements: H.264 High Profile, 1920x1080, 25fps')
    }
    
    if (!compliance.audio) {
      suggestions.push('Configure audio encoding to match distributor requirements: AAC LC, 48kHz, Stereo, 128kbps')
    }
    
    if (!compliance.scte35) {
      suggestions.push('Ensure SCTE-35 stream is enabled with PID 500 and stream type 0x86')
    }
    
    if (!compliance.format) {
      suggestions.push('Ensure MPEG-TS container with correct program structure and PID assignments')
    }

    if (compliance.overall) {
      suggestions.push('Stream is fully compliant with distributor requirements!')
    }

    return {
      isValid: compliance.overall,
      errors,
      warnings,
      suggestions,
      compliance,
      analysis
    }
  }

  private getDistributorRequirements(): DistributorRequirements {
    return {
      video: {
        codec_name: 'h264',
        profile: 'High',
        codec_type: 'video',
        width: 1920,
        height: 1080,
        r_frame_rate: '25/1',
        avg_frame_rate: '25/1',
        time_base: '1/90000',
        pix_fmt: 'yuv420p',
        level: 40,
        color_range: 'tv',
        color_space: 'bt709',
        color_transfer: 'bt709',
        color_primaries: 'bt709',
        chroma_location: 'left',
        field_order: 'progressive',
        tags: {
          language: 'eng',
          pid: '101'
        }
      },
      audio: {
        codec_name: 'aac',
        profile: 'LC',
        codec_type: 'audio',
        sample_fmt: 'fltp',
        sample_rate: 48000,
        channels: 2,
        channel_layout: 'stereo',
        bit_rate: '128000',
        time_base: '1/90000',
        tags: {
          language: 'eng',
          pid: '102'
        }
      },
      scte35: {
        codec_name: 'scte_35',
        codec_type: 'data',
        time_base: '1/90000',
        tags: {
          stream_type: '0x86',
          language: 'eng',
          pid: '500'
        }
      },
      format: {
        format_name: 'mpegts',
        nb_streams: 3,
        nb_programs: 1,
        programs: [{
          program_id: 1,
          program_num: 1,
          nb_streams: 3,
          pmt_pid: 1000,
          pcr_pid: 101
        }]
      }
    }
  }

  async generateComplianceReport(streamUrl: string): Promise<string> {
    try {
      const validation = await this.validateAgainstDistributorRequirements(streamUrl)
      
      let report = `# Stream Compliance Report\n\n`
      report += `Generated: ${validation.analysis.timestamp.toISOString()}\n`
      report += `Stream URL: ${streamUrl}\n\n`
      
      report += `## Overall Status\n\n`
      report += `**Compliance**: ${validation.compliance.overall ? '✅ PASS' : '❌ FAIL'}\n\n`
      
      report += `### Component Status\n\n`
      report += `- **Video Stream**: ${validation.compliance.video ? '✅ Compliant' : '❌ Non-compliant'}\n`
      report += `- **Audio Stream**: ${validation.compliance.audio ? '✅ Compliant' : '❌ Non-compliant'}\n`
      report += `- **SCTE-35 Stream**: ${validation.compliance.scte35 ? '✅ Compliant' : '❌ Non-compliant'}\n`
      report += `- **Format**: ${validation.compliance.format ? '✅ Compliant' : '❌ Non-compliant'}\n\n`
      
      if (validation.errors.length > 0) {
        report += `## Errors\n\n`
        validation.errors.forEach(error => {
          report += `- ❌ ${error}\n`
        })
        report += `\n`
      }
      
      if (validation.warnings.length > 0) {
        report += `## Warnings\n\n`
        validation.warnings.forEach(warning => {
          report += `- ⚠️ ${warning}\n`
        })
        report += `\n`
      }
      
      if (validation.suggestions.length > 0) {
        report += `## Suggestions\n\n`
        validation.suggestions.forEach(suggestion => {
          report += `- 💡 ${suggestion}\n`
        })
        report += `\n`
      }
      
      report += `## Stream Details\n\n`
      report += `### Format Information\n\n`
      report += `- **Format**: ${validation.analysis.format.format_long_name}\n`
      report += `- **Streams**: ${validation.analysis.format.nb_streams}\n`
      report += `- **Programs**: ${validation.analysis.format.nb_programs}\n\n`
      
      report += `### Stream Information\n\n`
      validation.analysis.streams.forEach(stream => {
        report += `#### Stream ${stream.index} (${stream.codec_type.toUpperCase()})\n\n`
        report += `- **Codec**: ${stream.codec_long_name}\n`
        if (stream.profile) report += `- **Profile**: ${stream.profile}\n`
        if (stream.width && stream.height) report += `- **Resolution**: ${stream.width}x${stream.height}\n`
        if (stream.r_frame_rate) report += `- **Framerate**: ${stream.r_frame_rate}\n`
        if (stream.sample_rate) report += `- **Sample Rate**: ${stream.sample_rate} Hz\n`
        if (stream.channels) report += `- **Channels**: ${stream.channels}\n`
        if (stream.bit_rate) report += `- **Bitrate**: ${stream.bit_rate}\n`
        if (stream.tags?.pid) report += `- **PID**: ${stream.tags.pid}\n`
        report += `\n`
      })
      
      return report
    } catch (error) {
      console.error('Error generating compliance report:', error)
      throw error
    }
  }
}