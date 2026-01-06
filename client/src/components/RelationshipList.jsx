import { useFamilyStore } from '../store/familyStore';

const RELATIONSHIP_ICONS = {
  parent: '👨',
  child: '👶',
  spouse: '💑',
  sibling: '👫',
};

const RELATIONSHIP_LABELS = {
  parent: 'Parent of',
  child: 'Child of',
  spouse: 'Spouse of',
  sibling: 'Sibling of',
};

export default function RelationshipList() {
  const { relationships, members, deleteRelationship } = useFamilyStore();

  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    return member?.name || 'Unknown';
  };

  if (relationships.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No relationships defined yet</p>
        <p className="text-sm mt-1">Click the link icon on a member to add one</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {relationships.map((rel) => (
        <div
          key={rel.id}
          className="group bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-lg">{RELATIONSHIP_ICONS[rel.type]}</span>
            <span className="font-medium text-gray-900">{getMemberName(rel.from)}</span>
            <span className="text-gray-400 mx-1">is</span>
            <span className="text-primary-600 font-medium">{RELATIONSHIP_LABELS[rel.type].toLowerCase()}</span>
            <span className="font-medium text-gray-900">{getMemberName(rel.to)}</span>
          </div>
          <button
            onClick={() => deleteRelationship(rel.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
            title="Remove relationship"
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

