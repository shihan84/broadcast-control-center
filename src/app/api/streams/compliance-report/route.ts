import { NextRequest, NextResponse } from 'next/server'
import { StreamAnalysisService } from '@/lib/services/stream-analysis-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { streamUrl, format = 'json' } = body

    if (!streamUrl) {
      return NextResponse.json(
        { error: 'Stream URL is required' },
        { status: 400 }
      )
    }

    // Basic URL validation
    try {
      new URL(streamUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid stream URL format' },
        { status: 400 }
      )
    }

    const analysisService = StreamAnalysisService.getInstance()
    
    if (format === 'markdown') {
      const report = await analysisService.generateComplianceReport(streamUrl)
      
      return new NextResponse(report, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': 'attachment; filename="compliance-report.md"'
        }
      })
    } else {
      const validation = await analysisService.validateAgainstDistributorRequirements(streamUrl)
      const report = await analysisService.generateComplianceReport(streamUrl)
      
      return NextResponse.json({
        success: true,
        validation,
        report,
        message: 'Compliance report generated successfully'
      })
    }
  } catch (error) {
    console.error('Error generating compliance report:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate compliance report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}