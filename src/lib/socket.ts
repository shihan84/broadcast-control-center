import { Server } from 'socket.io'
import { StreamingService } from './services/streaming-service'
import { SCTE35Service } from './services/scte35-service'
import { db } from './db'

export const setupSocket = (io: Server) => {
  const streamingService = StreamingService.getInstance()
  const scte35Service = SCTE35Service.getInstance()

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)
    
    // Join channel-specific rooms
    socket.on('join-channel', (channelId: string) => {
      socket.join(`channel-${channelId}`)
      console.log(`Client ${socket.id} joined channel ${channelId}`)
    })

    // Leave channel-specific rooms
    socket.on('leave-channel', (channelId: string) => {
      socket.leave(`channel-${channelId}`)
      console.log(`Client ${socket.id} left channel ${channelId}`)
    })

    // Handle stream input control
    socket.on('start-input', async (inputId: string) => {
      try {
        await streamingService.startStreamInput(inputId)
        
        // Get updated input data
        const input = await db.streamInput.findUnique({
          where: { id: inputId },
          include: { channel: true }
        })
        
        // Broadcast to channel room
        if (input) {
          io.to(`channel-${input.channelId}`).emit('input-started', input)
        }
        
        socket.emit('input-started', { success: true, inputId })
      } catch (error) {
        socket.emit('input-error', { inputId, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    })

    socket.on('stop-input', async (inputId: string) => {
      try {
        await streamingService.stopStreamInput(inputId)
        
        // Get updated input data
        const input = await db.streamInput.findUnique({
          where: { id: inputId },
          include: { channel: true }
        })
        
        // Broadcast to channel room
        if (input) {
          io.to(`channel-${input.channelId}`).emit('input-stopped', input)
        }
        
        socket.emit('input-stopped', { success: true, inputId })
      } catch (error) {
        socket.emit('input-error', { inputId, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    })

    // Handle stream output control
    socket.on('start-output', async (outputId: string) => {
      try {
        await streamingService.startStreamOutput(outputId)
        
        // Get updated output data
        const output = await db.streamOutput.findUnique({
          where: { id: outputId },
          include: { channel: true }
        })
        
        // Broadcast to channel room
        if (output) {
          io.to(`channel-${output.channelId}`).emit('output-started', output)
        }
        
        socket.emit('output-started', { success: true, outputId })
      } catch (error) {
        socket.emit('output-error', { outputId, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    })

    socket.on('stop-output', async (outputId: string) => {
      try {
        await streamingService.stopStreamOutput(outputId)
        
        // Get updated output data
        const output = await db.streamOutput.findUnique({
          where: { id: outputId },
          include: { channel: true }
        })
        
        // Broadcast to channel room
        if (output) {
          io.to(`channel-${output.channelId}`).emit('output-stopped', output)
        }
        
        socket.emit('output-stopped', { success: true, outputId })
      } catch (error) {
        socket.emit('output-error', { outputId, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    })

    // Handle SCTE-35 events
    socket.on('create-scte35-event', async (eventData: any) => {
      try {
        const event = await scte35Service.createEvent(eventData)
        
        // Broadcast to channel room
        io.to(`channel-${event.channelId}`).emit('scte35-event-created', event)
        
        socket.emit('scte35-event-created', { success: true, event })
      } catch (error) {
        socket.emit('scte35-event-error', { error: error instanceof Error ? error.message : 'Unknown error' })
      }
    })

    socket.on('execute-scte35-event', async (eventId: string) => {
      try {
        const event = await scte35Service.executeEvent(eventId)
        
        // Broadcast to channel room
        io.to(`channel-${event.channelId}`).emit('scte35-event-executed', event)
        
        socket.emit('scte35-event-executed', { success: true, event })
      } catch (error) {
        socket.emit('scte35-event-error', { eventId, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    })

    // Handle monitoring data requests
    socket.on('request-metrics', async (data: { channelId?: string; metricType?: string }) => {
      try {
        const where: any = {}
        if (data.channelId) where.channelId = data.channelId
        if (data.metricType) where.metricType = data.metricType

        const metrics = await db.monitoringData.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          take: 100
        })

        socket.emit('metrics-data', metrics)
      } catch (error) {
        socket.emit('metrics-error', { error: error instanceof Error ? error.message : 'Unknown error' })
      }
    })

    // Handle real-time metrics subscription
    socket.on('subscribe-metrics', (channelId: string) => {
      socket.join(`metrics-${channelId}`)
      console.log(`Client ${socket.id} subscribed to metrics for channel ${channelId}`)
    })

    socket.on('unsubscribe-metrics', (channelId: string) => {
      socket.leave(`metrics-${channelId}`)
      console.log(`Client ${socket.id} unsubscribed from metrics for channel ${channelId}`)
    })

    // Handle system status requests
    socket.on('request-system-status', async () => {
      try {
        const channels = await db.broadcastChannel.findMany({
          include: {
            streamInputs: true,
            streamOutputs: true
          }
        })

        const activeStreams = await streamingService.getActiveStreams()
        const scheduledEvents = await scte35Service.getScheduledEvents()

        socket.emit('system-status', {
          channels,
          activeStreams,
          scheduledEvents,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        socket.emit('system-status-error', { error: error instanceof Error ? error.message : 'Unknown error' })
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Broadcast Control Center',
      timestamp: new Date().toISOString(),
      socketId: socket.id
    })
  })

  // Set up periodic metrics broadcast
  setInterval(async () => {
    try {
      // Get all channels with active streams
      const channels = await db.broadcastChannel.findMany({
        where: { status: 'ONLINE' },
        include: {
          streamInputs: {
            where: { status: 'CONNECTED' }
          },
          streamOutputs: {
            where: { status: 'RUNNING' }
          }
        }
      })

      for (const channel of channels) {
        // Generate and broadcast metrics for each active stream
        for (const input of channel.streamInputs) {
          try {
            const metrics = await streamingService.getStreamMetrics(input.id)
            io.to(`metrics-${channel.id}`).emit('stream-metrics', {
              streamId: input.id,
              type: 'input',
              metrics,
              timestamp: new Date().toISOString()
            })
          } catch (error) {
            console.error('Error getting input metrics:', error)
          }
        }

        for (const output of channel.streamOutputs) {
          try {
            const metrics = await streamingService.getStreamMetrics(output.id)
            io.to(`metrics-${channel.id}`).emit('stream-metrics', {
              streamId: output.id,
              type: 'output',
              metrics,
              timestamp: new Date().toISOString()
            })
          } catch (error) {
            console.error('Error getting output metrics:', error)
          }
        }

        // Generate system metrics
        const systemMetrics = {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          network: Math.random() * 100,
          disk: Math.random() * 100,
          timestamp: new Date().toISOString()
        }

        io.to(`metrics-${channel.id}`).emit('system-metrics', systemMetrics)
      }
    } catch (error) {
      console.error('Error broadcasting metrics:', error)
    }
  }, 2000) // Broadcast every 2 seconds
}