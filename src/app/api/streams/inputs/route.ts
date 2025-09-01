import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const streamInputs = await db.streamInput.findMany({
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(streamInputs)
  } catch (error) {
    console.error('Error fetching stream inputs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stream inputs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, url, channelId, config } = body

    if (!name || !type || !url || !channelId) {
      return NextResponse.json(
        { error: 'Name, type, URL, and channel ID are required' },
        { status: 400 }
      )
    }

    const streamInput = await db.streamInput.create({
      data: {
        name,
        type,
        url,
        channelId,
        config: config || '{}',
        status: 'DISCONNECTED'
      },
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json(streamInput, { status: 201 })
  } catch (error) {
    console.error('Error creating stream input:', error)
    return NextResponse.json(
      { error: 'Failed to create stream input' },
      { status: 500 }
    )
  }
}