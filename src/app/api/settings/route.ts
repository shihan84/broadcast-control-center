import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

interface SettingsData {
  system: SystemSettings
  stream: StreamSettings
  network: NetworkSettings
}

// Default settings
const defaultSettings: SettingsData = {
  system: {
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
  },
  stream: {
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
  },
  network: {
    streamBufferSize: 4096,
    connectionTimeout: 30,
    retryAttempts: 3,
    retryDelay: 5,
    enableKeepAlive: true,
    keepAliveInterval: 30,
    maxBandwidth: 100,
    enableQoS: true,
    preferredProtocol: 'auto'
  }
}

export async function GET() {
  try {
    // Try to get settings from database
    let settings = await db.systemSettings.findFirst()
    
    if (!settings) {
      // Create default settings if none exist
      try {
        settings = await db.systemSettings.create({
          data: {
            systemConfig: JSON.stringify(defaultSettings.system),
            streamConfig: JSON.stringify(defaultSettings.stream),
            networkConfig: JSON.stringify(defaultSettings.network)
          }
        })
        console.log('Created default system settings')
      } catch (createError) {
        console.error('Error creating default settings:', createError)
        // Return default settings if we can't create them
        return NextResponse.json(defaultSettings)
      }
    }

    const settingsData: SettingsData = {
      system: JSON.parse(settings.systemConfig),
      stream: JSON.parse(settings.streamConfig),
      network: JSON.parse(settings.networkConfig)
    }

    return NextResponse.json(settingsData)
  } catch (error) {
    console.error('Error fetching settings:', error)
    // Return default settings if there's an error
    return NextResponse.json(defaultSettings)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { system, stream, network } = body

    // Validate settings
    if (!system || !stream || !network) {
      return NextResponse.json(
        { error: 'System, stream, and network settings are required' },
        { status: 400 }
      )
    }

    // Validate system settings
    if (system.ffmpegPath && typeof system.ffmpegPath !== 'string') {
      return NextResponse.json(
        { error: 'FFmpeg path must be a string' },
        { status: 400 }
      )
    }

    if (system.maxConcurrentStreams < 1 || system.maxConcurrentStreams > 100) {
      return NextResponse.json(
        { error: 'Max concurrent streams must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Update or create settings in database
    try {
      const existingSettings = await db.systemSettings.findFirst()

      if (existingSettings) {
        await db.systemSettings.update({
          where: { id: existingSettings.id },
          data: {
            systemConfig: JSON.stringify(system),
            streamConfig: JSON.stringify(stream),
            networkConfig: JSON.stringify(network),
            updatedAt: new Date()
          }
        })
      } else {
        await db.systemSettings.create({
          data: {
            systemConfig: JSON.stringify(system),
            streamConfig: JSON.stringify(stream),
            networkConfig: JSON.stringify(network)
          }
        })
      }
    } catch (dbError) {
      console.error('Database error saving settings:', dbError)
      return NextResponse.json(
        { 
          error: 'Failed to save settings to database',
          details: dbError instanceof Error ? dbError.message : 'Database error'
        },
        { status: 500 }
      )
    }

    // Update FFmpeg service with new path
    try {
      const { FFmpegService } = await import('@/lib/services/ffmpeg-service')
      const ffmpegService = FFmpegService.getInstance()
      if (!system.ffmpegAutoDetect && system.ffmpegPath) {
        ffmpegService.setFFmpegPath(system.ffmpegPath)
      }
    } catch (serviceError) {
      console.error('Error updating FFmpeg service:', serviceError)
      // Don't fail the whole request if this fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Settings saved successfully' 
    })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}