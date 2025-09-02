import { NextRequest, NextResponse } from 'next/server'
import { StreamAnalysisService } from '@/lib/services/stream-analysis-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { streamUrl } = body

    if (!streamUrl) {
      return NextResponse.json(
        { error: 'Stream URL is required' },
        { status: 400 }
      )
    }

    // Basic URL validation
    try {
      new URL(streamUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid stream URL format' },
        { status: 400 }
      )
    }

    const analysisService = StreamAnalysisService.getInstance()
    const analysis = await analysisService.analyzeStream(streamUrl)

    return NextResponse.json({
      success: true,
      analysis,
      message: 'Stream analysis completed successfully'
    })
  } catch (error) {
    console.error('Error analyzing stream:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze stream',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}