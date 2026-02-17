'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type AgentStatus = 'idle' | 'commuting' | 'working' | 'returning' | 'done';
export type AgentType = 'redfox' | 'lonestar' | 'heroes';

export interface AgentData {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  task?: string;
  creditsUsed: number;
  creditsEstimated: number;
  timeElapsed: number;
  timeEstimated: number;
  personality: string[];
  x?: number;
  y?: number;
}

interface AgentProps {
  agent: AgentData;
  onClick?: () => void;
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const agentConfig = {
  redfox: {
    emoji: '🦊',
    color: 'from-orange-400 to-red-500',
    glow: 'shadow-orange-400/50',
    vehicle: '🚗',
    name: 'RedFox',
  },
  lonestar: {
    emoji: '💡',
    color: 'from-yellow-300 to-amber-500',
    glow: 'shadow-yellow-400/50',
    vehicle: '🔮',
    name: 'Lone Star',
  },
  heroes: {
    emoji: '🃏',
    color: 'from-purple-400 to-indigo-600',
    glow: 'shadow-purple-400/50',
    vehicle: '🎴',
    name: 'Heroes',
  },
};

const statusConfig = {
  idle: {
    animation: 'bounce',
    indicator: 'bg-emerald-400',
    label: 'Idle',
  },
  commuting: {
    animation: 'drive',
    indicator: 'bg-blue-400',
    label: 'Commuting',
  },
  working: {
    animation: 'type',
    indicator: 'bg-amber-400',
    label: 'Working',
  },
  returning: {
    animation: 'drive',
    indicator: 'bg-purple-400',
    label: 'Returning',
  },
  done: {
    animation: 'bounce',
    indicator: 'bg-gray-400',
    label: 'Done',
  },
};

export function Agent({ agent, onClick, isSelected, size = 'md', className }: AgentProps) {
  const config = agentConfig[agent.type];
  const status = statusConfig[agent.status];

  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  const getAnimation = () => {
    switch (status.animation) {
      case 'bounce':
        return {
          y: [0, -4, 0],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        };
      case 'type':
        return {
          scale: [1, 0.95, 1],
          transition: {
            duration: 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className={cn(
        'relative cursor-pointer select-none',
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={getAnimation()}
    >
      {/* Status indicator ring */}
      {isSelected && (
        <motion.div
          className={cn(
            'absolute -inset-2 rounded-full bg-gradient-to-r',
            config.color,
            'opacity-50'
          )}
          layoutId={`ring-${agent.id}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          exit={{ scale: 0.8, opacity: 0 }}
        />
      )}

      {/* Main avatar container */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full',
          'bg-gradient-to-br',
          config.color,
          sizeClasses[size],
          'shadow-lg',
          config.glow,
          isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-background'
        )}
      >
        <span className="drop-shadow-md">{config.emoji}</span>

        {/* Status dot */}
        <motion.div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background',
            status.indicator
          )}
          animate={{
            scale: agent.status === 'working' ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Vehicle indicator for commuting/returning */}
      {(agent.status === 'commuting' || agent.status === 'returning') && size !== 'sm' && (
        <motion.div
          className="absolute -top-1 -right-1 text-sm"
          animate={{
            x: [0, 2, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {config.vehicle}
        </motion.div>
      )}
    </motion.div>
  );
}

export function AgentMini({ agent, className }: { agent: AgentData; className?: string }) {
  const config = agentConfig[agent.type];
  const status = statusConfig[agent.status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          status.indicator
        )}
      />
      <span className="text-sm">{config.emoji}</span>
      <span className="text-sm font-medium truncate">{agent.name}</span>
    </div>
  );
}

export { agentConfig, statusConfig };
