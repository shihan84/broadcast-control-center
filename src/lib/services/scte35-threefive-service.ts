import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'

export interface SCTE35Cue {
  type: string
  event_id?: number
  pts?: number
  splice_time?: number
  auto_return?: boolean
  break_duration?: number
  descriptors?: SCTE35Descriptor[]
  upids?: SCTE35Upid[]
}

export interface SCTE35Descriptor {
  type: string
  tag?: number
  segmentation_type_id?: number
  segmentation_type_name?: string
  segment_num?: number
  segments_expected?: number
}

export interface SCTE35Upid {
  format?: number
  data?: string
}

export interface SpliceInsertOptions {
  start_time?: number
  duration?: number
  auto_return?: boolean
  event_id?: number
  upids?: SCTE35Upid[]
}

export class SCTE35ThreeFiveService extends EventEmitter {
  private static instance: SCTE35ThreeFiveService
  private pythonProcess: ChildProcess | null = null
  private available: boolean = false
  private pythonPath: string = 'python3'

  private constructor() {
    super()
    this.initializeService()
  }

  static getInstance(): SCTE35ThreeFiveService {
    if (!SCTE35ThreeFiveService.instance) {
      SCTE35ThreeFiveService.instance = new SCTE35ThreeFiveService()
    }
    return SCTE35ThreeFiveService.instance
  }

  private async initializeService() {
    try {
      // Check if Python is available
      await this.checkPythonAvailability()
      
      // Check if threefive is available
      await this.checkThreeFiveAvailability()
      
      if (this.available) {
        console.log('SCTE-35 ThreeFive service initialized successfully')
      } else {
        console.warn('SCTE-35 ThreeFive service not available - will use fallback mode')
      }
    } catch (error) {
      console.error('Error initializing SCTE-35 ThreeFive service:', error)
      this.available = false
    }
  }

  private async checkPythonAvailability(): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, ['--version'])
      
      process.on('exit', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Python not available (exit code: ${code})`))
        }
      })
      
      process.on('error', (error) => {
        reject(new Error(`Python not available: ${error.message}`))
      })
    })
  }

  private async checkThreeFiveAvailability(): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, ['-c', 'import threefive; print(threefive.__version__)'])
      
      let output = ''
      process.stdout?.on('data', (data) => {
        output += data.toString()
      })
      
      process.on('exit', (code) => {
        if (code === 0) {
          console.log(`threefive available, version: ${output.trim()}`)
          this.available = true
          resolve()
        } else {
          console.warn('threefive not available')
          this.available = false
          resolve()
        }
      })
      
      process.on('error', (error) => {
        console.warn('threefive not available:', error.message)
        this.available = false
        resolve()
      })
    })
  }

  isAvailable(): boolean {
    return this.available
  }

  async parseFromMpegts(mpegtsData: Buffer): Promise<SCTE35Cue[]> {
    if (!this.available) {
      throw new Error('SCTE-35 ThreeFive service not available')
    }

    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, [
        '-c',
        `
import sys
sys.path.insert(0, '${__dirname}')
from scte35_python_service import SCTE35Service
import base64
import json

service = SCTE35Service()
data = sys.stdin.buffer.read()
cues = service.parse_from_mpegts(data)
print(json.dumps(cues))
        `
      ])

      let output = ''
      let error = ''

      process.stdout?.on('data', (data) => {
        output += data.toString()
      })

      process.stderr?.on('data', (data) => {
        error += data.toString()
      })

      process.on('exit', (code) => {
        if (code === 0) {
          try {
            const cues = JSON.parse(output)
            resolve(cues)
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${parseError.message}`))
          }
        } else {
          reject(new Error(`Python process failed with code ${code}: ${error}`))
        }
      })

      process.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`))
      })

      process.stdin?.write(mpegtsData)
      process.stdin?.end()
    })
  }

  async parseFromBytes(data: Buffer): Promise<SCTE35Cue | null> {
    if (!this.available) {
      throw new Error('SCTE-35 ThreeFive service not available')
    }

    return new Promise((resolve, reject) => {
      const base64Data = data.toString('base64')
      
      const process = spawn(this.pythonPath, [
        '-c',
        `
import sys
sys.path.insert(0, '${__dirname}')
from scte35_python_service import SCTE35Service
import json

service = SCTE35Service()
result = service.parse_from_base64('${base64Data}')
print(json.dumps(result))
        `
      ])

      let output = ''
      let error = ''

      process.stdout?.on('data', (data) => {
        output += data.toString()
      })

      process.stderr?.on('data', (data) => {
        error += data.toString()
      })

      process.on('exit', (code) => {
        if (code === 0) {
          try {
            const cue = JSON.parse(output)
            resolve(cue)
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${parseError.message}`))
          }
        } else {
          reject(new Error(`Python process failed with code ${code}: ${error}`))
        }
      })

      process.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`))
      })
    })
  }

  async createSpliceInsert(options: SpliceInsertOptions = {}): Promise<string> {
    if (!this.available) {
      throw new Error('SCTE-35 ThreeFive service not available')
    }

    return new Promise((resolve, reject) => {
      const optionsJson = JSON.stringify(options)
      
      const process = spawn(this.pythonPath, [
        '-c',
        `
import sys
sys.path.insert(0, '${__dirname}')
from scte35_python_service import SCTE35Service
import json

service = SCTE35Service()
options = json.loads('${optionsJson.replace(/'/g, "\\'")}')
result = service.create_splice_insert(
    start_time=options.get('start_time'),
    duration=options.get('duration'),
    auto_return=options.get('auto_return', True),
    event_id=options.get('event_id'),
    upids=options.get('upids')
)
print(result)
        `
      ])

      let output = ''
      let error = ''

      process.stdout?.on('data', (data) => {
        output += data.toString()
      })

      process.stderr?.on('data', (data) => {
        error += data.toString()
      })

      process.on('exit', (code) => {
        if (code === 0) {
          resolve(output.trim())
        } else {
          reject(new Error(`Python process failed with code ${code}: ${error}`))
        }
      })

      process.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`))
      })
    })
  }

  async createTimeSignal(pts: number, eventId?: number): Promise<string> {
    if (!this.available) {
      throw new Error('SCTE-35 ThreeFive service not available')
    }

    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, [
        '-c',
        `
import sys
sys.path.insert(0, '${__dirname}')
from scte35_python_service import SCTE35Service

service = SCTE35Service()
result = service.create_time_signal(${pts}, ${eventId || 'None'})
print(result)
        `
      ])

      let output = ''
      let error = ''

      process.stdout?.on('data', (data) => {
        output += data.toString()
      })

      process.stderr?.on('data', (data) => {
        error += data.toString()
      })

      process.on('exit', (code) => {
        if (code === 0) {
          resolve(output.trim())
        } else {
          reject(new Error(`Python process failed with code ${code}: ${error}`))
        }
      })

      process.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`))
      })
    })
  }

  async createSegmentationDescriptor(
    segmentationTypeId: number,
    segmentNum: number = 0,
    segmentsExpected: number = 0,
    subSegmentNum: number = 0,
    subSegmentsExpected: number = 0
  ): Promise<SCTE35Descriptor> {
    if (!this.available) {
      throw new Error('SCTE-35 ThreeFive service not available')
    }

    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, [
        '-c',
        `
import sys
sys.path.insert(0, '${__dirname}')
from scte35_python_service import SCTE35Service
import json

service = SCTE35Service()
result = service.create_segmentation_descriptor(
    segmentation_type_id=${segmentationTypeId},
    segment_num=${segmentNum},
    segments_expected=${segmentsExpected},
    sub_segment_num=${subSegmentNum},
    sub_segments_expected=${subSegmentsExpected}
)
print(json.dumps(result))
        `
      ])

      let output = ''
      let error = ''

      process.stdout?.on('data', (data) => {
        output += data.toString()
      })

      process.stderr?.on('data', (data) => {
        error += data.toString()
      })

      process.on('exit', (code) => {
        if (code === 0) {
          try {
            const descriptor = JSON.parse(output)
            resolve(descriptor)
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${parseError.message}`))
          }
        } else {
          reject(new Error(`Python process failed with code ${code}: ${error}`))
        }
      })

      process.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`))
      })
    })
  }

  async parseHlsManifest(manifestUrl: string): Promise<SCTE35Cue[]> {
    if (!this.available) {
      throw new Error('SCTE-35 ThreeFive service not available')
    }

    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, [
        '-c',
        `
import sys
sys.path.insert(0, '${__dirname}')
from scte35_python_service import SCTE35Service
import json

service = SCTE35Service()
cues = service.parse_hls_manifest('${manifestUrl.replace(/'/g, "\\'")}')
print(json.dumps(cues))
        `
      ])

      let output = ''
      let error = ''

      process.stdout?.on('data', (data) => {
        output += data.toString()
      })

      process.stderr?.on('data', (data) => {
        error += data.toString()
      })

      process.on('exit', (code) => {
        if (code === 0) {
          try {
            const cues = JSON.parse(output)
            resolve(cues)
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${parseError.message}`))
          }
        } else {
          reject(new Error(`Python process failed with code ${code}: ${error}`))
        }
      })

      process.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`))
      })
    })
  }

  getSegmentationTypeName(segmentationTypeId: number): string {
    const segmentationTypes: { [key: number]: string } = {
      0x00: "Restriction",
      0x01: "Provider Advertisement Opportunity",
      0x02: "Distributor Advertisement Opportunity",
      0x03: "Provider Placement Opportunity",
      0x04: "Distributor Placement Opportunity",
      0x06: "Provider Overlay Opportunity",
      0x07: "Distributor Overlay Opportunity",
      0x08: "Program Start",
      0x09: "Program End",
      0x0A: "Program Early Termination",
      0x0B: "Program Breakaway",
      0x0C: "Program Resumption",
      0x0D: "Program Runover Planned",
      0x0E: "Program Runover Unplanned",
      0x0F: "Program Overlap Start",
      0x10: "Program Blackout Override",
      0x11: "Program Start In Progress",
      0x12: "Chapter Start",
      0x13: "Chapter End",
      0x14: "Break Start",
      0x15: "Break End",
      0x16: "Provider Advertisement Start",
      0x17: "Provider Advertisement End",
      0x18: "Distributor Advertisement Start",
      0x19: "Distributor Advertisement End",
      0x1A: "Provider Placement Opportunity Start",
      0x1B: "Provider Placement Opportunity End",
      0x1C: "Distributor Placement Opportunity Start",
      0x1D: "Distributor Placement Opportunity End",
      0x1E: "Unscheduled Event Start",
      0x1F: "Unscheduled Event End",
      0x20: "Network Start",
      0x21: "Network End",
      0x22: "Provider Private",
      0x23: "Distributor Private",
      0x24: "Provider IAB Standard",
      0x25: "Distributor IAB Standard",
      0x30: "Content Identification",
      0x31: "Program Identification",
      0x32: "Intermission Start",
      0x33: "Intermission End",
      0x34: "Start of Content",
      0x35: "End of Content",
      0x36: "Provider Alternate Content Start",
      0x37: "Provider Alternate Content End",
      0x38: "Distributor Alternate Content Start",
      0x39: "Distributor Alternate Content End",
      0x3A: "Provider Emergency Alert Start",
      0x3B: "Provider Emergency Alert End",
      0x3C: "Distributor Emergency Alert Start",
      0x3D: "Distributor Emergency Alert End"
    }

    return segmentationTypes[segmentationTypeId] || `Unknown Type (0x${segmentationTypeId.toString(16).toUpperCase()})`
  }

  getServiceStatus(): {
    available: boolean
    pythonAvailable: boolean
    threefiveAvailable: boolean
    pythonPath: string
  } {
    return {
      available: this.available,
      pythonAvailable: true, // We'd check this in a real implementation
      threefiveAvailable: this.available,
      pythonPath: this.pythonPath
    }
  }
}