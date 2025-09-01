import { NextRequest, NextResponse } from 'next/server'
import { ConfigurationService } from '@/lib/services/configuration-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { configId } = body

    if (!configId) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
        { status: 400 }
      )
    }

    const configService = ConfigurationService.getInstance()
    const command = await configService.generateFFmpegCommand(configId)

    return NextResponse.json({ command })
  } catch (error) {
    console.error('Error generating FFmpeg command:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate FFmpeg command' },
      { status: 500 }
    )
  }
}