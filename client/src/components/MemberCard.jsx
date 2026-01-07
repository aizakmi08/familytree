import { useFamilyStore } from '../store/familyStore';

export default function MemberCard({ member, onEdit }) {
  const { deleteMember, relationships, members } = useFamilyStore();

  const getInitial = (name) => name.charAt(0).toUpperCase();

  const getYearDisplay = () => {
    if (!member.birthYear) return null;
    if (member.deathYear) {
      return `${member.birthYear} - ${member.deathYear}`;
    }
    return `b. ${member.birthYear}`;
  };

  const memberRelationships = relationships.filter(
    r => r.from === member.id || r.to === member.id
  );

  const getRelationshipSummary = () => {
    if (memberRelationships.length === 0) return null;

    const relLabels = memberRelationships.map(rel => {
      const otherMemberId = rel.from === member.id ? rel.to : rel.from;
      const otherMember = members.find(m => m.id === otherMemberId);
      if (!otherMember) return null;

      if (rel.type === 'parent') {
        if (rel.from === member.id) {
          return `Parent of ${otherMember.name}`;
        } else {
          return `Child of ${otherMember.name}`;
        }
      } else if (rel.type === 'spouse') {
        return `Spouse of ${otherMember.name}`;
      } else if (rel.type === 'sibling') {
        return `Sibling of ${otherMember.name}`;
      }
      return null;
    }).filter(Boolean);

    if (relLabels.length === 0) return null;
    if (relLabels.length <= 2) return relLabels.join(', ');
    return `${relLabels.slice(0, 2).join(', ')} +${relLabels.length - 2}`;
  };

  const relationshipSummary = getRelationshipSummary();

  return (
    <div className="group bg-surface-800 rounded-lg border border-surface-700 p-4 hover:border-surface-600 transition-all">
      <div className="flex items-start gap-3">
        {/* Photo */}
        <div className="w-12 h-12 rounded-full bg-surface-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {member.photoUrl ? (
            <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-medium text-gray-400">{getInitial(member.name)}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{member.name}</h3>
          {getYearDisplay() && (
            <p className="text-sm text-gray-500">{getYearDisplay()}</p>
          )}
          {relationshipSummary && (
            <p className="text-xs text-primary-400 mt-1 truncate">{relationshipSummary}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(member)}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-surface-700 rounded transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete ${member.name}?`)) {
                deleteMember(member.id);
              }
            }}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
