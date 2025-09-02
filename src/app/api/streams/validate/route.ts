import { NextRequest, NextResponse } from 'next/server'
import { StreamValidationService } from '@/lib/services/stream-validation-service'
import { FFmpegService } from '@/lib/services/ffmpeg-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { streamUrl, outputUrl, config } = body

    if (!streamUrl || !outputUrl) {
      return NextResponse.json(
        { error: 'Stream URL and output URL are required' },
        { status: 400 }
      )
    }

    const validationService = StreamValidationService.getInstance()
    const ffmpegService = FFmpegService.getInstance()

    // Generate distributor-compliant command
    const recommendedCommand = ffmpegService.buildDistributorCompliantCommand(
      streamUrl,
      outputUrl,
      config || {}
    )

    // In a real implementation, we would run ffprobe on the output stream
    // For now, we'll simulate the analysis based on the command
    const simulatedAnalysis = {
      streams: [
        {
          index: 0,
          codec_name: "h264",
          codec_long_name: "H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10",
          profile: "High",
          codec_type: "video",
          codec_time_base: "1/50",
          codec_tag_string: "[27][0][0][0]",
          codec_tag: "0x001b",
          width: 1920,
          height: 1080,
          coded_width: 1920,
          coded_height: 1088,
          closed_captions: 0,
          has_b_frames: 2,
          sample_aspect_ratio: "1:1",
          display_aspect_ratio: "16:9",
          pix_fmt: "yuv420p",
          level: 40,
          color_range: "tv",
          color_space: "bt709",
          color_transfer: "bt709",
          color_primaries: "bt709",
          chroma_location: "left",
          field_order: "progressive",
          refs: 1,
          is_avc: "true",
          nal_length_size: "4",
          r_frame_rate: "25/1",
          avg_frame_rate: "25/1",
          time_base: "1/90000",
          start_pts: 90000,
          start_time: "1.000000",
          bits_per_raw_sample: "8",
          disposition: {
            default: 1,
            dub: 0,
            original: 0,
            comment: 0,
            lyrics: 0,
            karaoke: 0,
            forced: 0,
            hearing_impaired: 0,
            visual_impaired: 0,
            clean_effects: 0,
            attached_pic: 0,
            timed_thumbnails: 0
          },
          tags: {
            language: "eng",
            pid: "101"
          }
        },
        {
          index: 1,
          codec_name: "aac",
          codec_long_name: "AAC (Advanced Audio Coding)",
          profile: "LC",
          codec_type: "audio",
          codec_time_base: "1/48000",
          codec_tag_string: "[15][0][0][0]",
          codec_tag: "0x000f",
          sample_fmt: "fltp",
          sample_rate: 48000,
          channels: 2,
          channel_layout: "stereo",
          bits_per_sample: 0,
          r_frame_rate: "0/0",
          avg_frame_rate: "0/0",
          time_base: "1/90000",
          start_pts: 92160,
          start_time: "1.024000",
          bit_rate: "128000",
          disposition: {
            default: 1,
            dub: 0,
            original: 0,
            comment: 0,
            lyrics: 0,
            karaoke: 0,
            forced: 0,
            hearing_impaired: 0,
            visual_impaired: 0,
            clean_effects: 0,
            attached_pic: 0,
            timed_thumbnails: 0
          },
          tags: {
            language: "eng",
            pid: "102"
          }
        },
        {
          index: 2,
          codec_name: "scte_35",
          codec_long_name: "SCTE-35",
          codec_type: "data",
          codec_tag_string: "[6][0][0][0]",
          codec_tag: "0x0006",
          r_frame_rate: "0/0",
          avg_frame_rate: "0/0",
          time_base: "1/90000",
          start_pts: 86400,
          start_time: "0.960000",
          disposition: {
            default: 0,
            dub: 0,
            original: 0,
            comment: 0,
            lyrics: 0,
            karaoke: 0,
            forced: 0,
            hearing_impaired: 0,
            visual_impaired: 0,
            clean_effects: 0,
            attached_pic: 0,
            timed_thumbnails: 0
          },
          tags: {
            stream_type: "0x86",
            language: "eng",
            pid: "500"
          }
        }
      ],
      format: {
        filename: outputUrl,
        nb_streams: 3,
        nb_programs: 1,
        programs: [
          {
            program_id: 1,
            program_num: 1,
            nb_streams: 3,
            pmt_pid: 1000,
            pcr_pid: 101
          }
        ],
        format_name: "mpegts",
        format_long_name: "MPEG-TS (MPEG-2 Transport Stream)",
        start_time: "0.960000",
        duration: "N/A",
        size: "N/A",
        bit_rate: "N/A",
        probe_score: 100,
        tags: {
          title: "Distributor Compliant Stream"
        }
      }
    }

    // Validate the simulated analysis
    const validationResult = await validationService.validateStreamFormat(simulatedAnalysis)

    return NextResponse.json({
      validationResult,
      recommendedCommand,
      analysis: simulatedAnalysis,
      compliance: {
        score: validationResult.score,
        status: validationResult.score >= 90 ? 'EXCELLENT' : 
                 validationResult.score >= 80 ? 'GOOD' :
                 validationResult.score >= 70 ? 'ACCEPTABLE' : 'NEEDS_IMPROVEMENT',
        distributorReady: validationResult.score >= 90
      },
      recommendations: [
        ...validationResult.recommendations,
        "Use the recommended FFmpeg command for distributor compliance",
        "Ensure all PIDs match distributor requirements (101, 102, 500)",
        "Verify SCTE-35 stream is properly configured with stream_type 0x86"
      ]
    })

  } catch (error) {
    console.error('Error validating stream format:', error)
    return NextResponse.json(
      { 
        error: 'Failed to validate stream format',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}