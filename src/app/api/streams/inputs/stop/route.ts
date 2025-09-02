import { NextRequest, NextResponse } from 'next/server'
import { StreamingService } from '@/lib/services/streaming-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inputId = params.id
    
    if (!inputId) {
      return NextResponse.json(
        { error: 'Stream input ID is required' },
        { status: 400 }
      )
    }

    const streamingService = StreamingService.getInstance()
    const result = await streamingService.stopStreamInput(inputId)

    return NextResponse.json({ 
      success: true, 
      message: 'Stream input stopped successfully',
      data: result 
    })
  } catch (error) {
    console.error('Error stopping stream input:', error)
    return NextResponse.json(
      { 
        error: 'Failed to stop stream input',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}