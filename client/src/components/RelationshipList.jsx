import { useFamilyStore } from '../store/familyStore';

const RELATIONSHIP_LABELS = {
  parent: 'parent of',
  spouse: 'spouse of',
  sibling: 'sibling of',
};

export default function RelationshipList() {
  const { relationships, members, deleteRelationship } = useFamilyStore();

  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    return member?.name || 'Unknown';
  };

  if (relationships.length === 0) {
    return (
      <p className="text-gray-600 text-sm">No relationships defined</p>
    );
  }

  return (
    <div className="space-y-2">
      {relationships.map((rel) => (
        <div
          key={rel.id}
          className="group bg-surface-800 rounded-lg border border-surface-700 px-3 py-2 flex items-center justify-between hover:border-surface-600 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white">{getMemberName(rel.from)}</span>
            <span className="text-gray-600">is</span>
            <span className="text-primary-400">{RELATIONSHIP_LABELS[rel.type]}</span>
            <span className="text-white">{getMemberName(rel.to)}</span>
          </div>
          <button
            onClick={() => deleteRelationship(rel.id)}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 rounded transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
