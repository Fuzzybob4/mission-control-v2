'use client';

import { motion } from 'framer-motion';
import { AgentData, AgentStatus } from './Agent';
import { cn } from '@/lib/utils';

interface AgentMapProps {
  agents: AgentData[];
  selectedAgentId?: string;
  onAgentClick?: (agent: AgentData) => void;
  isNight?: boolean;
  className?: string;
}

interface Building {
  id: string;
  x: number;
  y: number;
  type: 'home' | 'office';
  name: string;
  occupantIds: string[];
}

interface Road {
  id: string;
  from: string;
  to: string;
  path: string;
}

// Pre-defined map layout
const buildings: Building[] = [
  // Homes at bottom
  { id: 'home-1', x: 100, y: 400, type: 'home', name: 'Cottage Lane', occupantIds: [] },
  { id: 'home-2', x: 250, y: 420, type: 'home', name: 'Maple Street', occupantIds: [] },
  { id: 'home-3', x: 400, y: 400, type: 'home', name: 'Oak Avenue', occupantIds: [] },
  { id: 'home-4', x: 550, y: 430, type: 'home', name: 'Pine Road', occupantIds: [] },
  { id: 'home-5', x: 700, y: 410, type: 'home', name: 'Willow Way', occupantIds: [] },
  
  // Offices at top
  { id: 'office-1', x: 150, y: 80, type: 'office', name: 'Tech Tower', occupantIds: [] },
  { id: 'office-2', x: 350, y: 60, type: 'office', name: 'Innovation Hub', occupantIds: [] },
  { id: 'office-3', x: 550, y: 70, type: 'office', name: 'Creative Center', occupantIds: [] },
  { id: 'office-4', x: 750, y: 85, type: 'office', name: 'Data Dome', occupantIds: [] },
];

// Curved roads connecting homes to offices
const roads: Road[] = [
  { id: 'road-1', from: 'home-1', to: 'office-1', path: 'M 100 400 Q 125 250 150 130' },
  { id: 'road-2', from: 'home-1', to: 'office-2', path: 'M 100 400 Q 225 230 350 110' },
  { id: 'road-3', from: 'home-2', to: 'office-1', path: 'M 250 420 Q 200 275 150 130' },
  { id: 'road-4', from: 'home-2', to: 'office-2', path: 'M 250 420 Q 300 240 350 110' },
  { id: 'road-5', from: 'home-3', to: 'office-2', path: 'M 400 400 Q 375 230 350 110' },
  { id: 'road-6', from: 'home-3', to: 'office-3', path: 'M 400 400 Q 475 235 550 120' },
  { id: 'road-7', from: 'home-4', to: 'office-3', path: 'M 550 430 Q 550 250 550 120' },
  { id: 'road-8', from: 'home-4', to: 'office-4', path: 'M 550 430 Q 650 257 750 135' },
  { id: 'road-9', from: 'home-5', to: 'office-3', path: 'M 700 410 Q 625 265 550 120' },
  { id: 'road-10', from: 'home-5', to: 'office-4', path: 'M 700 410 Q 725 247 750 135' },
];

// Get agent position based on status and assigned buildings
function getAgentPosition(agent: AgentData): { x: number; y: number } {
  // In a real app, these would come from agent.homeId and agent.officeId
  const homeIndex = parseInt(agent.id) % 5;
  const officeIndex = (parseInt(agent.id) + 2) % 4;
  
  const home = buildings[homeIndex];
  const office = buildings[5 + officeIndex];
  
  switch (agent.status) {
    case 'idle':
    case 'done':
      return { x: home.x, y: home.y };
    case 'working':
      return { x: office.x, y: office.y };
    case 'commuting':
      // Position along the road (simplified - would interpolate along bezier in real app)
      return {
        x: (home.x + office.x) / 2 + Math.sin(Date.now() / 1000) * 20,
        y: (home.y + office.y) / 2,
      };
    case 'returning':
      return {
        x: (office.x + home.x) / 2 - Math.sin(Date.now() / 1000) * 20,
        y: (office.y + home.y) / 2,
      };
    default:
      return { x: home.x, y: home.y };
  }
}

export function AgentMap({ 
  agents, 
  selectedAgentId, 
  onAgentClick, 
  isNight = false,
  className 
}: AgentMapProps) {
  // Update building occupants
  const updatedBuildings = buildings.map(building => ({
    ...building,
    occupantIds: agents
      .filter(a => {
        if (building.type === 'office') {
          return a.status === 'working';
        }
        return a.status === 'idle' || a.status === 'done';
      })
      .map(a => a.id),
  }));

  return (
    <div className={cn(
      'relative w-full h-[500px] rounded-2xl overflow-hidden border-2',
      isNight 
        ? 'bg-slate-900 border-slate-700' 
        : 'bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 border-slate-200'
    )}>
      {/* SVG Map */}
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 900 500"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background elements */}
        {/* Sun or Moon */}
        <motion.circle
          cx={isNight ? 750 : 100}
          cy={isNight ? 80 : 60}
          r={isNight ? 30 : 40}
          fill={isNight ? '#f1f5f9' : '#fbbf24'}
          animate={{
            scale: isNight ? [1, 1.05, 1] : [1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Stars (night only) */}
        {isNight && (
          <>
            {[...Array(20)].map((_, i) => (
              <motion.circle
                key={`star-${i}`}
                cx={50 + (i * 40) % 800}
                cy={30 + (i * 23) % 100}
                r={1.5}
                fill="white"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ 
                  duration: 2 + (i % 3), 
                  repeat: Infinity, 
                  delay: i * 0.1 
                }}
              />
            ))}
          </>
        )}

        {/* Clouds (day only) */}
        {!isNight && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.g
                key={`cloud-${i}`}
                initial={{ x: -100 }}
                animate={{ x: 1000 }}
                transition={{ 
                  duration: 30 + i * 10, 
                  repeat: Infinity, 
                  ease: 'linear',
                  delay: i * 5
                }}
              >
                <ellipse cx={100} cy={50 + i * 30} rx={40} ry={20} fill="white" opacity={0.7} />
                <ellipse cx={130} cy={45 + i * 30} rx={35} ry={25} fill="white" opacity={0.7} />
                <ellipse cx={70} cy={55 + i * 30} rx={30} ry={18} fill="white" opacity={0.7} />
              </motion.g>
            ))}
          </>
        )}

        {/* Roads */}
        {roads.map((road) => (
          <g key={road.id}>
            <path
              d={road.path}
              stroke={isNight ? '#475569' : '#94a3b8'}
              strokeWidth={12}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={road.path}
              stroke={isNight ? '#64748b' : '#cbd5e1'}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="10 5"
            />
          </g>
        ))}

        {/* Buildings */}
        {updatedBuildings.map((building) => (
          <g key={building.id}>
            {/* Building shadow */}
            <ellipse
              cx={building.x}
              cy={building.y + 40}
              rx={35}
              ry={10}
              fill={isNight ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}
            />
            
            {/* Building body */}
            {building.type === 'home' ? (
              // Cozy house
              <g>
                {/* House base */}
                <rect
                  x={building.x - 25}
                  y={building.y - 20}
                  width={50}
                  height={40}
                  rx={4}
                  fill={isNight ? '#1e293b' : '#f8fafc'}
                  stroke={isNight ? '#475569' : '#94a3b8'}
                  strokeWidth={2}
                />
                {/* Roof */}
                <path
                  d={`M ${building.x - 30} ${building.y - 20} L ${building.x} ${building.y - 45} L ${building.x + 30} ${building.y - 20}`}
                  fill={isNight ? '#7f1d1d' : '#dc2626'}
                  stroke={isNight ? '#991b1b' : '#b91c1c'}
                  strokeWidth={2}
                />
                {/* Door */}
                <rect
                  x={building.x - 8}
                  y={building.y + 5}
                  width={16}
                  height={15}
                  fill={isNight ? '#451a03' : '#92400e'}
                  rx={2}
                />
                {/* Windows */}
                <rect
                  x={building.x - 18}
                  y={building.y - 10}
                  width={12}
                  height={12}
                  fill={building.occupantIds.length > 0 && !isNight ? '#fbbf24' : isNight ? '#1e293b' : '#94a3b8'}
                  rx={1}
                  stroke={isNight ? '#475569' : '#64748b'}
                />
                <rect
                  x={building.x + 6}
                  y={building.y - 10}
                  width={12}
                  height={12}
                  fill={building.occupantIds.length > 0 && !isNight ? '#fbbf24' : isNight ? '#1e293b' : '#94a3b8'}
                  rx={1}
                  stroke={isNight ? '#475569' : '#64748b'}
                />
              </g>
            ) : (
              // Modern office building
              <g>
                {/* Building base */}
                <rect
                  x={building.x - 30}
                  y={building.y - 60}
                  width={60}
                  height={80}
                  rx={4}
                  fill={isNight ? '#0f172a' : '#e2e8f0'}
                  stroke={isNight ? '#334155' : '#64748b'}
                  strokeWidth={2}
                />
                {/* Windows grid */}
                {[0, 1, 2].map((row) =>
                  [0, 1].map((col) => (
                    <rect
                      key={`${row}-${col}`}
                      x={building.x - 20 + col * 22}
                      y={building.y - 50 + row * 20}
                      width={16}
                      height={14}
                      fill={building.occupantIds.length > 0 ? '#fbbf24' : isNight ? '#1e293b' : '#94a3b8'}
                      rx={1}
                      animate={building.occupantIds.length > 0 ? {
                        fill: ['#fbbf24', '#f59e0b', '#fbbf24'],
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  ))
                )}
                {/* Antenna */}
                <line
                  x1={building.x}
                  y1={building.y - 60}
                  x2={building.x}
                  y2={building.y - 75}
                  stroke={isNight ? '#475569' : '#64748b'}
                  strokeWidth={2}
                />
                <circle
                  cx={building.x}
                  cy={building.y - 75}
                  r={3}
                  fill="#ef4444"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </g>
            )}
          </g>
        ))}

        {/* Moving cars on roads */}
        {agents
          .filter(a => a.status === 'commuting' || a.status === 'returning')
          .map((agent) => {
            const homeIndex = parseInt(agent.id) % 5;
            const officeIndex = (parseInt(agent.id) + 2) % 4;
            const home = buildings[homeIndex];
            const office = buildings[5 + officeIndex];
            
            return (
              <motion.g key={`car-${agent.id}`}>
                <motion.circle
                  r={8}
                  fill={agent.status === 'commuting' ? '#3b82f6' : '#8b5cf6'}
                  stroke="white"
                  strokeWidth={2}
                  initial={{ x: agent.status === 'commuting' ? home.x : office.x, y: agent.status === 'commuting' ? home.y : office.y }}
                  animate={{
                    x: agent.status === 'commuting' ? office.x : home.x,
                    y: agent.status === 'commuting' ? office.y : home.y,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <motion.text
                  fontSize={10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  initial={{ x: agent.status === 'commuting' ? home.x : office.x, y: agent.status === 'commuting' ? home.y : office.y }}
                  animate={{
                    x: agent.status === 'commuting' ? office.x : home.x,
                    y: agent.status === 'commuting' ? office.y : home.y,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  🚗
                </motion.text>
              </motion.g>
            );
          })}
      </svg>

      {/* Agent overlays positioned absolutely */}
      {agents.map((agent) => {
        const pos = getAgentPosition(agent);
        const isSelected = selectedAgentId === agent.id;
        
        return (
          <motion.div
            key={agent.id}
            className="absolute"
            style={{
              left: `${(pos.x / 900) * 100}%`,
              top: `${(pos.y / 500) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => onAgentClick?.(agent)}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg cursor-pointer transition-all',
                agent.type === 'redfox' && 'bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-400/50',
                agent.type === 'lonestar' && 'bg-gradient-to-br from-yellow-300 to-amber-500 shadow-yellow-400/50',
                agent.type === 'heroes' && 'bg-gradient-to-br from-purple-400 to-indigo-600 shadow-purple-400/50',
                isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110'
              )}
            >
              {agent.type === 'redfox' && '🦊'}
              {agent.type === 'lonestar' && '💡'}
              {agent.type === 'heroes' && '🃏'}
            </div>
            
            {/* Status indicator */}
            <div
              className={cn(
                'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background',
                agent.status === 'idle' && 'bg-emerald-400',
                agent.status === 'commuting' && 'bg-blue-400',
                agent.status === 'working' && 'bg-amber-400',
                agent.status === 'returning' && 'bg-purple-400',
                agent.status === 'done' && 'bg-gray-400'
              )}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

export { buildings, roads };
