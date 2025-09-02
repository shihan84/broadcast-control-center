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
  r_frame_rate: string
  avg_frame_rate: string
  time_base: string
  start_pts: number
  start_time: string
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
  tags: {
    language?: string
    pid?: string
    stream_type?: string
  }
}

export interface FormatInfo {
  filename: string
  nb_streams: number
  nb_programs: number
  programs: Array<{
    program_id: number
    program_num: number
    nb_streams: number
    pmt_pid: number
    pcr_pid: number
  }>
  format_name: string
  format_long_name: string
  start_time: string
  duration: string
  size: string
  bit_rate: string
  probe_score: number
  tags: {
    title?: string
  }
}

export interface StreamAnalysis {
  streams: StreamInfo[]
  format: FormatInfo
}

export interface ValidationResult {
  isValid: boolean
  compliance: {
    video: boolean
    audio: boolean
    scte35: boolean
    format: boolean
    pids: boolean
    program: boolean
  }
  errors: string[]
  warnings: string[]
  recommendations: string[]
  score: number // 0-100 compliance score
}

export class StreamValidationService {
  private static instance: StreamValidationService

  private constructor() {}

  static getInstance(): StreamValidationService {
    if (!StreamValidationService.instance) {
      StreamValidationService.instance = new StreamValidationService()
    }
    return StreamValidationService.instance
  }

  async validateStreamFormat(analysis: StreamAnalysis): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    const recommendations: string[] = []
    let score = 100

    const compliance = {
      video: false,
      audio: false,
      scte35: false,
      format: false,
      pids: false,
      program: false
    }

    // Validate overall format
    this.validateFormat(analysis.format, compliance, errors, warnings, recommendations)
    
    // Validate streams
    this.validateStreams(analysis.streams, compliance, errors, warnings, recommendations)

    // Calculate compliance score
    score = this.calculateComplianceScore(compliance, errors.length, warnings.length)

    return {
      isValid: errors.length === 0,
      compliance,
      errors,
      warnings,
      recommendations,
      score
    }
  }

  private validateFormat(format: FormatInfo, compliance: any, errors: string[], warnings: string[], recommendations: string[]) {
    // Check format name
    if (format.format_name !== 'mpegts') {
      errors.push(`Expected format 'mpegts', got '${format.format_name}'`)
    } else {
      compliance.format = true
    }

    // Check number of streams
    if (format.nb_streams !== 3) {
      errors.push(`Expected 3 streams, got ${format.nb_streams}`)
    }

    // Check program structure
    if (format.nb_programs !== 1) {
      errors.push(`Expected 1 program, got ${format.nb_programs}`)
    }

    if (format.programs.length > 0) {
      const program = format.programs[0]
      
      // Validate PMT PID
      if (program.pmt_pid !== 1000) {
        errors.push(`Expected PMT PID 1000, got ${program.pmt_pid}`)
      }
      
      // Validate PCR PID
      if (program.pcr_pid !== 101) {
        errors.push(`Expected PCR PID 101, got ${program.pcr_pid}`)
      }

      if (program.pmt_pid === 1000 && program.pcr_pid === 101) {
        compliance.program = true
      }
    }

    // Check duration for live streams
    if (format.duration !== 'N/A') {
      warnings.push('Live stream duration should be N/A')
    }

    // Check filename format
    if (!format.filename.includes('srt://')) {
      warnings.push('Expected SRT protocol in filename')
    }
  }

  private validateStreams(streams: StreamInfo[], compliance: any, errors: string[], warnings: string[], recommendations: string[]) {
    const videoStream = streams.find(s => s.codec_type === 'video')
    const audioStream = streams.find(s => s.codec_type === 'audio')
    const scte35Stream = streams.find(s => s.codec_type === 'data' && s.codec_name === 'scte_35')

    // Validate video stream
    if (videoStream) {
      this.validateVideoStream(videoStream, compliance, errors, warnings)
    } else {
      errors.push('Video stream not found')
    }

    // Validate audio stream
    if (audioStream) {
      this.validateAudioStream(audioStream, compliance, errors, warnings)
    } else {
      errors.push('Audio stream not found')
    }

    // Validate SCTE-35 stream
    if (scte35Stream) {
      this.validateScte35Stream(scte35Stream, compliance, errors, warnings)
    } else {
      errors.push('SCTE-35 stream not found')
    }

    // Validate PIDs
    this.validatePIDs(streams, compliance, errors, warnings)
  }

  private validateVideoStream(stream: StreamInfo, compliance: any, errors: string[], warnings: string[]) {
    // Codec validation
    if (stream.codec_name !== 'h264') {
      errors.push(`Expected video codec 'h264', got '${stream.codec_name}'`)
    }

    if (stream.profile !== 'High') {
      errors.push(`Expected video profile 'High', got '${stream.profile}'`)
    }

    // Resolution validation
    if (stream.width !== 1920 || stream.height !== 1080) {
      errors.push(`Expected resolution 1920x1080, got ${stream.width}x${stream.height}`)
    }

    // Frame rate validation
    if (stream.r_frame_rate !== '25/1' || stream.avg_frame_rate !== '25/1') {
      errors.push(`Expected frame rate 25/1, got r_frame_rate: ${stream.r_frame_rate}, avg_frame_rate: ${stream.avg_frame_rate}`)
    }

    // Time base validation
    if (stream.time_base !== '1/90000') {
      errors.push(`Expected video time base 1/90000, got ${stream.time_base}`)
    }

    // Color space validation
    if (stream.color_space !== 'bt709') {
      errors.push(`Expected color space 'bt709', got '${stream.color_space}'`)
    }

    // Pixel format validation
    if (stream.pix_fmt !== 'yuv420p') {
      errors.push(`Expected pixel format 'yuv420p', got '${stream.pix_fmt}'`)
    }

    // Level validation
    if (stream.level !== 40) {
      errors.push(`Expected H.264 level 40, got ${stream.level}`)
    }

    // Check for critical errors
    const hasErrors = errors.some(e => e.includes('video') || e.includes('codec') || e.includes('resolution') || e.includes('frame rate'))
    if (!hasErrors) {
      compliance.video = true
    }
  }

  private validateAudioStream(stream: StreamInfo, compliance: any, errors: string[], warnings: string[]) {
    // Codec validation
    if (stream.codec_name !== 'aac') {
      errors.push(`Expected audio codec 'aac', got '${stream.codec_name}'`)
    }

    if (stream.profile !== 'LC') {
      errors.push(`Expected audio profile 'LC', got '${stream.profile}'`)
    }

    // Sample rate validation
    if (stream.sample_rate !== 48000) {
      errors.push(`Expected sample rate 48000, got ${stream.sample_rate}`)
    }

    // Channels validation
    if (stream.channels !== 2) {
      errors.push(`Expected 2 channels, got ${stream.channels}`)
    }

    // Channel layout validation
    if (stream.channel_layout !== 'stereo') {
      errors.push(`Expected channel layout 'stereo', got '${stream.channel_layout}'`)
    }

    // Bit rate validation
    if (stream.bit_rate !== '128000') {
      errors.push(`Expected bit rate 128000, got ${stream.bit_rate}`)
    }

    // Sample format validation
    if (stream.sample_fmt !== 'fltp') {
      errors.push(`Expected sample format 'fltp', got '${stream.sample_fmt}'`)
    }

    // Time base validation
    if (stream.time_base !== '1/90000') {
      errors.push(`Expected audio time base 1/90000, got ${stream.time_base}`)
    }

    // Check for critical errors
    const hasErrors = errors.some(e => e.includes('audio') || e.includes('codec') || e.includes('sample') || e.includes('channel'))
    if (!hasErrors) {
      compliance.audio = true
    }
  }

  private validateScte35Stream(stream: StreamInfo, compliance: any, errors: string[], warnings: string[]) {
    // Codec validation
    if (stream.codec_name !== 'scte_35') {
      errors.push(`Expected SCTE-35 codec 'scte_35', got '${stream.codec_name}'`)
    }

    // Codec type validation
    if (stream.codec_type !== 'data') {
      errors.push(`Expected SCTE-35 codec type 'data', got '${stream.codec_type}'`)
    }

    // Time base validation
    if (stream.time_base !== '1/90000') {
      errors.push(`Expected SCTE-35 time base 1/90000, got ${stream.time_base}`)
    }

    // Stream type validation
    if (stream.tags?.stream_type !== '0x86') {
      errors.push(`Expected SCTE-35 stream type '0x86', got '${stream.tags?.stream_type}'`)
    }

    // Language validation
    if (stream.tags?.language !== 'eng') {
      warnings.push(`Expected SCTE-35 language 'eng', got '${stream.tags?.language}'`)
    }

    // Check for critical errors
    const hasErrors = errors.some(e => e.includes('scte') || e.includes('SCTE'))
    if (!hasErrors) {
      compliance.scte35 = true
    }
  }

  private validatePIDs(streams: StreamInfo[], compliance: any, errors: string[], warnings: string[]) {
    const videoStream = streams.find(s => s.codec_type === 'video')
    const audioStream = streams.find(s => s.codec_type === 'audio')
    const scte35Stream = streams.find(s => s.codec_type === 'data' && s.codec_name === 'scte_35')

    // Validate Video PID
    if (videoStream?.tags?.pid !== '101') {
      errors.push(`Expected video PID 101, got ${videoStream?.tags?.pid}`)
    }

    // Validate Audio PID
    if (audioStream?.tags?.pid !== '102') {
      errors.push(`Expected audio PID 102, got ${audioStream?.tags?.pid}`)
    }

    // Validate SCTE-35 PID
    if (scte35Stream?.tags?.pid !== '500') {
      errors.push(`Expected SCTE-35 PID 500, got ${scte35Stream?.tags?.pid}`)
    }

    // Check if all PIDs are correct
    const videoPidOk = videoStream?.tags?.pid === '101'
    const audioPidOk = audioStream?.tags?.pid === '102'
    const scte35PidOk = scte35Stream?.tags?.pid === '500'

    if (videoPidOk && audioPidOk && scte35PidOk) {
      compliance.pids = true
    }
  }

  private calculateComplianceScore(compliance: any, errorCount: number, warningCount: number): number {
    let score = 100

    // Deduct for compliance failures
    const complianceItems = Object.values(compliance).filter(Boolean).length
    const totalComplianceItems = Object.keys(compliance).length
    const complianceRatio = complianceItems / totalComplianceItems
    
    score = Math.floor(score * complianceRatio)

    // Deduct for errors
    score = Math.max(0, score - (errorCount * 10))

    // Deduct for warnings
    score = Math.max(0, score - (warningCount * 2))

    return score
  }

  // Generate recommended FFmpeg command based on distributor requirements
  generateRecommendedCommand(inputUrl: string, outputUrl: string): string {
    return `ffmpeg -y \\
  -loglevel warning \\
  -thread_queue_size 1024 \\
  -i "${inputUrl}" \\
  -c:v libx264 \\
  -profile:v high \\
  -level 40 \\
  -pix_fmt yuv420p \\
  -s 1920x1080 \\
  -r 25 \\
  -g 50 \\
  -b:v 5000k \\
  -maxrate 5000k \\
  -bufsize 10000k \\
  -colorspace bt709 \\
  -color_primaries bt709 \\
  -color_trc bt709 \\
  -color_range tv \\
  -movflags +faststart \\
  -c:a aac \\
  -profile:a aac_low \\
  -b:a 128k \\
  -ar 48000 \\
  -ac 2 \\
  -f mpegts \\
  -mpegts_original_network_id 1 \\
  -mpegts_transport_stream_id 1 \\
  -mpegts_service_id 1 \\
  -mpegts_pmt_video_pid 101 \\
  -mpegts_pid_video 101 \\
  -mpegts_pmt_audio_pid 102 \\
  -mpegts_pid_audio 102 \\
  -mpegts_pmt_scte35_pid 500 \\
  -mpegts_pid_scte35 500 \\
  -mpegts_pmt_pmt_pid 1000 \\
  -mpegts_pmt_pcr_pid 101 \\
  -scte35 1 \\
  -metadata:s:0 language=eng \\
  -metadata:s:1 language=eng \\
  -metadata:s:2 language=eng \\
  -metadata:s:0 pid=101 \\
  -metadata:s:1 pid=102 \\
  -metadata:s:2 pid=500 \\
  -metadata:s:2 stream_type=0x86 \\
  "${outputUrl}"`
  }

  // Parse FFprobe output and return structured analysis
  parseFFprobeOutput(ffprobeOutput: string): StreamAnalysis {
    try {
      return JSON.parse(ffprobeOutput)
    } catch (error) {
      throw new Error(`Failed to parse FFprobe output: ${error}`)
    }
  }
}