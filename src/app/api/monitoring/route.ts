import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')
    const metricType = searchParams.get('metricType')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {}
    if (channelId) where.channelId = channelId
    if (metricType) where.metricType = metricType

    const monitoringData = await db.monitoringData.findMany({
      where,
      include: {
        channel: channelId ? {
          select: {
            id: true,
            name: true,
            status: true
          }
        } : undefined,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    })

    return NextResponse.json(monitoringData)
  } catch (error) {
    console.error('Error fetching monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metricType, value, channelId, userId, metadata } = body

    if (!metricType || value === undefined) {
      return NextResponse.json(
        { error: 'Metric type and value are required' },
        { status: 400 }
      )
    }

    const monitoringData = await db.monitoringData.create({
      data: {
        metricType,
        value: parseFloat(value),
        channelId,
        userId,
        metadata: metadata || null
      },
      include: {
        channel: channelId ? {
          select: {
            id: true,
            name: true,
            status: true
          }
        } : undefined,
        user: userId ? {
          select: {
            id: true,
            name: true,
            email: true
          }
        } : undefined
      }
    })

    return NextResponse.json(monitoringData, { status: 201 })
  } catch (error) {
    console.error('Error creating monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to create monitoring data' },
      { status: 500 }
    )
  }
}