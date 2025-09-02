import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'

interface TestPathRequest {
  path: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TestPathRequest
    const { path } = body

    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'FFmpeg path is required' },
        { status: 400 }
      )
    }

    // Test the FFmpeg path
    const isValid = await testFFmpegPath(path)

    return NextResponse.json({
      valid: isValid,
      path: path,
      message: isValid ? 'FFmpeg is accessible at the specified path' : 'FFmpeg is not accessible at the specified path'
    })
  } catch (error) {
    console.error('Error testing FFmpeg path:', error)
    return NextResponse.json(
      { 
        valid: false,
        error: 'Failed to test FFmpeg path',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function testFFmpegPath(path: string): Promise<boolean> {
  return new Promise((resolve) => {
    const process = spawn(path, ['-version'])
    
    let stdout = ''
    let stderr = ''

    process.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    process.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    process.on('close', (code) => {
      // FFmpeg typically returns code 0 for -version command
      resolve(code === 0)
    })

    process.on('error', () => {
      resolve(false)
    })

    // Set a timeout
    setTimeout(() => {
      process.kill('SIGTERM')
      resolve(false)
    }, 5000)
  })
}