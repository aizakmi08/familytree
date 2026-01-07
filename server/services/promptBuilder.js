// Prompt Builder Service - Generates AI prompts from family data and theme

import { themes } from './themes.js';

/**
 * Analyze family relationships to determine generations
 */
function analyzeGenerations(members, relationships) {
  const parentOf = new Map(); // parentId -> [childIds]
  const childOf = new Map();  // childId -> [parentIds]
  const spouseOf = new Map(); // personId -> spouseId
  const siblingOf = new Map(); // personId -> [siblingIds]

  // Build relationship maps
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

  // Find root ancestors (people with no parents)
  const hasParents = new Set(childOf.keys());
  const roots = members.filter(m => !hasParents.has(m.id));

  // Assign generation levels using BFS
  const generationLevel = new Map();
  const visited = new Set();
  const queue = [];

  // Start with roots at level 0
  roots.forEach(m => {
    queue.push({ id: m.id, level: 0 });
  });

  // If no roots found, start with first member
  if (queue.length === 0 && members.length > 0) {
    queue.push({ id: members[0].id, level: 0 });
  }

  while (queue.length > 0) {
    const { id, level } = queue.shift();

    if (visited.has(id)) {
      // Update to higher level if needed
      const currentLevel = generationLevel.get(id);
      if (level > currentLevel) {
        generationLevel.set(id, level);
      }
      continue;
    }

    visited.add(id);
    generationLevel.set(id, level);

    // Spouse is same level
    const spouse = spouseOf.get(id);
    if (spouse && !visited.has(spouse)) {
      queue.push({ id: spouse, level: level });
    }

    // Children are next level
    const children = parentOf.get(id) || [];
    children.forEach(childId => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, level: level + 1 });
      }
    });

    // Siblings are same level
    const siblings = siblingOf.get(id) || [];
    siblings.forEach(sibId => {
      if (!visited.has(sibId)) {
        queue.push({ id: sibId, level: level });
      }
    });
  }

  // Add any unvisited members
  members.forEach(m => {
    if (!generationLevel.has(m.id)) {
      generationLevel.set(m.id, 0);
    }
  });

  // Group members by generation
  const generations = new Map();
  generationLevel.forEach((level, memberId) => {
    if (!generations.has(level)) generations.set(level, []);
    generations.get(level).push(memberId);
  });

  // Sort generations and group spouses together within each
  const sortedGenerations = [];
  const sortedLevels = Array.from(generations.keys()).sort((a, b) => a - b);

  sortedLevels.forEach(level => {
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

  return {
    generationLevel,
    sortedGenerations,
    parentOf,
    childOf,
    spouseOf,
    siblingOf
  };
}

/**
 * Build a detailed family structure description
 */
function buildFamilyStructure(members, relationships) {
  if (!members || members.length === 0) {
    return 'Empty family tree';
  }

  const analysis = analyzeGenerations(members, relationships);
  const { sortedGenerations, spouseOf, parentOf, childOf } = analysis;

  const getMember = (id) => members.find(m => m.id === id);

  let structure = `FAMILY TREE LAYOUT (${members.length} members)\n`;
  structure += '='.repeat(50) + '\n\n';

  // Describe each generation row
  sortedGenerations.forEach((pairs, genIndex) => {
    const genNum = genIndex + 1;
    const isTop = genIndex === 0;
    const isBottom = genIndex === sortedGenerations.length - 1;

    structure += `ROW ${genNum} ${isTop ? '(TOP - Oldest Generation)' : isBottom ? '(BOTTOM - Youngest Generation)' : '(Middle Generation)'}:\n`;

    const rowMembers = [];
    pairs.forEach(pair => {
      const names = pair.map(id => {
        const m = getMember(id);
        let name = m.name;
        if (m.birthYear) name += ` (b.${m.birthYear})`;
        return name;
      });

      if (pair.length === 2) {
        rowMembers.push(`[${names[0]} ♥ ${names[1]}]`);
      } else {
        rowMembers.push(names[0]);
      }
    });

    structure += `  → ${rowMembers.join('  |  ')}\n\n`;
  });

  // List all family connections
  structure += 'FAMILY CONNECTIONS:\n';
  structure += '-'.repeat(30) + '\n';

  // Marriages
  const marriages = new Set();
  relationships.filter(r => r.type === 'spouse').forEach(rel => {
    const key = [rel.from, rel.to].sort().join('-');
    if (!marriages.has(key)) {
      marriages.add(key);
      const from = getMember(rel.from);
      const to = getMember(rel.to);
      structure += `• ${from.name} married to ${to.name}\n`;
    }
  });

  structure += '\n';

  // Parent-child relationships
  relationships.filter(r => r.type === 'parent').forEach(rel => {
    const parent = getMember(rel.from);
    const child = getMember(rel.to);
    structure += `• ${parent.name} is parent of ${child.name}\n`;
  });

  structure += '\n';

  // Siblings
  const siblings = new Set();
  relationships.filter(r => r.type === 'sibling').forEach(rel => {
    const key = [rel.from, rel.to].sort().join('-');
    if (!siblings.has(key)) {
      siblings.add(key);
      const from = getMember(rel.from);
      const to = getMember(rel.to);
      structure += `• ${from.name} and ${to.name} are siblings\n`;
    }
  });

  return structure.trim();
}

/**
 * Generate the full prompt for Kie AI
 */
export function buildPrompt(familyData, themeId, uploadedPhotos = [], customPrompt = null, treeName = 'Family Tree') {
  const theme = themes[themeId] || themes.classic;
  const { members, relationships } = familyData;

  const familyStructure = buildFamilyStructure(members, relationships);
  const memberCount = members.length;
  const photoCount = uploadedPhotos.length;

  // Analyze generations for explicit row instructions
  const analysis = analyzeGenerations(members, relationships);
  const { sortedGenerations, spouseOf } = analysis;
  const getMember = (id) => members.find(m => m.id === id);

  // Build explicit row placement instructions
  let rowInstructions = '\nEXACT LAYOUT REQUIRED:\n';
  sortedGenerations.forEach((pairs, genIndex) => {
    const rowNum = genIndex + 1;
    const rowMembers = [];

    pairs.forEach(pair => {
      const names = pair.map(id => getMember(id).name);
      if (pair.length === 2) {
        rowMembers.push(`${names[0]} and ${names[1]} (couple)`);
      } else {
        rowMembers.push(names[0]);
      }
    });

    rowInstructions += `• ROW ${rowNum}: ${rowMembers.join(', ')}\n`;
  });

  let prompt;

  // Handle custom theme
  if (themeId === 'custom' && customPrompt) {
    prompt = `Create a PROFESSIONAL family tree artwork with the following custom style:

${customPrompt}

${familyStructure}

${rowInstructions}

CRITICAL REQUIREMENTS:
- Follow the EXACT row layout specified above
- Each portrait must have the person's name CLEARLY visible below it
- Couples (married pairs) must be placed SIDE BY SIDE with a connection between them
- Draw clear vertical lines from parents DOWN to their children
- NO overlapping portraits - maintain clear spacing
- Each of the ${memberCount} people gets exactly ONE portrait frame`;
  } else {
    // Replace placeholders in template
    prompt = theme.promptTemplate
      .replace('{{familyStructure}}', familyStructure)
      .replace(/{{memberCount}}/g, memberCount.toString());

    // Add explicit row instructions
    prompt += `\n${rowInstructions}`;
  }

  // Add photo reference instructions if photos provided
  if (photoCount > 0) {
    const photoMembers = uploadedPhotos.map(p => p.memberName).join(', ');
    prompt += `

PHOTO REFERENCES (IMPORTANT - READ CAREFULLY):
- The ${photoCount} provided photos are REFERENCE images for the faces
- Members with photos: ${photoMembers}
- CRITICAL: Create ILLUSTRATED/ARTISTIC portraits in the ${theme.name} art style
- DO NOT embed the actual photos - instead, DRAW/ILLUSTRATE each person in the theme's artistic style
- Use the photos ONLY to capture facial features, expressions, and likeness
- Each portrait should look like a hand-drawn or digitally illustrated artwork matching the overall theme
- The portraits should be stylistically consistent with the rest of the family tree artwork`;
  }

  // Final strict instructions with tree name
  prompt += `

TREE TITLE: "${treeName}"
- Display this title prominently at the TOP of the family tree
- Use elegant, decorative typography for the title
- The title should be clearly readable and centered

STRICT REQUIREMENTS:
1. Place members EXACTLY in the rows specified above
2. Couples must be ADJACENT to each other in the same row
3. Draw CLEAR connecting lines: vertical from parents to children
4. Every portrait must show the person's NAME clearly
5. Oldest generation at TOP (below title), youngest at BOTTOM
6. Professional quality suitable for framing`;

  return prompt;
}

/**
 * Build a continuation prompt for adding more members to an existing tree
 * Used in multi-pass generation when there are more than 8 photos
 */
export function buildContinuationPrompt(familyData, themeId, memberNamesToAdd, customPrompt = null) {
  const theme = themes[themeId] || themes.classic;
  const { members, relationships } = familyData;

  // Get full member info for the members we're adding
  const membersToAdd = members.filter(m => memberNamesToAdd.includes(m.name));

  // Find where these members belong in the tree
  const analysis = analyzeGenerations(members, relationships);
  const { generationLevel, spouseOf } = analysis;
  const getMember = (id) => members.find(m => m.id === id);

  // Build placement instructions for the new members
  let placementInfo = '';
  membersToAdd.forEach(member => {
    const level = generationLevel.get(member.id);
    const genNum = level + 1;

    // Find their relationships
    const spouse = spouseOf.get(member.id);
    const spouseName = spouse ? getMember(spouse)?.name : null;

    // Find parents
    const parentRels = relationships.filter(r => r.type === 'parent' && r.to === member.id);
    const parentNames = parentRels.map(r => getMember(r.from)?.name).filter(Boolean);

    // Find children
    const childRels = relationships.filter(r => r.type === 'parent' && r.from === member.id);
    const childNames = childRels.map(r => getMember(r.to)?.name).filter(Boolean);

    placementInfo += `\n• ${member.name}: Row ${genNum}`;
    if (spouseName) placementInfo += `, next to spouse ${spouseName}`;
    if (parentNames.length > 0) placementInfo += `, child of ${parentNames.join(' & ')}`;
    if (childNames.length > 0) placementInfo += `, parent of ${childNames.join(', ')}`;
  });

  let prompt;

  if (themeId === 'custom' && customPrompt) {
    prompt = `IMPORTANT: You are given an existing family tree image. Add the following family members to it while preserving the existing artwork style and all existing portraits.

ADD THESE MEMBERS TO THE TREE:${placementInfo}

CRITICAL REQUIREMENTS:
- Keep ALL existing portraits exactly as they are
- Add the new members in their correct positions based on the placement info above
- Match the exact art style of the existing image
- Maintain the same ${customPrompt} theme
- Draw connecting lines from new members to their relatives
- Each new portrait must show the person's NAME clearly below it
- Do NOT move or alter existing portraits`;
  } else {
    prompt = `IMPORTANT: You are given an existing ${theme.name} style family tree image. Add the following family members to it while preserving the existing artwork and all existing portraits.

ADD THESE MEMBERS TO THE TREE:${placementInfo}

CRITICAL REQUIREMENTS:
- Keep ALL existing portraits exactly as they are - do not modify or move them
- Add the ${membersToAdd.length} new members in their correct generational positions
- Match the exact ${theme.name} art style of the existing image
- Use the provided reference photos as REFERENCE ONLY - create ILLUSTRATED portraits in the theme's art style
- DO NOT embed actual photos - DRAW/ILLUSTRATE each person artistically
- Draw connecting lines from new members to their relatives
- Each new portrait must show the person's NAME clearly below it
- Maintain the professional quality and visual consistency`;
  }

  return prompt;
}

/**
 * Get a simplified prompt for testing
 */
export function buildTestPrompt(memberCount, themeId) {
  const theme = themes[themeId] || themes.classic;

  return `Create a ${theme.name.toLowerCase()} style family tree artwork with ${memberCount} empty portrait frames arranged in a tree hierarchy. ${theme.description}. Make it beautiful and suitable for a family keepsake.`;
}
