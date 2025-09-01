import { NextRequest, NextResponse } from 'next/server'
import { SCTE35Service } from '@/lib/services/scte35-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const rollType = searchParams.get('rollType')

    // Return template definitions (in a real implementation, these would come from a database)
    const templates = [
      // Pre-roll Templates
      {
        id: 'preroll-std',
        name: 'Standard Pre-roll',
        category: 'pre-roll',
        rollType: 'pre-roll',
        eventType: 'commercial_start',
        duration: 30,
        command: '/PREROLL_STD/',
        description: '30-second standard pre-roll advertisement',
        provider: 'Standard Ad Network'
      },
      {
        id: 'preroll-ext',
        name: 'Extended Pre-roll',
        category: 'pre-roll',
        rollType: 'pre-roll',
        eventType: 'commercial_start',
        duration: 60,
        command: '/PREROLL_EXT/',
        description: '60-second extended pre-roll advertisement',
        provider: 'Premium Ad Network'
      },
      {
        id: 'preroll-prem',
        name: 'Premium Pre-roll',
        category: 'pre-roll',
        rollType: 'pre-roll',
        eventType: 'commercial_start',
        duration: 90,
        command: '/PREROLL_PREM/',
        description: '90-second premium pre-roll advertisement',
        provider: 'Premium Ad Network'
      },
      {
        id: 'sponsor-bumper',
        name: 'Sponsorship Bumper',
        category: 'pre-roll',
        rollType: 'pre-roll',
        eventType: 'provider_ad_start',
        duration: 15,
        command: '/SPONSOR_BUMPER/',
        description: '15-second sponsorship bumper pre-roll',
        provider: 'Sponsor Network'
      },
      
      // Post-roll Templates
      {
        id: 'postroll-std',
        name: 'Standard Post-roll',
        category: 'post-roll',
        rollType: 'post-roll',
        eventType: 'commercial_start',
        duration: 30,
        command: '/POSTROLL_STD/',
        description: '30-second standard post-roll advertisement',
        provider: 'Standard Ad Network'
      },
      {
        id: 'postroll-ext',
        name: 'Extended Post-roll',
        category: 'post-roll',
        rollType: 'post-roll',
        eventType: 'commercial_start',
        duration: 60,
        command: '/POSTROLL_EXT/',
        description: '60-second extended post-roll advertisement',
        provider: 'Premium Ad Network'
      },
      {
        id: 'postroll-prem',
        name: 'Premium Post-roll',
        category: 'post-roll',
        rollType: 'post-roll',
        eventType: 'commercial_start',
        duration: 90,
        command: '/POSTROLL_PREM/',
        description: '90-second premium post-roll advertisement',
        provider: 'Premium Ad Network'
      },
      {
        id: 'promo-postroll',
        name: 'Program Promo Post-roll',
        category: 'post-roll',
        rollType: 'post-roll',
        eventType: 'commercial_start',
        duration: 45,
        command: '/PROMO_POSTROLL/',
        description: '45-second program promotion post-roll',
        provider: 'Network Promo'
      },
      {
        id: 'cta-postroll',
        name: 'Call to Action Post-roll',
        category: 'post-roll',
        rollType: 'post-roll',
        eventType: 'provider_ad_start',
        duration: 30,
        command: '/CTA_POSTROLL/',
        description: '30-second call-to-action post-roll advertisement',
        provider: 'Direct Response'
      },
      
      // Mid-roll Templates
      {
        id: 'midroll-std',
        name: 'Standard Commercial Break',
        category: 'mid-roll',
        rollType: 'mid-roll',
        eventType: 'commercial_start',
        duration: 120,
        command: '/MIDROLL_STD/',
        description: 'Standard 2-minute mid-roll commercial break',
        provider: 'Standard Ad Network'
      },
      {
        id: 'midroll-short',
        name: 'Short Mid-roll',
        category: 'mid-roll',
        rollType: 'mid-roll',
        eventType: 'commercial_start',
        duration: 60,
        command: '/MIDROLL_SHORT/',
        description: '60-second short mid-roll break',
        provider: 'Standard Ad Network'
      },
      {
        id: 'midroll-pod',
        name: 'Extended Mid-roll Pod',
        category: 'mid-roll',
        rollType: 'mid-roll',
        eventType: 'break_start',
        duration: 180,
        command: '/MIDROLL_POD_EXT/',
        description: '3-minute extended mid-roll pod with multiple ads',
        provider: 'Podcast Network'
      },
      {
        id: 'midroll-provider',
        name: 'Provider Mid-roll',
        category: 'mid-roll',
        rollType: 'mid-roll',
        eventType: 'provider_ad_start',
        duration: 90,
        command: '/PROVIDER_MIDROLL/',
        description: '90-second provider-specific mid-roll advertisement',
        provider: 'Provider Network'
      }
    ]

    // Filter templates based on query parameters
    let filteredTemplates = templates
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category)
    }
    if (rollType) {
      filteredTemplates = filteredTemplates.filter(t => t.rollType === rollType)
    }

    return NextResponse.json(filteredTemplates)
  } catch (error) {
    console.error('Error fetching SCTE-35 templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SCTE-35 templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, channelId, startTime, customOptions } = body

    if (!templateId || !channelId || !startTime) {
      return NextResponse.json(
        { error: 'Template ID, channel ID, and start time are required' },
        { status: 400 }
      )
    }

    // Get template definitions
    const templates = [
      // Pre-roll Templates
      {
        id: 'preroll-std',
        name: 'Standard Pre-roll',
        category: 'pre-roll',
        rollType: 'pre-roll',
        eventType: 'commercial_start',
        duration: 30,
        command: '/PREROLL_STD/',
        description: '30-second standard pre-roll advertisement',
        provider: 'Standard Ad Network'
      },
      {
        id: 'preroll-ext',
        name: 'Extended Pre-roll',
        category: 'pre-roll',
        rollType: 'pre-roll',
        eventType: 'commercial_start',
        duration: 60,
        command: '/PREROLL_EXT/',
        description: '60-second extended pre-roll advertisement',
        provider: 'Premium Ad Network'
      },
      {
        id: 'postroll-std',
        name: 'Standard Post-roll',
        category: 'post-roll',
        rollType: 'post-roll',
        eventType: 'commercial_start',
        duration: 30,
        command: '/POSTROLL_STD/',
        description: '30-second standard post-roll advertisement',
        provider: 'Standard Ad Network'
      },
      {
        id: 'midroll-std',
        name: 'Standard Commercial Break',
        category: 'mid-roll',
        rollType: 'mid-roll',
        eventType: 'commercial_start',
        duration: 120,
        command: '/MIDROLL_STD/',
        description: 'Standard 2-minute mid-roll commercial break',
        provider: 'Standard Ad Network'
      }
    ]

    const template = templates.find(t => t.id === templateId)
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    const scte35Service = SCTE35Service.getInstance()
    
    // Create event based on template type
    let event
    switch (template.category) {
      case 'pre-roll':
        event = await scte35Service.createPreRollEvent(
          channelId,
          customOptions?.duration || template.duration,
          customOptions?.provider || template.provider,
          customOptions?.description || template.description
        )
        break
      case 'post-roll':
        event = await scte35Service.createPostRollEvent(
          channelId,
          customOptions?.duration || template.duration,
          customOptions?.provider || template.provider,
          customOptions?.description || template.description
        )
        break
      case 'mid-roll':
        event = await scte35Service.createMidRollEvent(
          channelId,
          customOptions?.duration || template.duration,
          customOptions?.provider || template.provider,
          customOptions?.description || template.description
        )
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported template category' },
          { status: 400 }
        )
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event from template:', error)
    return NextResponse.json(
      { error: 'Failed to create event from template' },
      { status: 500 }
    )
  }
}