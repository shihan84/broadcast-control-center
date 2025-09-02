import { NextRequest, NextResponse } from 'next/server'
import { StreamingService } from '@/lib/services/streaming-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const outputId = params.id
    
    if (!outputId) {
      return NextResponse.json(
        { error: 'Stream output ID is required' },
        { status: 400 }
      )
    }

    const streamingService = StreamingService.getInstance()
    const result = await streamingService.stopStreamOutput(outputId)

    return NextResponse.json({ 
      success: true, 
      message: 'Stream output stopped successfully',
      data: result 
    })
  } catch (error) {
    console.error('Error stopping stream output:', error)
    return NextResponse.json(
      { 
        error: 'Failed to stop stream output',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}