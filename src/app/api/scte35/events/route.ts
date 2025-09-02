import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const scte35Events = await db.sCTE35Event.findMany({
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json(scte35Events)
  } catch (error) {
    console.error('Error fetching SCTE-35 events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SCTE-35 events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, eventType, channelId, startTime, duration, command, description, userId } = body

    if (!eventId || !eventType || !channelId || !startTime || !command) {
      return NextResponse.json(
        { error: 'Event ID, type, channel ID, start time, and command are required' },
        { status: 400 }
      )
    }

    const scte35Event = await db.sCTE35Event.create({
      data: {
        eventId,
        eventType,
        channelId,
        startTime: new Date(startTime),
        duration,
        command,
        description,
        userId,
        status: 'SCHEDULED'
      },
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(scte35Event, { status: 201 })
  } catch (error) {
    console.error('Error creating SCTE-35 event:', error)
    return NextResponse.json(
      { error: 'Failed to create SCTE-35 event' },
      { status: 500 }
    )
  }
}