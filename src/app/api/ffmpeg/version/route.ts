import { NextRequest, NextResponse } from 'next/server'
import { FFmpegService } from '@/lib/services/ffmpeg-service'

export async function GET() {
  try {
    const ffmpegService = FFmpegService.getInstance()
    const version = await ffmpegService.getFFmpegVersion()
    const currentPath = ffmpegService.getCurrentFFmpegPath()

    return NextResponse.json({
      version: version,
      path: currentPath,
      message: version ? 'FFmpeg version retrieved successfully' : 'Unable to get FFmpeg version'
    })
  } catch (error) {
    console.error('Error getting FFmpeg version:', error)
    return NextResponse.json(
      { 
        version: null,
        path: 'ffmpeg',
        error: 'Failed to get FFmpeg version',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}