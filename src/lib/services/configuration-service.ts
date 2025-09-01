import { db } from '@/lib/db'

export interface StreamConfiguration {
  id?: string
  name: string
  config: {
    input?: {
      type: 'HLS' | 'RTMP' | 'SRT'
      url: string
      bufferSize?: number
      latency?: number
      redundancy?: number
    }
    output?: {
      type: 'HLS' | 'DASH' | 'SRT'
      url: string
      bitrate?: number
      resolution?: string
      framerate?: number
      codec?: string
      keyFrameInterval?: number
    }
    transcoding?: {
      enabled: boolean
      profile?: string
      preset?: string
      tune?: string
    }
    scte35?: {
      enabled: boolean
      passthrough: boolean
      insertEvents: boolean
    }
    monitoring?: {
      enabled: boolean
      metrics: string[]
      alertThresholds: {
        cpu?: number
        memory?: number
        network?: number
        bitrate?: number
        latency?: number
      }
    }
  }
  isActive?: boolean
  userId: string
}

export class ConfigurationService {
  private static instance: ConfigurationService

  private constructor() {}

  static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService()
    }
    return ConfigurationService.instance
  }

  async createConfiguration(configData: StreamConfiguration) {
    try {
      const config = await db.streamConfig.create({
        data: {
          name: configData.name,
          config: JSON.stringify(configData.config),
          isActive: configData.isActive || false,
          userId: configData.userId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return config
    } catch (error) {
      console.error('Error creating configuration:', error)
      throw error
    }
  }

  async getConfigurations(userId?: string) {
    try {
      const where: any = {}
      if (userId) where.userId = userId

      const configs = await db.streamConfig.findMany({
        where,
        include: {
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

      return configs
    } catch (error) {
      console.error('Error fetching configurations:', error)
      throw error
    }
  }

  async getConfiguration(id: string) {
    try {
      const config = await db.streamConfig.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      if (!config) {
        throw new Error('Configuration not found')
      }

      return config
    } catch (error) {
      console.error('Error fetching configuration:', error)
      throw error
    }
  }

  async updateConfiguration(id: string, configData: Partial<StreamConfiguration>) {
    try {
      const existingConfig = await db.streamConfig.findUnique({
        where: { id }
      })

      if (!existingConfig) {
        throw new Error('Configuration not found')
      }

      let updatedConfig = { ...configData.config }
      
      // If config is provided, merge with existing config
      if (configData.config) {
        const existingConfigData = JSON.parse(existingConfig.config)
        updatedConfig = { ...existingConfigData, ...configData.config }
      }

      const config = await db.streamConfig.update({
        where: { id },
        data: {
          name: configData.name || existingConfig.name,
          config: JSON.stringify(updatedConfig),
          isActive: configData.isActive !== undefined ? configData.isActive : existingConfig.isActive
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return config
    } catch (error) {
      console.error('Error updating configuration:', error)
      throw error
    }
  }

  async deleteConfiguration(id: string) {
    try {
      const config = await db.streamConfig.delete({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return config
    } catch (error) {
      console.error('Error deleting configuration:', error)
      throw error
    }
  }

  async setActiveConfiguration(id: string, userId: string) {
    try {
      // Deactivate all other configurations for this user
      await db.streamConfig.updateMany({
        where: { userId },
        data: { isActive: false }
      })

      // Activate the specified configuration
      const config = await db.streamConfig.update({
        where: { id },
        data: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return config
    } catch (error) {
      console.error('Error setting active configuration:', error)
      throw error
    }
  }

  async getActiveConfiguration(userId: string) {
    try {
      const config = await db.streamConfig.findFirst({
        where: { 
          userId,
          isActive: true 
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return config
    } catch (error) {
      console.error('Error fetching active configuration:', error)
      throw error
    }
  }

  validateConfiguration(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.name || config.name.trim() === '') {
      errors.push('Configuration name is required')
    }

    if (!config.config || typeof config.config !== 'object') {
      errors.push('Configuration data is required')
      return { isValid: false, errors }
    }

    const { input, output } = config.config

    if (input) {
      if (!input.type || !['HLS', 'RTMP', 'SRT'].includes(input.type)) {
        errors.push('Valid input type is required (HLS, RTMP, SRT)')
      }

      if (!input.url || input.url.trim() === '') {
        errors.push('Input URL is required')
      }

      try {
        new URL(input.url)
      } catch {
        errors.push('Invalid input URL format')
      }
    }

    if (output) {
      if (!output.type || !['HLS', 'DASH', 'SRT'].includes(output.type)) {
        errors.push('Valid output type is required (HLS, DASH, SRT)')
      }

      if (!output.url || output.url.trim() === '') {
        errors.push('Output URL is required')
      }

      try {
        new URL(output.url)
      } catch {
        errors.push('Invalid output URL format')
      }
    }

    if (!input && !output) {
      errors.push('At least input or output configuration is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  async duplicateConfiguration(id: string, newName: string, userId: string) {
    try {
      const originalConfig = await db.streamConfig.findUnique({
        where: { id }
      })

      if (!originalConfig) {
        throw new Error('Configuration not found')
      }

      const config = await db.streamConfig.create({
        data: {
          name: newName,
          config: originalConfig.config,
          isActive: false,
          userId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return config
    } catch (error) {
      console.error('Error duplicating configuration:', error)
      throw error
    }
  }

  async exportConfiguration(id: string) {
    try {
      const config = await db.streamConfig.findUnique({
        where: { id }
      })

      if (!config) {
        throw new Error('Configuration not found')
      }

      const exportData = {
        name: config.name,
        config: JSON.parse(config.config),
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Error exporting configuration:', error)
      throw error
    }
  }

  async importConfiguration(configJson: string, userId: string) {
    try {
      const importData = JSON.parse(configJson)
      
      const config = await this.createConfiguration({
        name: `${importData.name} (Imported)`,
        config: importData.config,
        userId
      })

      return config
    } catch (error) {
      console.error('Error importing configuration:', error)
      throw error
    }
  }

  async getConfigurationTemplates() {
    try {
      const templates = [
        {
          id: 'basic-hls',
          name: 'Basic HLS Streaming',
          description: 'Simple HLS input to HLS output configuration',
          config: {
            input: {
              type: 'HLS',
              url: '',
              bufferSize: 1024,
              latency: 2000
            },
            output: {
              type: 'HLS',
              url: '',
              bitrate: 8000,
              resolution: '1920x1080',
              framerate: 30,
              codec: 'h264',
              keyFrameInterval: 2
            },
            transcoding: {
              enabled: true,
              profile: 'high',
              preset: 'fast',
              tune: 'zerolatency'
            },
            scte35: {
              enabled: true,
              passthrough: true,
              insertEvents: false
            },
            monitoring: {
              enabled: true,
              metrics: ['BITRATE', 'FRAMERATE', 'LATENCY', 'DROPPED_FRAMES'],
              alertThresholds: {
                cpu: 80,
                memory: 85,
                network: 90,
                bitrate: 10000,
                latency: 3000
              }
            }
          }
        },
        {
          id: 'rtmp-srt',
          name: 'RTMP to SRT Gateway',
          description: 'RTMP input with SRT output for low-latency streaming',
          config: {
            input: {
              type: 'RTMP',
              url: '',
              bufferSize: 512,
              latency: 1000,
              redundancy: 1
            },
            output: {
              type: 'SRT',
              url: '',
              bitrate: 6000,
              resolution: '1280x720',
              framerate: 30,
              codec: 'h264',
              keyFrameInterval: 1
            },
            transcoding: {
              enabled: true,
              profile: 'main',
              preset: 'ultrafast',
              tune: 'zerolatency'
            },
            scte35: {
              enabled: true,
              passthrough: true,
              insertEvents: true
            },
            monitoring: {
              enabled: true,
              metrics: ['BITRATE', 'LATENCY', 'NETWORK_THROUGHPUT'],
              alertThresholds: {
                cpu: 75,
                memory: 80,
                network: 85,
                latency: 1500
              }
            }
          }
        },
        {
          id: 'multi-bitrate',
          name: 'Multi-Bitrate HLS',
          description: 'Multiple bitrate outputs for adaptive streaming',
          config: {
            input: {
              type: 'HLS',
              url: '',
              bufferSize: 2048,
              latency: 3000
            },
            output: {
              type: 'HLS',
              url: '',
              bitrate: 12000,
              resolution: '1920x1080',
              framerate: 30,
              codec: 'h264',
              keyFrameInterval: 2
            },
            transcoding: {
              enabled: true,
              profile: 'high',
              preset: 'medium',
              tune: 'none'
            },
            scte35: {
              enabled: true,
              passthrough: true,
              insertEvents: true
            },
            monitoring: {
              enabled: true,
              metrics: ['BITRATE', 'FRAMERATE', 'RESOLUTION', 'CPU_USAGE', 'MEMORY_USAGE'],
              alertThresholds: {
                cpu: 85,
                memory: 90,
                network: 95,
                bitrate: 15000
              }
            }
          }
        }
      ]

      return templates
    } catch (error) {
      console.error('Error getting configuration templates:', error)
      throw error
    }
  }
}