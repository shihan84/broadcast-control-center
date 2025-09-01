import { db } from '@/lib/db'
import { StreamingService } from './streaming-service'
import { ConfigurationService } from './configuration-service'
import { SCTE35Service } from './scte35-service'

export interface DeploymentConfig {
  name: string
  description?: string
  channelId: string
  configId: string
  autoStart?: boolean
  healthChecks?: boolean
  monitoring?: boolean
  alerts?: boolean
  rollbackOnFailure?: boolean
}

export interface DeploymentStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startTime?: Date
  endTime?: Date
  error?: string
  duration?: number
}

export interface Deployment {
  id: string
  name: string
  description?: string
  channelId: string
  configId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back'
  steps: DeploymentStep[]
  startTime?: Date
  endTime?: Date
  error?: string
  autoStart: boolean
  healthChecks: boolean
  monitoring: boolean
  alerts: boolean
  rollbackOnFailure: boolean
  createdAt: Date
  updatedAt: Date
}

export class DeploymentService {
  private static instance: DeploymentService
  private streamingService: StreamingService
  private configService: ConfigurationService
  private scte35Service: SCTE35Service
  private activeDeployments: Map<string, Deployment> = new Map()

  private constructor() {
    this.streamingService = StreamingService.getInstance()
    this.configService = ConfigurationService.getInstance()
    this.scte35Service = SCTE35Service.getInstance()
  }

  static getInstance(): DeploymentService {
    if (!DeploymentService.instance) {
      DeploymentService.instance = new DeploymentService()
    }
    return DeploymentService.instance
  }

  async createDeployment(deploymentConfig: DeploymentConfig) {
    try {
      // Validate configuration exists
      const config = await this.configService.getConfiguration(deploymentConfig.configId)
      if (!config) {
        throw new Error('Configuration not found')
      }

      // Validate channel exists
      const channel = await db.broadcastChannel.findUnique({
        where: { id: deploymentConfig.channelId }
      })
      if (!channel) {
        throw new Error('Channel not found')
      }

      const deployment: Deployment = {
        id: `deploy-${Date.now()}`,
        name: deploymentConfig.name,
        description: deploymentConfig.description,
        channelId: deploymentConfig.channelId,
        configId: deploymentConfig.configId,
        status: 'pending',
        steps: this.generateDeploymentSteps(),
        autoStart: deploymentConfig.autoStart || false,
        healthChecks: deploymentConfig.healthChecks !== false,
        monitoring: deploymentConfig.monitoring !== false,
        alerts: deploymentConfig.alerts !== false,
        rollbackOnFailure: deploymentConfig.rollbackOnFailure !== false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Store deployment in memory (in production, this would be in the database)
      this.activeDeployments.set(deployment.id, deployment)

      if (deployment.autoStart) {
        // Start deployment asynchronously
        this.executeDeployment(deployment.id).catch(error => {
          console.error('Auto-start deployment failed:', error)
        })
      }

      return deployment
    } catch (error) {
      console.error('Error creating deployment:', error)
      throw error
    }
  }

  async executeDeployment(deploymentId: string) {
    try {
      const deployment = this.activeDeployments.get(deploymentId)
      if (!deployment) {
        throw new Error('Deployment not found')
      }

      deployment.status = 'running'
      deployment.startTime = new Date()
      deployment.updatedAt = new Date()

      for (const step of deployment.steps) {
        if (deployment.status === 'failed') {
          step.status = 'skipped'
          continue
        }

        try {
          step.status = 'running'
          step.startTime = new Date()
          deployment.updatedAt = new Date()

          await this.executeStep(step, deployment)

          step.status = 'completed'
          step.endTime = new Date()
          step.duration = step.endTime.getTime() - step.startTime.getTime()
          deployment.updatedAt = new Date()
        } catch (error) {
          step.status = 'failed'
          step.endTime = new Date()
          step.error = error instanceof Error ? error.message : 'Unknown error'
          step.duration = step.endTime.getTime() - (step.startTime?.getTime() || 0)
          deployment.updatedAt = new Date()

          if (deployment.rollbackOnFailure) {
            await this.rollbackDeployment(deploymentId)
            deployment.status = 'rolled_back'
          } else {
            deployment.status = 'failed'
            deployment.error = step.error
          }
          break
        }
      }

      if (deployment.status === 'running') {
        deployment.status = 'completed'
        deployment.endTime = new Date()
        deployment.updatedAt = new Date()
      }

      return deployment
    } catch (error) {
      console.error('Error executing deployment:', error)
      throw error
    }
  }

  private async executeStep(step: DeploymentStep, deployment: Deployment) {
    switch (step.id) {
      case 'validate-config':
        await this.validateConfigurationStep(deployment)
        break
      case 'stop-existing':
        await this.stopExistingStreamsStep(deployment)
        break
      case 'create-inputs':
        await this.createInputsStep(deployment)
        break
      case 'create-outputs':
        await this.createOutputsStep(deployment)
        break
      case 'start-inputs':
        await this.startInputsStep(deployment)
        break
      case 'start-outputs':
        await this.startOutputsStep(deployment)
        break
      case 'health-checks':
        await this.healthChecksStep(deployment)
        break
      case 'enable-monitoring':
        await this.enableMonitoringStep(deployment)
        break
      case 'setup-alerts':
        await this.setupAlertsStep(deployment)
        break
      default:
        throw new Error(`Unknown step: ${step.id}`)
    }
  }

  private async validateConfigurationStep(deployment: Deployment) {
    const config = await this.configService.getConfiguration(deployment.configId)
    const configData = JSON.parse(config.config)
    
    // Validate input configuration
    if (configData.input) {
      const isValid = this.streamingService.validateStreamUrl(configData.input.url, configData.input.type)
      if (!isValid) {
        throw new Error('Invalid input URL configuration')
      }
    }

    // Validate output configuration
    if (configData.output) {
      const isValid = this.streamingService.validateStreamUrl(configData.output.url, configData.output.type)
      if (!isValid) {
        throw new Error('Invalid output URL configuration')
      }
    }

    // Test connections
    if (configData.input) {
      const testResult = await this.streamingService.testStreamConnection(configData.input.url, configData.input.type)
      if (!testResult.success) {
        throw new Error(`Input connection test failed: ${testResult.message}`)
      }
    }

    if (configData.output) {
      const testResult = await this.streamingService.testStreamConnection(configData.output.url, configData.output.type)
      if (!testResult.success) {
        throw new Error(`Output connection test failed: ${testResult.message}`)
      }
    }
  }

  private async stopExistingStreamsStep(deployment: Deployment) {
    // Get existing streams for the channel
    const existingInputs = await db.streamInput.findMany({
      where: { channelId: deployment.channelId }
    })

    const existingOutputs = await db.streamOutput.findMany({
      where: { channelId: deployment.channelId }
    })

    // Stop existing inputs
    for (const input of existingInputs) {
      if (input.status === 'CONNECTED') {
        await this.streamingService.stopStreamInput(input.id)
      }
    }

    // Stop existing outputs
    for (const output of existingOutputs) {
      if (output.status === 'RUNNING') {
        await this.streamingService.stopStreamOutput(output.id)
      }
    }
  }

  private async createInputsStep(deployment: Deployment) {
    const config = await this.configService.getConfiguration(deployment.configId)
    const configData = JSON.parse(config.config)

    if (configData.input) {
      await this.streamingService.createStreamInput({
        name: `${deployment.name} Input`,
        type: configData.input.type,
        url: configData.input.url,
        channelId: deployment.channelId,
        config: configData.input
      })
    }
  }

  private async createOutputsStep(deployment: Deployment) {
    const config = await this.configService.getConfiguration(deployment.configId)
    const configData = JSON.parse(config.config)

    if (configData.output) {
      await this.streamingService.createStreamOutput({
        name: `${deployment.name} Output`,
        type: configData.output.type,
        url: configData.output.url,
        channelId: deployment.channelId,
        config: configData.output
      })
    }
  }

  private async startInputsStep(deployment: Deployment) {
    const inputs = await db.streamInput.findMany({
      where: { channelId: deployment.channelId }
    })

    for (const input of inputs) {
      await this.streamingService.startStreamInput(input.id)
    }
  }

  private async startOutputsStep(deployment: Deployment) {
    const outputs = await db.streamOutput.findMany({
      where: { channelId: deployment.channelId }
    })

    for (const output of outputs) {
      await this.streamingService.startStreamOutput(output.id)
    }
  }

  private async healthChecksStep(deployment: Deployment) {
    if (!deployment.healthChecks) {
      return
    }

    const inputs = await db.streamInput.findMany({
      where: { channelId: deployment.channelId, status: 'CONNECTED' }
    })

    const outputs = await db.streamOutput.findMany({
      where: { channelId: deployment.channelId, status: 'RUNNING' }
    })

    // Check input health
    for (const input of inputs) {
      const metrics = await this.streamingService.getStreamMetrics(input.id)
      
      if (metrics.latency > 5000) { // 5 seconds threshold
        throw new Error(`Input ${input.name} has high latency: ${metrics.latency}ms`)
      }

      if (metrics.droppedFrames > 50) { // 50 frames threshold
        throw new Error(`Input ${input.name} has high dropped frames: ${metrics.droppedFrames}`)
      }
    }

    // Check output health
    for (const output of outputs) {
      const metrics = await this.streamingService.getStreamMetrics(output.id)
      
      if (metrics.latency > 5000) { // 5 seconds threshold
        throw new Error(`Output ${output.name} has high latency: ${metrics.latency}ms`)
      }

      if (metrics.droppedFrames > 50) { // 50 frames threshold
        throw new Error(`Output ${output.name} has high dropped frames: ${metrics.droppedFrames}`)
      }
    }
  }

  private async enableMonitoringStep(deployment: Deployment) {
    if (!deployment.monitoring) {
      return
    }

    const config = await this.configService.getConfiguration(deployment.configId)
    const configData = JSON.parse(config.config)

    if (configData.monitoring?.enabled) {
      // Enable monitoring for the channel
      console.log(`Enabling monitoring for channel ${deployment.channelId}`)
      
      // In a real implementation, this would set up monitoring agents,
      // configure alert thresholds, and start collecting metrics
    }
  }

  private async setupAlertsStep(deployment: Deployment) {
    if (!deployment.alerts) {
      return
    }

    const config = await this.configService.getConfiguration(deployment.configId)
    const configData = JSON.parse(config.config)

    if (configData.monitoring?.alertThresholds) {
      // Set up alerts based on configuration
      console.log(`Setting up alerts for channel ${deployment.channelId}`)
      
      // In a real implementation, this would configure alerting systems,
      // set up notification channels, and define alert rules
    }
  }

  private async rollbackDeployment(deploymentId: string) {
    try {
      const deployment = this.activeDeployments.get(deploymentId)
      if (!deployment) {
        throw new Error('Deployment not found')
      }

      console.log(`Rolling back deployment ${deploymentId}`)

      // Stop all streams
      await this.stopExistingStreamsStep(deployment)

      // In a real implementation, this would restore the previous configuration
      // and restart the streams with the old settings

      console.log(`Rollback completed for deployment ${deploymentId}`)
    } catch (error) {
      console.error('Error during rollback:', error)
      throw error
    }
  }

  private generateDeploymentSteps(): DeploymentStep[] {
    return [
      {
        id: 'validate-config',
        name: 'Validate Configuration',
        status: 'pending'
      },
      {
        id: 'stop-existing',
        name: 'Stop Existing Streams',
        status: 'pending'
      },
      {
        id: 'create-inputs',
        name: 'Create Input Streams',
        status: 'pending'
      },
      {
        id: 'create-outputs',
        name: 'Create Output Streams',
        status: 'pending'
      },
      {
        id: 'start-inputs',
        name: 'Start Input Streams',
        status: 'pending'
      },
      {
        id: 'start-outputs',
        name: 'Start Output Streams',
        status: 'pending'
      },
      {
        id: 'health-checks',
        name: 'Health Checks',
        status: 'pending'
      },
      {
        id: 'enable-monitoring',
        name: 'Enable Monitoring',
        status: 'pending'
      },
      {
        id: 'setup-alerts',
        name: 'Setup Alerts',
        status: 'pending'
      }
    ]
  }

  async getDeployment(deploymentId: string) {
    return this.activeDeployments.get(deploymentId)
  }

  async getDeployments(channelId?: string) {
    const deployments = Array.from(this.activeDeployments.values())
    
    if (channelId) {
      return deployments.filter(d => d.channelId === channelId)
    }
    
    return deployments
  }

  async cancelDeployment(deploymentId: string) {
    try {
      const deployment = this.activeDeployments.get(deploymentId)
      if (!deployment) {
        throw new Error('Deployment not found')
      }

      if (deployment.status === 'completed' || deployment.status === 'failed') {
        throw new Error('Cannot cancel completed or failed deployment')
      }

      deployment.status = 'failed'
      deployment.error = 'Deployment cancelled by user'
      deployment.endTime = new Date()
      deployment.updatedAt = new Date()

      // Perform rollback if enabled
      if (deployment.rollbackOnFailure) {
        await this.rollbackDeployment(deploymentId)
        deployment.status = 'rolled_back'
      }

      return deployment
    } catch (error) {
      console.error('Error cancelling deployment:', error)
      throw error
    }
  }

  async getDeploymentTemplates() {
    return [
      {
        id: 'quick-deploy',
        name: 'Quick Deploy',
        description: 'Basic deployment with minimal configuration',
        autoStart: true,
        healthChecks: true,
        monitoring: true,
        alerts: false,
        rollbackOnFailure: true
      },
      {
        id: 'production-deploy',
        name: 'Production Deploy',
        description: 'Full production deployment with all safety checks',
        autoStart: false,
        healthChecks: true,
        monitoring: true,
        alerts: true,
        rollbackOnFailure: true
      },
      {
        id: 'testing-deploy',
        name: 'Testing Deploy',
        description: 'Deployment for testing environments',
        autoStart: true,
        healthChecks: false,
        monitoring: true,
        alerts: false,
        rollbackOnFailure: false
      }
    ]
  }
}