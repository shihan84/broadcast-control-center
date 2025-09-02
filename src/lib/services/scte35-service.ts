import { SCTE35 } from 'scte35'
import { SCTE35ThreeFiveService, SCTE35Cue, SpliceInsertOptions } from './scte35-threefive-service'
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
  rollType?: 'pre-roll' | 'post-roll' | 'mid-roll' | 'unknown'
  adBreakId?: string
  adProvider?: string
  adCampaign?: string
  adCreative?: string
  targeting?: {
    demographics?: string[]
    geography?: string[]
    timeOfDay?: string[]
    content?: string[]
  }
  constraints?: {
    maxDuration?: number
    minDuration?: number
    allowedPositions?: string[]
    blackoutDates?: Date[]
  }
}

export class SCTE35Service {
  private static instance: SCTE35Service
  private scte35: SCTE35
  private threefiveService: SCTE35ThreeFiveService

  private constructor() {
    this.scte35 = new SCTE35()
    this.threefiveService = SCTE35ThreeFiveService.getInstance()
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
    // Generate SCTE-35 command based on event type and roll type
    const commandData = {
      splice_insert: {
        splice_event_id: parseInt(eventData.eventId.replace(/\D/g, '')) || 1,
        splice_event_cancel_indicator: false,
        out_of_network_indicator: this.getOutOfNetworkIndicator(eventData),
        program_splice_flag: true,
        duration_flag: eventData.duration ? true : false,
        splice_immediate_flag: this.getSpliceImmediateFlag(eventData),
        unique_program_id: 1,
        avail_num: 1,
        avails_expected: 1,
        breaks: eventData.duration ? [
          {
            auto_return: true,
            break_duration: eventData.duration,
            break_id: this.getBreakId(eventData)
          }
        ] : []
      }
    }

    // Convert to SCTE-35 binary format
    return this.scte35.encode(commandData)
  }

  private getOutOfNetworkIndicator(eventData: SCTE35EventData): boolean {
    switch (eventData.rollType) {
      case 'pre-roll':
      case 'post-roll':
        return true // Commercial breaks are out of network
      case 'mid-roll':
        return eventData.eventType === 'commercial_start' || eventData.eventType === 'provider_ad_start'
      default:
        return false
    }
  }

  private getSpliceImmediateFlag(eventData: SCTE35EventData): boolean {
    // Pre-roll and post-roll typically need immediate execution
    return eventData.rollType === 'pre-roll' || eventData.rollType === 'post-roll'
  }

  private getBreakId(eventData: SCTE35EventData): number {
    // Generate break ID based on roll type and event
    const rollTypeMap = {
      'pre-roll': 100,
      'post-roll': 200,
      'mid-roll': 300,
      'unknown': 0
    }
    return rollTypeMap[eventData.rollType || 'unknown'] + Math.floor(Math.random() * 99)
  }

  // Pre-roll template methods
  async createPreRollEvent(channelId: string, startTime: Date, options: {
    duration?: number
    adProvider?: string
    adCampaign?: string
    adCreative?: string
    targeting?: SCTE35EventData['targeting']
    userId?: string
  } = {}): Promise<any> {
    const eventId = `PREROLL-${Date.now()}`
    
    const eventData: SCTE35EventData = {
      eventId,
      eventType: 'commercial_start',
      channelId,
      startTime,
      duration: options.duration || 30, // Default 30 seconds
      command: '', // Will be generated in createEvent
      description: `Pre-roll advertisement - ${options.adProvider || 'Unknown Provider'}`,
      userId: options.userId,
      rollType: 'pre-roll',
      adBreakId: `BREAK-${eventId}`,
      adProvider: options.adProvider,
      adCampaign: options.adCampaign,
      adCreative: options.adCreative,
      targeting: options.targeting
    }

    return this.createEvent(eventData)
  }

  // Post-roll template methods
  async createPostRollEvent(channelId: string, startTime: Date, options: {
    duration?: number
    adProvider?: string
    adCampaign?: string
    adCreative?: string
    targeting?: SCTE35EventData['targeting']
    userId?: string
  } = {}): Promise<any> {
    const eventId = `POSTROLL-${Date.now()}`
    
    const eventData: SCTE35EventData = {
      eventId,
      eventType: 'commercial_start',
      channelId,
      startTime,
      duration: options.duration || 30, // Default 30 seconds
      command: '', // Will be generated in createEvent
      description: `Post-roll advertisement - ${options.adProvider || 'Unknown Provider'}`,
      userId: options.userId,
      rollType: 'post-roll',
      adBreakId: `BREAK-${eventId}`,
      adProvider: options.adProvider,
      adCampaign: options.adCampaign,
      adCreative: options.adCreative,
      targeting: options.targeting
    }

    return this.createEvent(eventData)
  }

  // Mid-roll template methods
  async createMidRollEvent(channelId: string, startTime: Date, options: {
    duration?: number
    adProvider?: string
    adCampaign?: string
    adCreative?: string
    targeting?: SCTE35EventData['targeting']
    userId?: string
  } = {}): Promise<any> {
    const eventId = `MIDROLL-${Date.now()}`
    
    const eventData: SCTE35EventData = {
      eventId,
      eventType: 'commercial_start',
      channelId,
      startTime,
      duration: options.duration || 60, // Default 60 seconds for mid-roll
      command: '', // Will be generated in createEvent
      description: `Mid-roll advertisement - ${options.adProvider || 'Unknown Provider'}`,
      userId: options.userId,
      rollType: 'mid-roll',
      adBreakId: `BREAK-${eventId}`,
      adProvider: options.adProvider,
      adCampaign: options.adCampaign,
      adCreative: options.adCreative,
      targeting: options.targeting
    }

    return this.createEvent(eventData)
  }

  // Template-based event creation
  async createEventFromTemplate(templateId: string, channelId: string, startTime: Date, options: {
    duration?: number
    adProvider?: string
    adCampaign?: string
    adCreative?: string
    targeting?: SCTE35EventData['targeting']
    userId?: string
    customParams?: Record<string, any>
  } = {}): Promise<any> {
    const templates = this.getAdBreakTemplates()
    const template = templates.find(t => t.id === templateId)
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const eventId = `${template.rollType.toUpperCase()}-${Date.now()}`
    
    const eventData: SCTE35EventData = {
      eventId,
      eventType: template.eventType,
      channelId,
      startTime,
      duration: options.duration || template.defaultDuration,
      command: '', // Will be generated in createEvent
      description: `${template.name} - ${options.adProvider || 'Unknown Provider'}`,
      userId: options.userId,
      rollType: template.rollType,
      adBreakId: `BREAK-${eventId}`,
      adProvider: options.adProvider,
      adCampaign: options.adCampaign,
      adCreative: options.adCreative,
      targeting: { ...template.defaultTargeting, ...options.targeting },
      constraints: template.constraints
    }

    return this.createEvent(eventData)
  }

  // Get ad break templates
  getAdBreakTemplates() {
    return [
      {
        id: 'pre-roll-standard',
        name: 'Standard Pre-roll',
        description: '30-second pre-roll advertisement before content',
        rollType: 'pre-roll' as const,
        eventType: 'commercial_start' as const,
        defaultDuration: 30,
        defaultTargeting: {
          demographics: ['all'],
          geography: ['all'],
          timeOfDay: ['all']
        },
        constraints: {
          maxDuration: 60,
          minDuration: 15,
          allowedPositions: ['content-start']
        }
      },
      {
        id: 'pre-roll-extended',
        name: 'Extended Pre-roll',
        description: '60-second extended pre-roll advertisement',
        rollType: 'pre-roll' as const,
        eventType: 'commercial_start' as const,
        defaultDuration: 60,
        defaultTargeting: {
          demographics: ['all'],
          geography: ['all'],
          timeOfDay: ['prime-time']
        },
        constraints: {
          maxDuration: 120,
          minDuration: 45,
          allowedPositions: ['content-start']
        }
      },
      {
        id: 'post-roll-standard',
        name: 'Standard Post-roll',
        description: '30-second post-roll advertisement after content',
        rollType: 'post-roll' as const,
        eventType: 'commercial_start' as const,
        defaultDuration: 30,
        defaultTargeting: {
          demographics: ['all'],
          geography: ['all'],
          timeOfDay: ['all']
        },
        constraints: {
          maxDuration: 60,
          minDuration: 15,
          allowedPositions: ['content-end']
        }
      },
      {
        id: 'post-roll-extended',
        name: 'Extended Post-roll',
        description: '60-second extended post-roll advertisement',
        rollType: 'post-roll' as const,
        eventType: 'commercial_start' as const,
        defaultDuration: 60,
        defaultTargeting: {
          demographics: ['all'],
          geography: ['all'],
          timeOfDay: ['prime-time']
        },
        constraints: {
          maxDuration: 120,
          minDuration: 45,
          allowedPositions: ['content-end']
        }
      },
      {
        id: 'mid-roll-standard',
        name: 'Standard Mid-roll',
        description: '60-second mid-roll advertisement during content',
        rollType: 'mid-roll' as const,
        eventType: 'commercial_start' as const,
        defaultDuration: 60,
        defaultTargeting: {
          demographics: ['all'],
          geography: ['all'],
          timeOfDay: ['all']
        },
        constraints: {
          maxDuration: 120,
          minDuration: 30,
          allowedPositions: ['content-middle']
        }
      },
      {
        id: 'mid-roll-pod',
        name: 'Mid-roll Pod',
        description: '120-second mid-roll pod with multiple ads',
        rollType: 'mid-roll' as const,
        eventType: 'break_start' as const,
        defaultDuration: 120,
        defaultTargeting: {
          demographics: ['all'],
          geography: ['all'],
          timeOfDay: ['prime-time']
        },
        constraints: {
          maxDuration: 180,
          minDuration: 90,
          allowedPositions: ['content-middle']
        }
      },
      {
        id: 'sponsorship-bumper',
        name: 'Sponsorship Bumper',
        description: '15-second sponsorship bumper pre/post content',
        rollType: 'pre-roll' as const,
        eventType: 'provider_ad_start' as const,
        defaultDuration: 15,
        defaultTargeting: {
          demographics: ['all'],
          geography: ['all'],
          content: ['sponsored']
        },
        constraints: {
          maxDuration: 30,
          minDuration: 10,
          allowedPositions: ['content-start', 'content-end']
        }
      }
    ]
  }

  // Get events by roll type
  async getEventsByRollType(channelId: string, rollType: 'pre-roll' | 'post-roll' | 'mid-roll'): Promise<any[]> {
    try {
      // Note: This would need to be added to the database schema
      // For now, we'll filter from all events
      const events = await this.getRecentEvents(channelId, 100)
      
      return events.filter(event => {
        // This would normally come from the database, but we'll check the description for now
        if (rollType === 'pre-roll') {
          return event.description?.toLowerCase().includes('pre-roll')
        } else if (rollType === 'post-roll') {
          return event.description?.toLowerCase().includes('post-roll')
        } else if (rollType === 'mid-roll') {
          return event.description?.toLowerCase().includes('mid-roll')
        }
        return false
      })
    } catch (error) {
      console.error(`Error getting ${rollType} events:`, error)
      throw error
    }
  }

  // Schedule recurring ad breaks
  async scheduleRecurringAdBreaks(channelId: string, options: {
    rollType: 'pre-roll' | 'post-roll' | 'mid-roll'
    interval: number // in minutes
    duration: number
    adProvider?: string
    adCampaign?: string
    startTime?: Date
    endTime?: Date
    userId?: string
  }): Promise<any[]> {
    const events = []
    const startTime = options.startTime || new Date()
    const endTime = options.endTime || new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    const intervalMs = options.interval * 60 * 1000

    let currentTime = new Date(startTime)
    
    while (currentTime <= endTime) {
      let event
      if (options.rollType === 'pre-roll') {
        event = await this.createPreRollEvent(channelId, new Date(currentTime), {
          duration: options.duration,
          adProvider: options.adProvider,
          adCampaign: options.adCampaign,
          userId: options.userId
        })
      } else if (options.rollType === 'post-roll') {
        event = await this.createPostRollEvent(channelId, new Date(currentTime), {
          duration: options.duration,
          adProvider: options.adProvider,
          adCampaign: options.adCampaign,
          userId: options.userId
        })
      } else {
        event = await this.createMidRollEvent(channelId, new Date(currentTime), {
          duration: options.duration,
          adProvider: options.adProvider,
          adCampaign: options.adCampaign,
          userId: options.userId
        })
      }
      
      events.push(event)
      currentTime = new Date(currentTime.getTime() + intervalMs)
    }

    return events
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