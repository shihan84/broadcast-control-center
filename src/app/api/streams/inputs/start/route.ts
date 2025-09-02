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
    const result = await streamingService.startStreamInput(inputId)

    return NextResponse.json({ 
      success: true, 
      message: 'Stream input started successfully',
      data: result 
    })
  } catch (error) {
    console.error('Error starting stream input:', error)
    return NextResponse.json(
      { 
        error: 'Failed to start stream input',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}