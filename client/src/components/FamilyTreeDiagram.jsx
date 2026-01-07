import { useMemo, useRef, useEffect, useState } from 'react';
import { useFamilyStore } from '../store/familyStore';

const RELATIONSHIP_COLORS = {
  parent: '#d4a04a',
  spouse: '#ef4444',
  sibling: '#3b82f6',
};

export default function FamilyTreeDiagram({ onEditMember }) {
  const { members, relationships } = useFamilyStore();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(400, rect.width),
          height: Math.max(300, 120 * Math.max(1, Math.ceil(members.length / 3)))
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [members.length]);

  // Analyze generations - same logic as server
  const { nodePositions, generationRows, connectionLines } = useMemo(() => {
    if (members.length === 0) return { nodePositions: {}, generationRows: [], connectionLines: [] };

    const { width, height } = dimensions;

    // Build relationship maps
    const parentOf = new Map();
    const childOf = new Map();
    const spouseOf = new Map();
    const siblingOf = new Map();

    relationships.forEach(rel => {
      if (rel.type === 'parent') {
        if (!parentOf.has(rel.from)) parentOf.set(rel.from, []);
        parentOf.get(rel.from).push(rel.to);
        if (!childOf.has(rel.to)) childOf.set(rel.to, []);
        childOf.get(rel.to).push(rel.from);
      } else if (rel.type === 'spouse') {
        spouseOf.set(rel.from, rel.to);
        spouseOf.set(rel.to, rel.from);
      } else if (rel.type === 'sibling') {
        if (!siblingOf.has(rel.from)) siblingOf.set(rel.from, []);
        if (!siblingOf.has(rel.to)) siblingOf.set(rel.to, []);
        siblingOf.get(rel.from).push(rel.to);
        siblingOf.get(rel.to).push(rel.from);
      }
    });

    // Find root ancestors (no parents)
    const hasParents = new Set(childOf.keys());
    const roots = members.filter(m => !hasParents.has(m.id));

    // BFS to assign generation levels
    const generationLevel = new Map();
    const visited = new Set();
    const queue = roots.length > 0
      ? roots.map(m => ({ id: m.id, level: 0 }))
      : members.length > 0 ? [{ id: members[0].id, level: 0 }] : [];

    while (queue.length > 0) {
      const { id, level } = queue.shift();

      if (visited.has(id)) {
        const currentLevel = generationLevel.get(id);
        if (level > currentLevel) generationLevel.set(id, level);
        continue;
      }

      visited.add(id);
      generationLevel.set(id, level);

      // Spouse same level
      const spouse = spouseOf.get(id);
      if (spouse && !visited.has(spouse)) {
        queue.push({ id: spouse, level });
      }

      // Children next level
      (parentOf.get(id) || []).forEach(childId => {
        if (!visited.has(childId)) {
          queue.push({ id: childId, level: level + 1 });
        }
      });

      // Siblings same level
      (siblingOf.get(id) || []).forEach(sibId => {
        if (!visited.has(sibId)) {
          queue.push({ id: sibId, level });
        }
      });
    }

    // Add unvisited members
    members.forEach(m => {
      if (!generationLevel.has(m.id)) {
        generationLevel.set(m.id, 0);
      }
    });

    // Group by generation
    const generations = new Map();
    generationLevel.forEach((level, memberId) => {
      if (!generations.has(level)) generations.set(level, []);
      generations.get(level).push(memberId);
    });

    // Sort and pair spouses within each generation
    const sortedGenerations = [];
    Array.from(generations.keys()).sort((a, b) => a - b).forEach(level => {
      const memberIds = generations.get(level);
      const pairs = [];
      const processed = new Set();

      memberIds.forEach(id => {
        if (processed.has(id)) return;
        const spouse = spouseOf.get(id);
        if (spouse && memberIds.includes(spouse) && !processed.has(spouse)) {
          pairs.push([id, spouse]);
          processed.add(id);
          processed.add(spouse);
        } else {
          pairs.push([id]);
          processed.add(id);
        }
      });

      sortedGenerations.push(pairs);
    });

    // Calculate positions
    const padding = 40;
    const nodeSize = 56;
    const coupleGap = 20;
    const numRows = sortedGenerations.length;
    const rowHeight = (height - padding * 2) / Math.max(numRows, 1);

    const positions = {};
    const rows = [];

    sortedGenerations.forEach((pairs, rowIndex) => {
      const y = padding + rowIndex * rowHeight + nodeSize / 2 + 10;

      // Calculate total width needed for this row
      let totalWidth = 0;
      pairs.forEach((pair, i) => {
        totalWidth += pair.length * nodeSize + (pair.length - 1) * coupleGap;
        if (i < pairs.length - 1) totalWidth += 60; // gap between pairs
      });

      let startX = (width - totalWidth) / 2;
      const rowMembers = [];

      pairs.forEach((pair, pairIndex) => {
        pair.forEach((memberId, memberIndex) => {
          const x = startX + memberIndex * (nodeSize + coupleGap) + nodeSize / 2;
          positions[memberId] = { x, y, row: rowIndex };
          rowMembers.push(memberId);
        });
        startX += pair.length * nodeSize + (pair.length - 1) * coupleGap + 60;
      });

      rows.push(rowMembers);
    });

    // Build connection lines
    const lines = [];

    relationships.forEach(rel => {
      const fromPos = positions[rel.from];
      const toPos = positions[rel.to];
      if (!fromPos || !toPos) return;

      lines.push({
        id: rel.id,
        type: rel.type,
        from: fromPos,
        to: toPos,
      });
    });

    return { nodePositions: positions, generationRows: rows, connectionLines: lines };
  }, [members, relationships, dimensions]);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm">Add family members to see your tree</p>
      </div>
    );
  }

  const nodeRadius = 28;

  return (
    <div ref={containerRef} className="relative w-full" style={{ minHeight: `${dimensions.height}px` }}>
      {/* SVG for connections */}
      <svg width={dimensions.width} height={dimensions.height} className="absolute inset-0 pointer-events-none">
        {connectionLines.map((line) => {
          const { from, to, type, id } = line;
          const color = RELATIONSHIP_COLORS[type] || '#666';

          if (type === 'parent') {
            // Parent-child: vertical drop line
            const midY = (from.y + to.y) / 2;
            return (
              <g key={id}>
                <path
                  d={`M ${from.x} ${from.y + nodeRadius}
                      L ${from.x} ${midY}
                      L ${to.x} ${midY}
                      L ${to.x} ${to.y - nodeRadius - 8}`}
                  stroke={color}
                  strokeWidth="2"
                  fill="none"
                  opacity="0.8"
                />
                <polygon
                  points={`${to.x},${to.y - nodeRadius} ${to.x - 5},${to.y - nodeRadius - 8} ${to.x + 5},${to.y - nodeRadius - 8}`}
                  fill={color}
                  opacity="0.8"
                />
              </g>
            );
          } else if (type === 'spouse') {
            // Spouse: horizontal connection with heart
            const minX = Math.min(from.x, to.x) + nodeRadius;
            const maxX = Math.max(from.x, to.x) - nodeRadius;
            const midX = (from.x + to.x) / 2;
            return (
              <g key={id}>
                <line
                  x1={minX}
                  y1={from.y}
                  x2={maxX}
                  y2={to.y}
                  stroke={color}
                  strokeWidth="2"
                  opacity="0.8"
                />
                <text
                  x={midX}
                  y={from.y - 6}
                  textAnchor="middle"
                  fill={color}
                  fontSize="14"
                >
                  ♥
                </text>
              </g>
            );
          } else if (type === 'sibling') {
            // Sibling: curved line above
            const midX = (from.x + to.x) / 2;
            const controlY = Math.min(from.y, to.y) - 25;
            return (
              <g key={id}>
                <path
                  d={`M ${from.x} ${from.y - nodeRadius}
                      Q ${midX} ${controlY} ${to.x} ${to.y - nodeRadius}`}
                  stroke={color}
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                  fill="none"
                  opacity="0.6"
                />
              </g>
            );
          }
          return null;
        })}
      </svg>

      {/* Member nodes */}
      {members.map((member) => {
        const pos = nodePositions[member.id];
        if (!pos) return null;

        return (
          <div
            key={member.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: pos.x, top: pos.y, zIndex: 10 }}
            onClick={() => onEditMember?.(member)}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-2 border-primary-500/60 bg-surface-800 overflow-hidden shadow-lg group-hover:border-primary-400 group-hover:scale-110 transition-all">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-primary-400 bg-gradient-to-br from-surface-700 to-surface-900">
                      {getInitials(member.name)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-surface-800 rounded-full border border-surface-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
              <div className="mt-1.5 px-2 py-0.5 bg-surface-800/95 rounded border border-surface-700 max-w-[90px]">
                <p className="text-xs font-medium text-gray-200 truncate text-center">{member.name}</p>
                {member.birthYear && (
                  <p className="text-[10px] text-gray-500 text-center">b. {member.birthYear}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-4 text-xs bg-surface-900/90 rounded-lg py-1.5 px-3">
        <div className="flex items-center gap-1.5">
          <svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke="#d4a04a" strokeWidth="2"/></svg>
          <span className="text-gray-400">Parent→Child</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-red-500 text-sm">♥</span>
          <span className="text-gray-400">Spouse</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,3"/></svg>
          <span className="text-gray-400">Sibling</span>
        </div>
      </div>
    </div>
  );
}
