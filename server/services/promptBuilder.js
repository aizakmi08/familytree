// Prompt Builder Service - Generates AI prompts from family data and theme

import { themes } from './themes.js';

/**
 * Build a family structure description from members and relationships
 */
function buildFamilyStructure(members, relationships) {
  if (!members || members.length === 0) {
    return 'Empty family tree';
  }

  // Build a map of relationships
  const relMap = new Map();
  relationships.forEach((rel) => {
    if (!relMap.has(rel.from)) {
      relMap.set(rel.from, []);
    }
    relMap.get(rel.from).push({ to: rel.to, type: rel.type });
  });

  // Build member descriptions
  const memberDescriptions = members.map((member) => {
    let desc = member.name;
    if (member.birthYear) {
      desc += ` (born ${member.birthYear}`;
      if (member.deathYear) {
        desc += ` - ${member.deathYear}`;
      }
      desc += ')';
    }
    return desc;
  });

  // Build relationship descriptions
  const relationshipDescriptions = relationships.map((rel) => {
    const fromMember = members.find((m) => m.id === rel.from);
    const toMember = members.find((m) => m.id === rel.to);
    
    if (!fromMember || !toMember) return null;
    
    const relationLabel = {
      parent: 'is parent of',
      child: 'is child of',
      spouse: 'is spouse of',
      sibling: 'is sibling of',
    }[rel.type];
    
    return `${fromMember.name} ${relationLabel} ${toMember.name}`;
  }).filter(Boolean);

  return `
FAMILY MEMBERS (${members.length} people):
${memberDescriptions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

RELATIONSHIPS:
${relationshipDescriptions.length > 0 ? relationshipDescriptions.join('\n') : 'No relationships defined'}
`.trim();
}

/**
 * Generate the full prompt for DALL-E
 */
export function buildPrompt(familyData, themeId) {
  const theme = themes[themeId] || themes.classic;
  const { members, relationships } = familyData;
  
  const familyStructure = buildFamilyStructure(members, relationships);
  const memberCount = members.length;
  
  // Replace placeholders in template
  let prompt = theme.promptTemplate
    .replace('{{familyStructure}}', familyStructure)
    .replace(/{{memberCount}}/g, memberCount.toString());
  
  // Add general instructions
  prompt += `

IMPORTANT REQUIREMENTS:
- This is a family tree visualization, NOT portraits of real people
- Include exactly ${memberCount} portrait placeholder frames arranged in a family tree hierarchy
- Each portrait frame should have the person's name clearly labeled nearby
- The image should be suitable for compositing real photos into the portrait frames later
- Portrait frames should be clearly defined circular or oval shapes
- Make the overall composition balanced and visually appealing
- Image should be high quality, detailed, and professional`;

  return prompt;
}

/**
 * Get a simplified prompt for testing
 */
export function buildTestPrompt(memberCount, themeId) {
  const theme = themes[themeId] || themes.classic;
  
  return `Create a ${theme.name.toLowerCase()} style family tree artwork with ${memberCount} empty portrait frames arranged in a tree hierarchy. ${theme.description}. Make it beautiful and suitable for a family keepsake.`;
}

