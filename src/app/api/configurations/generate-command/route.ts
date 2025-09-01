import { NextRequest, NextResponse } from 'next/server'
import { ConfigurationService } from '@/lib/services/configuration-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { configId, config } = body

    const configService = ConfigurationService.getInstance()
    let command

    if (configId) {
      // Generate command from existing configuration
      command = await configService.generateFFmpegCommand(configId)
    } else if (config) {
      // Generate command from provided configuration
      command = configService.generateFFmpegCommandFromConfig(config)
    } else {
      return NextResponse.json(
        { error: 'Configuration ID or config data is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({ command })
  } catch (error) {
    console.error('Error generating FFmpeg command:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate FFmpeg command' },
      { status: 500 }
    )
  }
}