"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Activity, 
  Radio, 
  Monitor,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'
import { BroadcastDashboard } from '@/components/broadcast-dashboard'
import { StreamManagement } from '@/components/stream-management'
import { SCTE35Manager } from '@/components/scte35-manager'
import { RealtimeMonitor } from '@/components/realtime-monitor'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [systemStatus, setSystemStatus] = useState({
    cpu: 45,
    memory: 62,
    network: 78,
    uptime: '24h 15m'
  })

  const [channels, setChannels] = useState([
    {
      id: '1',
      name: 'News Channel HD',
      status: 'online',
      viewers: 12450,
      bitrate: 8.5,
      inputs: 2,
      outputs: 3
    },
    {
      id: '2',
      name: 'Sports Network',
      status: 'online',
      viewers: 8230,
      bitrate: 12.0,
      inputs: 1,
      outputs: 2
    },
    {
      id: '3',
      name: 'Entertainment Plus',
      status: 'offline',
      viewers: 0,
      bitrate: 0,
      inputs: 0,
      outputs: 0
    }
  ])

  const [recentEvents, setRecentEvents] = useState([
    {
      id: '1',
      type: 'commercial_start',
      channel: 'News Channel HD',
      time: '2 minutes ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'program_end',
      channel: 'Sports Network',
      time: '5 minutes ago',
      status: 'completed'
    },
    {
      id: '3',
      type: 'break_start',
      channel: 'Entertainment Plus',
      time: '10 minutes ago',
      status: 'scheduled'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-gray-500'
      case 'error': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'offline': return <Square className="h-4 w-4 text-gray-500" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'commercial_start': return <Zap className="h-4 w-4 text-yellow-500" />
      case 'program_end': return <Square className="h-4 w-4 text-red-500" />
      case 'break_start': return <Pause className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Broadcast Control Center</h1>
            <p className="text-muted-foreground">Professional live TV streaming with SCTE-35 support</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-2">
              <Activity className="h-4 w-4" />
              System Online
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="streams">Streams</TabsTrigger>
            <TabsTrigger value="scte35">SCTE-35</TabsTrigger>
            <TabsTrigger value="monitor">Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
                  <Radio className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{channels.filter(c => c.status === 'online').length}</div>
                  <p className="text-xs text-muted-foreground">of {channels.length} total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Viewers</CardTitle>
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {channels.reduce((acc, channel) => acc + channel.viewers, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">across all channels</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Load</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus.cpu}%</div>
                  <Progress value={systemStatus.cpu} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus.uptime}</div>
                  <p className="text-xs text-muted-foreground">since last restart</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Channel Status</CardTitle>
                  <CardDescription>Live broadcast channels overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {channels.map((channel) => (
                      <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(channel.status)}`} />
                          <div>
                            <h4 className="font-medium">{channel.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {channel.viewers.toLocaleString()} viewers • {channel.bitrate} Mbps
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{channel.inputs} in</Badge>
                          <Badge variant="outline">{channel.outputs} out</Badge>
                          {getStatusIcon(channel.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent SCTE-35 Events</CardTitle>
                  <CardDescription>Latest ad insertion and program events</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {recentEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getEventIcon(event.type)}
                            <div>
                              <h4 className="text-sm font-medium capitalize">{event.type.replace('_', ' ')}</h4>
                              <p className="text-xs text-muted-foreground">{event.channel}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{event.time}</p>
                            <Badge 
                              variant={event.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="streams">
            <StreamManagement />
          </TabsContent>

          <TabsContent value="scte35">
            <SCTE35Manager />
          </TabsContent>

          <TabsContent value="monitor">
            <RealtimeMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}