import { NextRequest, NextResponse } from 'next/server'
import { SCTE35Service } from '@/lib/services/scte35-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channelId, rollType, interval, duration, adProvider, adCampaign, startTime, endTime, userId } = body

    if (!channelId || !rollType || !interval || !duration) {
      return NextResponse.json(
        { error: 'Channel ID, roll type, interval, and duration are required' },
        { status: 400 }
      )
    }

    const scte35Service = SCTE35Service.getInstance()
    const events = await scte35Service.scheduleRecurringAdBreaks(channelId, {
      rollType,
      interval: parseInt(interval),
      duration: parseInt(duration),
      adProvider,
      adCampaign,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      userId
    })

    return NextResponse.json({ events, count: events.length })
  } catch (error) {
    console.error('Error scheduling recurring ad breaks:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to schedule recurring ad breaks' },
      { status: 500 }
    )
  }
}