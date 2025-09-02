import { NextRequest, NextResponse } from 'next/server'
import { FFmpegService } from '@/lib/services/ffmpeg-service'

export async function GET() {
  try {
    const ffmpegService = FFmpegService.getInstance()
    const isAvailable = await ffmpegService.testFFmpegInstallation()
    const status = ffmpegService.getServiceStatus()
    
    let version = null
    if (isAvailable) {
      version = await ffmpegService.getFFmpegVersion()
    }

    return NextResponse.json({
      ffmpegAvailable: isAvailable,
      ffmpegPath: status.ffmpegPath,
      ffmpegVersion: version,
      status,
      simulationMode: ffmpegService.isSimulationMode(),
      message: isAvailable 
        ? 'FFmpeg is available and ready for real stream processing'
        : 'FFmpeg is not installed - running in simulation mode for testing',
      recommendations: isAvailable 
        ? []
        : [
            'Install FFmpeg to enable real stream processing',
            'On Ubuntu/Debian: sudo apt-get install ffmpeg',
            'On CentOS/RHEL: sudo yum install ffmpeg',
            'On macOS: brew install ffmpeg',
            'For testing: Continue using simulation mode'
          ]
    })
  } catch (error) {
    console.error('Error checking FFmpeg status:', error)
    return NextResponse.json(
      { 
        ffmpegAvailable: false,
        ffmpegPath: 'ffmpeg',
        ffmpegVersion: null,
        simulationMode: true,
        error: 'Failed to check FFmpeg status',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: ['Check FFmpeg installation and try again']
      },
      { status: 500 }
    )
  }
}