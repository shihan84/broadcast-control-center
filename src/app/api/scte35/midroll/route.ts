import { NextRequest, NextResponse } from 'next/server'
import { SCTE35Service } from '@/lib/services/scte35-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channelId, duration, provider, description } = body

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      )
    }

    const scte35Service = SCTE35Service.getInstance()
    const event = await scte35Service.createMidRollEvent(
      channelId,
      duration || 120,
      provider,
      description
    )

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating mid-roll event:', error)
    return NextResponse.json(
      { error: 'Failed to create mid-roll event' },
      { status: 500 }
    )
  }
}