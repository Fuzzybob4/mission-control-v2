'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, List, Moon, Sun, RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Agent, AgentData, AgentStatus, AgentType } from './Agent';
import { AgentMap } from './AgentMap';
import { AgentDetailPanel } from './AgentDetailPanel';
import { cn } from '@/lib/utils';

// Sample agents for demonstration
const sampleAgents: AgentData[] = [
  {
    id: '1',
    name: 'Rusty',
    type: 'redfox',
    status: 'working',
    task: 'Analyzing customer feedback patterns and generating sentiment report',
    creditsUsed: 145,
    creditsEstimated: 200,
    timeElapsed: 180,
    timeEstimated: 300,
    personality: [],
  },
  {
    id: '2',
    name: 'Spark',
    type: 'lonestar',
    status: 'commuting',
    task: 'Brainstorming innovative solutions for the recommendation engine',
    creditsUsed: 0,
    creditsEstimated: 150,
    timeElapsed: 45,
    timeEstimated: 120,
    personality: [],
  },
  {
    id: '3',
    name: 'Ace',
    type: 'heroes',
    status: 'idle',
    task: undefined,
    creditsUsed: 0,
    creditsEstimated: 100,
    timeElapsed: 0,
    timeEstimated: 0,
    personality: [],
  },
  {
    id: '4',
    name: 'Scarlet',
    type: 'redfox',
    status: 'returning',
    task: 'Completed data pipeline optimization',
    creditsUsed: 320,
    creditsEstimated: 300,
    timeElapsed: 600,
    timeEstimated: 600,
    personality: [],
  },
  {
    id: '5',
    name: 'Glow',
    type: 'lonestar',
    status: 'working',
    task: 'Architecting new microservice infrastructure',
    creditsUsed: 280,
    creditsEstimated: 400,
    timeElapsed: 900,
    timeEstimated: 1200,
    personality: [],
  },
  {
    id: '6',
    name: 'Joker',
    type: 'heroes',
    status: 'done',
    task: 'Fixed critical bug in payment processing',
    creditsUsed: 95,
    creditsEstimated: 100,
    timeElapsed: 240,
    timeEstimated: 300,
    personality: [],
  },
];

const statusOrder: AgentStatus[] = ['working', 'commuting', 'returning', 'idle', 'done'];

export function AgentNetwork() {
  const [agents, setAgents] = useState<AgentData[]>(sampleAgents);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isNight, setIsNight] = useState(false);
  const [view, setView] = useState<'map' | 'list'>('map');

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || null;

  // Simulate agent status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        // Randomly advance some agents
        if (Math.random() > 0.7) {
          const statusIndex = statusOrder.indexOf(agent.status);
          if (statusIndex < statusOrder.length - 1 && agent.status !== 'done') {
            const newStatus = statusOrder[statusIndex + 1];
            return {
              ...agent,
              status: newStatus,
              timeElapsed: agent.timeElapsed + 5,
              creditsUsed: agent.status === 'working' 
                ? agent.creditsUsed + Math.floor(Math.random() * 5)
                : agent.creditsUsed,
            };
          }
        }
        
        // Update elapsed time
        if (agent.status === 'working' || agent.status === 'commuting') {
          return {
            ...agent,
            timeElapsed: agent.timeElapsed + 1,
            creditsUsed: agent.status === 'working' 
              ? agent.creditsUsed + 1
              : agent.creditsUsed,
          };
        }
        
        return agent;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCancelTask = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: 'idle' as AgentStatus, task: undefined }
        : agent
    ));
    setSelectedAgentId(null);
  };

  const workingCount = agents.filter(a => a.status === 'working').length;
  const commutingCount = agents.filter(a => a.status === 'commuting' || a.status === 'returning').length;
  const idleCount = agents.filter(a => a.status === 'idle').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Agent Network</h1>
            <p className="text-sm text-muted-foreground">
              {agents.length} agents • {workingCount} working • {commutingCount} commuting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <Tabs value={view} onValueChange={(v) => setView(v as 'map' | 'list')}>
            <TabsList className="grid w-auto grid-cols-2">
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Day/Night toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsNight(!isNight)}
            className="relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isNight ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Refresh button */}
          <Button variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
          Idle: {idleCount}
        </Badge>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <span className="w-2 h-2 rounded-full bg-blue-400 mr-1.5" />
          Commuting: {commutingCount}
        </Badge>
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5 animate-pulse" />
          Working: {workingCount}
        </Badge>
      </div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {view === 'map' ? (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <AgentMap
              agents={agents}
              selectedAgentId={selectedAgentId || undefined}
              onAgentClick={(agent) => setSelectedAgentId(agent.id)}
              isNight={isNight}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {agents
              .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status))
              .map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      'p-4 cursor-pointer transition-all hover:shadow-md',
                      selectedAgentId === agent.id && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <div className="flex items-start gap-4">
                      <Agent agent={agent} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold truncate">{agent.name}</h3>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            agent.status === 'idle' && 'bg-emerald-100 text-emerald-700',
                            agent.status === 'commuting' && 'bg-blue-100 text-blue-700',
                            agent.status === 'working' && 'bg-amber-100 text-amber-700',
                            agent.status === 'returning' && 'bg-purple-100 text-purple-700',
                            agent.status === 'done' && 'bg-gray-100 text-gray-700',
                          )}>
                            {agent.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {agent.task || 'No active task'}
                        </p>
                        {agent.status === 'working' && (
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span>{Math.round((agent.timeElapsed / agent.timeEstimated) * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${(agent.timeElapsed / agent.timeEstimated) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Detail Panel */}
      <AgentDetailPanel
        agent={selectedAgent}
        isOpen={!!selectedAgentId}
        onClose={() => setSelectedAgentId(null)}
        onCancelTask={handleCancelTask}
      />
    </div>
  );
}
