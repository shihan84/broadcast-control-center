"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Trash2, 
  Edit,
  Calendar,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Timer
} from 'lucide-react'

export function SCTE35Manager() {
  const [activeTab, setActiveTab] = useState('events')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [scte35Events, setScte35Events] = useState([
    {
      id: '1',
      eventId: 'CUE-001',
      eventType: 'commercial_start',
      channel: 'News Channel HD',
      startTime: '2024-01-15T14:30:00Z',
      duration: 120,
      command: '/DAIINSERT/',
      description: 'Afternoon commercial break',
      status: 'completed'
    },
    {
      id: '2',
      eventId: 'CUE-002',
      eventType: 'program_end',
      channel: 'Sports Network',
      startTime: '2024-01-15T15:45:00Z',
      duration: null,
      command: '/ENDPROGRAM/',
      description: 'End of sports broadcast',
      status: 'scheduled'
    },
    {
      id: '3',
      eventId: 'CUE-003',
      eventType: 'break_start',
      channel: 'Entertainment Plus',
      startTime: '2024-01-15T16:00:00Z',
      duration: 180,
      command: '/BREAK/',
      description: 'Scheduled programming break',
      status: 'scheduled'
    },
    {
      id: '4',
      eventId: 'CUE-004',
      eventType: 'provider_ad_start',
      channel: 'News Channel HD',
      startTime: '2024-01-15T16:30:00Z',
      duration: 60,
      command: '/PROVIDERAD/',
      description: 'Provider advertisement insertion',
      status: 'running'
    }
  ])

  const [scte35Templates, setScte35Templates] = useState([
    // Pre-roll Templates
    {
      id: '1',
      name: 'Standard Pre-roll',
      eventType: 'commercial_start',
      duration: 30,
      command: '/PREROLL_STD/',
      description: '30-second standard pre-roll advertisement before content',
      rollType: 'pre-roll',
      category: 'pre-roll'
    },
    {
      id: '2',
      name: 'Extended Pre-roll',
      eventType: 'commercial_start',
      duration: 60,
      command: '/PREROLL_EXT/',
      description: '60-second extended pre-roll advertisement',
      rollType: 'pre-roll',
      category: 'pre-roll'
    },
    {
      id: '3',
      name: 'Premium Pre-roll',
      eventType: 'commercial_start',
      duration: 90,
      command: '/PREROLL_PREM/',
      description: '90-second premium pre-roll advertisement',
      rollType: 'pre-roll',
      category: 'pre-roll'
    },
    {
      id: '4',
      name: 'Sponsorship Bumper',
      eventType: 'provider_ad_start',
      duration: 15,
      command: '/SPONSOR_BUMPER/',
      description: '15-second sponsorship bumper pre-roll',
      rollType: 'pre-roll',
      category: 'pre-roll'
    },
    {
      id: '5',
      name: 'Program Teaser Pre-roll',
      eventType: 'commercial_start',
      duration: 45,
      command: '/TEASER_PREROLL/',
      description: '45-second program teaser with advertisement',
      rollType: 'pre-roll',
      category: 'pre-roll'
    },
    
    // Mid-roll Templates
    {
      id: '6',
      name: 'Standard Commercial Break',
      eventType: 'commercial_start',
      duration: 120,
      command: '/MIDROLL_STD/',
      description: 'Standard 2-minute mid-roll commercial break',
      rollType: 'mid-roll',
      category: 'mid-roll'
    },
    {
      id: '7',
      name: 'Short Mid-roll',
      eventType: 'commercial_start',
      duration: 60,
      command: '/MIDROLL_SHORT/',
      description: '60-second short mid-roll break',
      rollType: 'mid-roll',
      category: 'mid-roll'
    },
    {
      id: '8',
      name: 'Extended Mid-roll Pod',
      eventType: 'break_start',
      duration: 180,
      command: '/MIDROLL_POD_EXT/',
      description: '3-minute extended mid-roll pod with multiple ads',
      rollType: 'mid-roll',
      category: 'mid-roll'
    },
    {
      id: '9',
      name: 'Provider Mid-roll',
      eventType: 'provider_ad_start',
      duration: 90,
      command: '/PROVIDER_MIDROLL/',
      description: '90-second provider-specific mid-roll advertisement',
      rollType: 'mid-roll',
      category: 'mid-roll'
    },
    
    // Post-roll Templates
    {
      id: '10',
      name: 'Standard Post-roll',
      eventType: 'commercial_start',
      duration: 30,
      command: '/POSTROLL_STD/',
      description: '30-second standard post-roll advertisement after content',
      rollType: 'post-roll',
      category: 'post-roll'
    },
    {
      id: '11',
      name: 'Extended Post-roll',
      eventType: 'commercial_start',
      duration: 60,
      command: '/POSTROLL_EXT/',
      description: '60-second extended post-roll advertisement',
      rollType: 'post-roll',
      category: 'post-roll'
    },
    {
      id: '12',
      name: 'Premium Post-roll',
      eventType: 'commercial_start',
      duration: 90,
      command: '/POSTROLL_PREM/',
      description: '90-second premium post-roll advertisement',
      rollType: 'post-roll',
      category: 'post-roll'
    },
    {
      id: '13',
      name: 'Program Promo Post-roll',
      eventType: 'commercial_start',
      duration: 45,
      command: '/PROMO_POSTROLL/',
      description: '45-second program promotion post-roll',
      rollType: 'post-roll',
      category: 'post-roll'
    },
    {
      id: '14',
      name: 'Call to Action Post-roll',
      eventType: 'provider_ad_start',
      duration: 30,
      command: '/CTA_POSTROLL/',
      description: '30-second call-to-action post-roll advertisement',
      rollType: 'post-roll',
      category: 'post-roll'
    },
    
    // Program Boundary Templates
    {
      id: '15',
      name: 'Program Start',
      eventType: 'program_start',
      duration: null,
      command: '/PROGRAM_START/',
      description: 'Program start marker',
      rollType: 'program-boundary',
      category: 'program'
    },
    {
      id: '16',
      name: 'Program End',
      eventType: 'program_end',
      duration: null,
      command: '/PROGRAM_END/',
      description: 'Program end marker',
      rollType: 'program-boundary',
      category: 'program'
    },
    {
      id: '17',
      name: 'Chapter Break',
      eventType: 'break_start',
      duration: 10,
      command: '/CHAPTER_BREAK/',
      description: '10-second chapter break',
      rollType: 'program-boundary',
      category: 'program'
    }
  ])

  const getEventTypeColor = (eventType: string) => {
    const colors: { [key: string]: string } = {
      commercial_start: 'bg-yellow-500',
      commercial_end: 'bg-green-500',
      program_start: 'bg-blue-500',
      program_end: 'bg-red-500',
      break_start: 'bg-purple-500',
      break_end: 'bg-indigo-500',
      provider_ad_start: 'bg-orange-500',
      provider_ad_end: 'bg-teal-500',
      custom: 'bg-gray-500'
    }
    return colors[eventType] || 'bg-gray-500'
  }

  const getRollTypeColor = (rollType: string) => {
    const colors: { [key: string]: string } = {
      'pre-roll': 'bg-blue-500',
      'post-roll': 'bg-green-500',
      'mid-roll': 'bg-purple-500',
      'program-boundary': 'bg-orange-500',
      'unknown': 'bg-gray-500'
    }
    return colors[rollType] || 'bg-gray-500'
  }

  const getRollTypeIcon = (rollType: string) => {
    switch (rollType) {
      case 'pre-roll': return <Play className="h-4 w-4 text-blue-500" />
      case 'post-roll': return <Square className="h-4 w-4 text-green-500" />
      case 'mid-roll': return <Pause className="h-4 w-4 text-purple-500" />
      case 'program-boundary': return <Calendar className="h-4 w-4 text-orange-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      scheduled: 'secondary',
      running: 'default',
      completed: 'outline',
      cancelled: 'destructive',
      error: 'destructive'
    }
    
    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {status}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4 text-gray-500" />
      case 'running': return <Play className="h-4 w-4 text-green-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'cancelled': return <Square className="h-4 w-4 text-red-500" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SCTE-35 Management</h2>
          <p className="text-muted-foreground">Manage ad insertion and program events</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create SCTE-35 Event</DialogTitle>
                <DialogDescription>
                  Schedule a new ad insertion or program event
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-id">Event ID</Label>
                  <Input id="event-id" placeholder="CUE-001" />
                </div>
                <div>
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial_start">Commercial Start</SelectItem>
                      <SelectItem value="commercial_end">Commercial End</SelectItem>
                      <SelectItem value="program_start">Program Start</SelectItem>
                      <SelectItem value="program_end">Program End</SelectItem>
                      <SelectItem value="break_start">Break Start</SelectItem>
                      <SelectItem value="break_end">Break End</SelectItem>
                      <SelectItem value="provider_ad_start">Provider Ad Start</SelectItem>
                      <SelectItem value="provider_ad_end">Provider Ad End</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">News Channel HD</SelectItem>
                      <SelectItem value="sports">Sports Network</SelectItem>
                      <SelectItem value="entertainment">Entertainment Plus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input id="start-time" type="datetime-local" />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input id="duration" type="number" placeholder="120" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Event description" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>
                    Create Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Quick Pre-roll Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Pre-roll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Pre-roll Event</DialogTitle>
                <DialogDescription>
                  Schedule a pre-roll advertisement before content
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preroll-channel">Channel</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">News Channel HD</SelectItem>
                      <SelectItem value="sports">Sports Network</SelectItem>
                      <SelectItem value="entertainment">Entertainment Plus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preroll-start-time">Start Time</Label>
                  <Input id="preroll-start-time" type="datetime-local" />
                </div>
                <div>
                  <Label htmlFor="preroll-duration">Duration (seconds)</Label>
                  <Input id="preroll-duration" type="number" placeholder="30" />
                </div>
                <div>
                  <Label htmlFor="preroll-provider">Ad Provider</Label>
                  <Input id="preroll-provider" placeholder="Ad Provider Name" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Pre-roll</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Quick Post-roll Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Post-roll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Post-roll Event</DialogTitle>
                <DialogDescription>
                  Schedule a post-roll advertisement after content
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="postroll-channel">Channel</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">News Channel HD</SelectItem>
                      <SelectItem value="sports">Sports Network</SelectItem>
                      <SelectItem value="entertainment">Entertainment Plus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postroll-start-time">Start Time</Label>
                  <Input id="postroll-start-time" type="datetime-local" />
                </div>
                <div>
                  <Label htmlFor="postroll-duration">Duration (seconds)</Label>
                  <Input id="postroll-duration" type="number" placeholder="30" />
                </div>
                <div>
                  <Label htmlFor="postroll-provider">Ad Provider</Label>
                  <Input id="postroll-provider" placeholder="Ad Provider Name" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Post-roll</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SCTE-35 Events</CardTitle>
              <CardDescription>Manage scheduled and running SCTE-35 events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scte35Events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.eventId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.eventType)}`} />
                          <Badge variant="outline" className="capitalize">
                            {event.eventType.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{event.channel}</TableCell>
                      <TableCell>{formatDateTime(event.startTime)}</TableCell>
                      <TableCell>{event.duration ? `${event.duration}s` : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(event.status)}
                          {getStatusBadge(event.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {event.status === 'scheduled' && (
                            <Button variant="ghost" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {event.status === 'running' && (
                            <Button variant="ghost" size="sm">
                              <Square className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SCTE-35 Templates</CardTitle>
              <CardDescription>Pre-configured event templates for quick deployment</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Category Filter */}
              <div className="flex gap-2 mb-6">
                <Button 
                  variant={selectedCategory === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Templates
                </Button>
                <Button 
                  variant={selectedCategory === 'pre-roll' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedCategory('pre-roll')}
                >
                  Pre-roll
                </Button>
                <Button 
                  variant={selectedCategory === 'post-roll' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedCategory('post-roll')}
                >
                  Post-roll
                </Button>
                <Button 
                  variant={selectedCategory === 'mid-roll' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedCategory('mid-roll')}
                >
                  Mid-roll
                </Button>
                <Button 
                  variant={selectedCategory === 'program' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedCategory('program')}
                >
                  Program
                </Button>
              </div>

              {/* Templates Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scte35Templates
                  .filter(template => selectedCategory === 'all' || template.category === selectedCategory)
                  .map((template) => (
                  <Card key={template.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getEventTypeColor(template.eventType)}`} />
                          {template.rollType && (
                            <div className={`w-2 h-2 rounded-full ${getRollTypeColor(template.rollType)}`} />
                          )}
                        </div>
                      </div>
                      <CardDescription className="text-xs">{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Type:</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {template.eventType.replace('_', ' ')}
                          </Badge>
                        </div>
                        {template.rollType && (
                          <div className="flex justify-between text-sm">
                            <span>Roll:</span>
                            <div className="flex items-center gap-1">
                              {getRollTypeIcon(template.rollType)}
                              <Badge variant="outline" className="text-xs capitalize">
                                {template.rollType.replace('-', ' ')}
                              </Badge>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span>Duration:</span>
                          <span>{template.duration ? `${template.duration}s` : 'N/A'}</span>
                        </div>
                        {template.category && (
                          <div className="flex justify-between text-sm">
                            <span>Category:</span>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {template.category}
                            </Badge>
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" className="flex-1">
                            Use Template
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Timeline</CardTitle>
              <CardDescription>Visual timeline of scheduled and executed SCTE-35 events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Timeline View</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span>Commercial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Program</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>Break</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {['News Channel HD', 'Sports Network', 'Entertainment Plus'].map((channel) => (
                    <div key={channel} className="space-y-2">
                      <h4 className="font-medium text-sm">{channel}</h4>
                      <div className="relative h-16 bg-muted rounded-lg p-2">
                        <div className="absolute inset-2 flex items-center">
                          <div className="w-full h-1 bg-border rounded" />
                        </div>
                        {scte35Events
                          .filter(event => event.channel === channel)
                          .map((event, index) => (
                            <div
                              key={event.id}
                              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${getEventTypeColor(event.eventType)} border-2 border-background`}
                              style={{ left: `${(index + 1) * 20}%` }}
                              title={`${event.eventType} - ${formatDateTime(event.startTime)}`}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}