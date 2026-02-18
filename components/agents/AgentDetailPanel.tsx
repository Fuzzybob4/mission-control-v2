'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, DollarSign, AlertCircle, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentData, agentConfig, statusConfig } from './Agent';
import { cn } from '@/lib/utils';

interface AgentDetailPanelProps {
  agent: AgentData | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelTask?: (agentId: string) => void;
}

const personalityTraits: Record<string, string[]> = {
  redfox: [
    "Clever problem solver with a mischievous streak",
    "Loves chasing data rabbits down deep holes",
    "Always has a backup plan (and a backup backup)",
    "Speaks in riddles when processing complex queries",
    "Keeps a collection of solved bugs as trophies",
  ],
  lonestar: [
    "Brilliant ideas appear at 3 AM (always)",
    "Burns bright but needs coffee refills",
    "Sees connections others miss in the dark",
    "Invented 5 new algorithms before breakfast",
    "Still searching for the perfect optimization",
  ],
  heroes: [
    "Fights bugs with the power of friendship",
    "Each card drawn reveals a new possibility",
    "Believes in the heart of the codebase",
    "Never backs down from a legacy system duel",
    "Collects rare edge cases like trading cards",
  ],
};

const personalityIcons: Record<string, React.ReactNode> = {
  redfox: <Zap className="w-4 h-4" />,
  lonestar: <Zap className="w-4 h-4" />,
  heroes: <Zap className="w-4 h-4" />,
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function AgentDetailPanel({ 
  agent, 
  isOpen, 
  onClose, 
  onCancelTask 
}: AgentDetailPanelProps) {
  if (!agent) return null;

  const config = agentConfig[agent.type];
  const status = statusConfig[agent.status];
  const traits = personalityTraits[agent.type];
  const creditProgress = (agent.creditsUsed / agent.creditsEstimated) * 100;
  const timeProgress = (agent.timeElapsed / agent.timeEstimated) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
            }}
            className={cn(
              'fixed right-0 top-0 h-full w-full max-w-md',
              'bg-background/95 backdrop-blur-xl border-l shadow-2xl',
              'z-50 flex flex-col'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Agent Details</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Large Avatar */}
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div
                    className={cn(
                      'w-32 h-32 rounded-full flex items-center justify-center text-6xl',
                      'bg-gradient-to-br shadow-2xl',
                      config.color
                    )}
                  >
                    {config.emoji}
                  </div>
                  
                  {/* Status badge */}
                  <motion.div
                    className={cn(
                      'mt-4 px-4 py-1.5 rounded-full text-sm font-medium',
                      'flex items-center gap-2',
                      agent.status === 'idle' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                      agent.status === 'commuting' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                      agent.status === 'working' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                      agent.status === 'returning' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                      agent.status === 'done' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                    )}
                    animate={{
                      scale: agent.status === 'working' ? [1, 1.05, 1] : 1,
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      status.indicator
                    )} />
                    {status.label}
                  </motion.div>
                </motion.div>

                {/* Name and Type */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold">{agent.name}</h3>
                  <p className="text-muted-foreground">{config.name} Agent</p>
                </div>

                {/* Task Description */}
                {agent.task && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-xl bg-muted/50 border"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <Users className="w-4 h-4" />
                      Current Task
                    </div>
                    <p className="text-sm leading-relaxed">{agent.task}</p>
                  </motion.div>
                )}

                {/* Credits Progress */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      Credits
                    </div>
                    <span className="font-medium">
                      {agent.creditsUsed} / {agent.creditsEstimated}
                    </span>
                  </div>
                  <Progress value={creditProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {creditProgress.toFixed(0)}% used
                  </p>
                </motion.div>

                {/* Time Progress */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Time
                    </div>
                    <span className="font-medium">
                      {formatDuration(agent.timeElapsed)} / {formatDuration(agent.timeEstimated)}
                    </span>
                  </div>
                  <Progress value={timeProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {timeProgress.toFixed(0)}% elapsed
                  </p>
                </motion.div>

                {/* Personality Traits */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    {personalityIcons[agent.type]}
                    Personality Traits
                  </div>
                  <div className="space-y-2">
                    {(agent.personality.length > 0 ? agent.personality : traits).map((trait, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/30"
                      >
                        <span className="text-primary mt-0.5">•</span>
                        <span className="text-muted-foreground">{trait}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Warning for high credit usage */}
                {creditProgress > 80 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium">High credit usage</p>
                      <p className="text-amber-700/80 dark:text-amber-300/80">
                        This task is consuming more credits than estimated.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Footer with Cancel button */}
            {(agent.status === 'working' || agent.status === 'commuting') && (
              <div className="p-6 border-t bg-muted/30">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => onCancelTask?.(agent.id)}
                >
                  Cancel Task
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
