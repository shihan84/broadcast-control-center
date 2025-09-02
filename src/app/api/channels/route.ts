import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const channels = await db.broadcastChannel.findMany({
      include: {
        streamInputs: true,
        streamOutputs: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, userId } = body

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and user ID are required' },
        { status: 400 }
      )
    }

    const channel = await db.broadcastChannel.create({
      data: {
        name,
        description,
        userId,
        status: 'OFFLINE'
      },
      include: {
        streamInputs: true,
        streamOutputs: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(channel, { status: 201 })
  } catch (error) {
    console.error('Error creating channel:', error)
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    )
  }
}