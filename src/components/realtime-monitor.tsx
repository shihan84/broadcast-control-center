"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

interface MetricData {
  timestamp: string
  value: number
}

interface SystemMetrics {
  cpu: MetricData[]
  memory: MetricData[]
  network: MetricData[]
  disk: MetricData[]
}

export function RealtimeMonitor() {
  const [activeTab, setActiveTab] = useState('system')
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: [],
    memory: [],
    network: [],
    disk: []
  })

  const [channelMetrics, setChannelMetrics] = useState([
    {
      id: '1',
      name: 'News Channel HD',
      status: 'online',
      cpu: 35,
      memory: 45,
      network: 78,
      bitrate: 8.5,
      viewers: 12450,
      droppedFrames: 12,
      latency: 1200
    },
    {
      id: '2',
      name: 'Sports Network',
      status: 'online',
      cpu: 42,
      memory: 58,
      network: 85,
      bitrate: 12.0,
      viewers: 8230,
      droppedFrames: 8,
      latency: 980
    },
    {
      id: '3',
      name: 'Entertainment Plus',
      status: 'offline',
      cpu: 0,
      memory: 0,
      network: 0,
      bitrate: 0,
      viewers: 0,
      droppedFrames: 0,
      latency: 0
    }
  ])

  const [alerts, setAlerts] = useState([
    {
      id: '1',
      type: 'warning',
      message: 'High CPU usage on News Channel HD',
      timestamp: '2 minutes ago',
      resolved: false
    },
    {
      id: '2',
      type: 'error',
      message: 'Network latency spike detected',
      timestamp: '5 minutes ago',
      resolved: true
    },
    {
      id: '3',
      type: 'info',
      message: 'Scheduled maintenance completed',
      timestamp: '10 minutes ago',
      resolved: true
    }
  ])

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toISOString()
      
      setSystemMetrics(prev => {
        const newCpu = [...prev.cpu.slice(-19), { timestamp: now, value: Math.random() * 100 }]
        const newMemory = [...prev.memory.slice(-19), { timestamp: now, value: Math.random() * 100 }]
        const newNetwork = [...prev.network.slice(-19), { timestamp: now, value: Math.random() * 100 }]
        const newDisk = [...prev.disk.slice(-19), { timestamp: now, value: Math.random() * 100 }]
        
        return {
          cpu: newCpu,
          memory: newMemory,
          network: newNetwork,
          disk: newDisk
        }
      })

      // Update channel metrics
      setChannelMetrics(prev => prev.map(channel => ({
        ...channel,
        cpu: channel.status === 'online' ? Math.max(0, Math.min(100, channel.cpu + (Math.random() - 0.5) * 10)) : 0,
        memory: channel.status === 'online' ? Math.max(0, Math.min(100, channel.memory + (Math.random() - 0.5) * 5)) : 0,
        viewers: channel.status === 'online' ? Math.max(0, channel.viewers + Math.floor((Math.random() - 0.5) * 100)) : 0,
        droppedFrames: channel.status === 'online' ? Math.max(0, channel.droppedFrames + Math.floor((Math.random() - 0.5) * 5)) : 0
      })))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-gray-500'
      case 'error': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendIcon = (current: number, previous: number) => {
    const diff = current - previous
    if (Math.abs(diff) < 1) return <Minus className="h-3 w-3 text-gray-500" />
    if (diff > 0) return <TrendingUp className="h-3 w-3 text-green-500" />
    return <TrendingDown className="h-3 w-3 text-red-500" />
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getCurrentValue = (metrics: MetricData[]) => {
    return metrics.length > 0 ? metrics[metrics.length - 1].value : 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Real-time Monitor</h2>
        <p className="text-muted-foreground">Live system and channel performance metrics</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getCurrentValue(systemMetrics.cpu).toFixed(1)}%</div>
                <Progress value={getCurrentValue(systemMetrics.cpu)} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {systemMetrics.cpu.length > 1 && getTrendIcon(
                    getCurrentValue(systemMetrics.cpu),
                    systemMetrics.cpu[systemMetrics.cpu.length - 2].value
                  )}
                  <span className="ml-1">Real-time</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getCurrentValue(systemMetrics.memory).toFixed(1)}%</div>
                <Progress value={getCurrentValue(systemMetrics.memory)} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {systemMetrics.memory.length > 1 && getTrendIcon(
                    getCurrentValue(systemMetrics.memory),
                    systemMetrics.memory[systemMetrics.memory.length - 2].value
                  )}
                  <span className="ml-1">Real-time</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getCurrentValue(systemMetrics.network).toFixed(1)}%</div>
                <Progress value={getCurrentValue(systemMetrics.network)} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {systemMetrics.network.length > 1 && getTrendIcon(
                    getCurrentValue(systemMetrics.network),
                    systemMetrics.network[systemMetrics.network.length - 2].value
                  )}
                  <span className="ml-1">Real-time</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk I/O</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getCurrentValue(systemMetrics.disk).toFixed(1)}%</div>
                <Progress value={getCurrentValue(systemMetrics.disk)} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {systemMetrics.disk.length > 1 && getTrendIcon(
                    getCurrentValue(systemMetrics.disk),
                    systemMetrics.disk[systemMetrics.disk.length - 2].value
                  )}
                  <span className="ml-1">Real-time</span>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time system metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'CPU', data: systemMetrics.cpu, color: 'bg-blue-500' },
                    { name: 'Memory', data: systemMetrics.memory, color: 'bg-green-500' },
                    { name: 'Network', data: systemMetrics.network, color: 'bg-purple-500' },
                    { name: 'Disk', data: systemMetrics.disk, color: 'bg-orange-500' }
                  ].map((metric) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{metric.name}</span>
                        <span>{metric.data.length > 0 ? metric.data[metric.data.length - 1].value.toFixed(1) : '0'}%</span>
                      </div>
                      <div className="h-8 bg-muted rounded-md p-1">
                        <div className="relative h-full">
                          {metric.data.slice(-20).map((point, index) => (
                            <div
                              key={index}
                              className={`absolute bottom-0 ${metric.color} rounded-sm`}
                              style={{
                                left: `${(index / 19) * 100}%`,
                                width: `${100 / 19}%`,
                                height: `${point.value}%`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Overall system status and health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div>
                        <h4 className="font-medium">System Status</h4>
                        <p className="text-sm text-muted-foreground">All systems operational</p>
                      </div>
                    </div>
                    <Badge variant="default">Healthy</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div>
                        <h4 className="font-medium">Active Streams</h4>
                        <p className="text-sm text-muted-foreground">Currently running</p>
                      </div>
                    </div>
                    <Badge variant="outline">{channelMetrics.filter(c => c.status === 'online').length}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <div>
                        <h4 className="font-medium">Total Viewers</h4>
                        <p className="text-sm text-muted-foreground">Across all channels</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {channelMetrics.reduce((acc, channel) => acc + channel.viewers, 0).toLocaleString()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <div>
                        <h4 className="font-medium">Uptime</h4>
                        <p className="text-sm text-muted-foreground">System availability</p>
                      </div>
                    </div>
                    <Badge variant="outline">99.9%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid gap-6">
            {channelMetrics.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(channel.status)}`} />
                        {channel.name}
                      </CardTitle>
                      <CardDescription>Channel performance metrics</CardDescription>
                    </div>
                    <Badge variant={channel.status === 'online' ? 'default' : 'secondary'}>
                      {channel.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CPU Usage</span>
                        <span>{channel.cpu.toFixed(1)}%</span>
                      </div>
                      <Progress value={channel.cpu} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Memory</span>
                        <span>{channel.memory.toFixed(1)}%</span>
                      </div>
                      <Progress value={channel.memory} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Network</span>
                        <span>{channel.network.toFixed(1)}%</span>
                      </div>
                      <Progress value={channel.network} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Bitrate</span>
                        <span>{channel.bitrate} Mbps</span>
                      </div>
                      <Progress value={(channel.bitrate / 20) * 100} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3 mt-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">{channel.viewers.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Viewers</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">{channel.droppedFrames}</div>
                      <div className="text-sm text-muted-foreground">Dropped Frames</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">{channel.latency}ms</div>
                      <div className="text-sm text-muted-foreground">Latency</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent system alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <h4 className="font-medium">{alert.message}</h4>
                          <p className="text-sm text-muted-foreground">{alert.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.resolved ? 'outline' : 'default'}>
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                        {!alert.resolved && (
                          <Button variant="outline" size="sm">
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}