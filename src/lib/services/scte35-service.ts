import { SCTE35 } from 'scte35'
import { db } from '@/lib/db'

export interface SCTE35EventData {
  eventId: string
  eventType: string
  channelId: string
  startTime: Date
  duration?: number
  command: string
  description?: string
  userId?: string
}

export class SCTE35Service {
  private static instance: SCTE35Service
  private scte35: SCTE35

  private constructor() {
    this.scte35 = new SCTE35()
  }

  static getInstance(): SCTE35Service {
    if (!SCTE35Service.instance) {
      SCTE35Service.instance = new SCTE35Service()
    }
    return SCTE35Service.instance
  }

  async createEvent(eventData: SCTE35EventData) {
    try {
      // Create SCTE-35 command
      const command = this.generateSCTE35Command(eventData)
      
      // Save to database
      const event = await db.sCTE35Event.create({
        data: {
          eventId: eventData.eventId,
          eventType: eventData.eventType as any,
          channelId: eventData.channelId,
          startTime: eventData.startTime,
          duration: eventData.duration,
          command: command,
          description: eventData.description,
          userId: eventData.userId,
          status: 'SCHEDULED'
        },
        include: {
          channel: true,
          user: true
        }
      })

      return event
    } catch (error) {
      console.error('Error creating SCTE-35 event:', error)
      throw error
    }
  }

  async executeEvent(eventId: string) {
    try {
      const event = await db.sCTE35Event.findUnique({
        where: { id: eventId },
        include: { channel: true }
      })

      if (!event) {
        throw new Error('Event not found')
      }

      // Parse and execute SCTE-35 command
      const parsedCommand = this.scte35.parse(event.command)
      
      // Update event status
      await db.sCTE35Event.update({
        where: { id: eventId },
        data: { status: 'RUNNING' }
      })

      // Here you would integrate with your streaming infrastructure
      // to actually inject the SCTE-35 signal into the stream
      console.log('Executing SCTE-35 command:', parsedCommand)

      // Simulate execution completion
      setTimeout(async () => {
        await db.sCTE35Event.update({
          where: { id: eventId },
          data: { status: 'COMPLETED' }
        })
      }, 1000)

      return event
    } catch (error) {
      console.error('Error executing SCTE-35 event:', error)
      
      // Update event status to error
      await db.sCTE35Event.update({
        where: { id: eventId },
        data: { status: 'ERROR' }
      })
      
      throw error
    }
  }

  async cancelEvent(eventId: string) {
    try {
      const event = await db.sCTE35Event.update({
        where: { id: eventId },
        data: { status: 'CANCELLED' },
        include: {
          channel: true,
          user: true
        }
      })

      return event
    } catch (error) {
      console.error('Error cancelling SCTE-35 event:', error)
      throw error
    }
  }

  async getScheduledEvents(channelId?: string) {
    try {
      const where: any = {
        status: 'SCHEDULED',
        startTime: {
          gte: new Date()
        }
      }

      if (channelId) {
        where.channelId = channelId
      }

      const events = await db.sCTE35Event.findMany({
        where,
        include: {
          channel: true,
          user: true
        },
        orderBy: {
          startTime: 'asc'
        }
      })

      return events
    } catch (error) {
      console.error('Error fetching scheduled events:', error)
      throw error
    }
  }

  async getRecentEvents(channelId?: string, limit: number = 50) {
    try {
      const where: any = {}
      if (channelId) {
        where.channelId = channelId
      }

      const events = await db.sCTE35Event.findMany({
        where,
        include: {
          channel: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })

      return events
    } catch (error) {
      console.error('Error fetching recent events:', error)
      throw error
    }
  }

  private generateSCTE35Command(eventData: SCTE35EventData): string {
    // Generate SCTE-35 command based on event type
    const commandData = {
      splice_insert: {
        splice_event_id: parseInt(eventData.eventId.replace(/\D/g, '')) || 1,
        splice_event_cancel_indicator: false,
        out_of_network_indicator: true,
        program_splice_flag: true,
        duration_flag: eventData.duration ? true : false,
        splice_immediate_flag: false,
        unique_program_id: 1,
        avail_num: 1,
        avails_expected: 1,
        breaks: [
          {
            auto_return: true,
            break_duration: eventData.duration || 0,
            break_id: 0
          }
        ]
      }
    }

    // Convert to SCTE-35 binary format
    return this.scte35.encode(commandData)
  }

  parseSCTE35Command(command: string) {
    try {
      return this.scte35.parse(command)
    } catch (error) {
      console.error('Error parsing SCTE-35 command:', error)
      throw error
    }
  }

  async processIncomingSCTE35(data: string, channelId: string) {
    try {
      const parsed = this.parseSCTE35Command(data)
      
      // Create event from incoming SCTE-35 data
      const event = await this.createEvent({
        eventId: `INCOMING-${Date.now()}`,
        eventType: this.mapSCTE35ToEventType(parsed),
        channelId,
        startTime: new Date(),
        command: data,
        description: 'Incoming SCTE-35 event'
      })

      return event
    } catch (error) {
      console.error('Error processing incoming SCTE-35:', error)
      throw error
    }
  }

  private mapSCTE35ToEventType(parsed: any): string {
    // Map SCTE-35 parsed data to event types
    if (parsed.splice_insert) {
      if (parsed.splice_insert.out_of_network_indicator) {
        return 'commercial_start'
      } else {
        return 'program_start'
      }
    }
    
    if (parsed.time_signal) {
      return 'break_start'
    }
    
    return 'custom'
  }
}