"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, AlertTriangle, Info, FileText, Settings, Play } from 'lucide-react'

interface ValidationResult {
  isValid: boolean
  compliance: {
    video: boolean
    audio: boolean
    scte35: boolean
    format: boolean
    pids: boolean
    program: boolean
  }
  errors: string[]
  warnings: string[]
  recommendations: string[]
  score: number
}

interface StreamAnalysis {
  streams: any[]
  format: any
}

interface ValidationResponse {
  validationResult: ValidationResult
  recommendedCommand: string
  analysis: StreamAnalysis
  compliance: {
    score: number
    status: string
    distributorReady: boolean
  }
  recommendations: string[]
}

export function StreamValidation() {
  const [streamUrl, setStreamUrl] = useState('')
  const [outputUrl, setOutputUrl] = useState('')
  const [config, setConfig] = useState('{}')
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validateStream = async () => {
    if (!streamUrl || !outputUrl) {
      alert('Please enter both stream URL and output URL')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/streams/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamUrl,
          outputUrl,
          config: config ? JSON.parse(config) : {}
        }),
      })

      if (!response.ok) {
        throw new Error('Validation failed')
      }

      const data: ValidationResponse = await response.json()
      setValidationResult(data)
    } catch (error) {
      console.error('Error validating stream:', error)
      alert('Failed to validate stream configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'bg-green-100 text-green-800'
      case 'GOOD': return 'bg-blue-100 text-blue-800'
      case 'ACCEPTABLE': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stream Validation</h2>
          <p className="text-muted-foreground">
            Validate your stream configuration against distributor requirements
          </p>
        </div>
      </div>

      <Tabs defaultValue="validation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="validation">Stream Validation</TabsTrigger>
          <TabsTrigger value="command">FFmpeg Command</TabsTrigger>
          <TabsTrigger value="analysis">Stream Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Stream Configuration
              </CardTitle>
              <CardDescription>
                Enter your stream URLs to validate against distributor requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="streamUrl">Input Stream URL</Label>
                  <Input
                    id="streamUrl"
                    placeholder="rtmp://source/live/stream"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outputUrl">Output Stream URL</Label>
                  <Input
                    id="outputUrl"
                    placeholder="srt://distributor:1234?stream=live"
                    value={outputUrl}
                    onChange={(e) => setOutputUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="config">Stream Configuration (JSON)</Label>
                <Textarea
                  id="config"
                  placeholder={`{
  "bitrate": 5000,
  "resolution": "1920x1080",
  "framerate": 25
}`}
                  value={config}
                  onChange={(e) => setConfig(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={validateStream} disabled={isLoading} className="w-full">
                {isLoading ? 'Validating...' : 'Validate Stream Configuration'}
              </Button>
            </CardContent>
          </Card>

          {validationResult && (
            <div className="space-y-4">
              {/* Overall Compliance Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Overall Score</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${getScoreColor(validationResult.compliance.score)}`}>
                          {validationResult.compliance.score}%
                        </span>
                        <Badge className={getStatusColor(validationResult.compliance.status)}>
                          {validationResult.compliance.status}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={validationResult.compliance.score} className="h-3" />
                    <div className="flex items-center gap-2">
                      {validationResult.compliance.distributorReady ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-green-600 font-medium">
                            Stream is distributor-ready!
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="text-red-600 font-medium">
                            Stream needs improvements for distributor compatibility
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(validationResult.validationResult.compliance).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {value ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Errors and Warnings */}
              {validationResult.validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.validationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.validationResult.warnings.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Validation Warnings</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.validationResult.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Recommendations */}
              {validationResult.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {validationResult.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="command" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recommended FFmpeg Command
              </CardTitle>
              <CardDescription>
                This command generates streams that match your distributor's requirements exactly
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validationResult ? (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap break-all">
                      {validationResult.recommendedCommand}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(validationResult.recommendedCommand)
                        alert('Command copied to clipboard!')
                      }}
                      variant="outline"
                    >
                      Copy Command
                    </Button>
                    <Button
                      onClick={() => {
                        const blob = new Blob([validationResult.recommendedCommand], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'ffmpeg-command.sh'
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      variant="outline"
                    >
                      Download Script
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Validate a stream configuration to see the recommended FFmpeg command
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Stream Analysis
              </CardTitle>
              <CardDescription>
                Detailed analysis of the stream structure and format
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validationResult ? (
                <div className="space-y-6">
                  {/* Format Information */}
                  <div>
                    <h4 className="font-semibold mb-2">Format Information</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(validationResult.analysis.format, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Stream Information */}
                  <div>
                    <h4 className="font-semibold mb-2">Stream Information</h4>
                    <div className="space-y-4">
                      {validationResult.analysis.streams.map((stream, index) => (
                        <div key={index} className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={stream.codec_type === 'video' ? 'default' : stream.codec_type === 'audio' ? 'secondary' : 'outline'}>
                              {stream.codec_type.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{stream.codec_name}</span>
                            {stream.tags?.pid && (
                              <Badge variant="outline">PID: {stream.tags.pid}</Badge>
                            )}
                          </div>
                          <pre className="text-sm overflow-auto">
                            {JSON.stringify(stream, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Validate a stream configuration to see detailed analysis
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}