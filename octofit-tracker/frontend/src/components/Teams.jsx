import CollectionView from './CollectionView.jsx'
import { useCollection } from '../hooks/useCollection.js'
import { personName } from '../format.js'
import { API_BASE_URL } from '../api.js'

export default function Teams() {
  const collection = useCollection(`${API_BASE_URL}/api/teams/`)

  return (
    <CollectionView
      eyebrow="COMMUNITY / GROUPS"
      title="Teams"
      description="Groups training together across the school community."
      collection={collection}
      emptyTitle="No teams created"
      emptyMessage="Team details will appear here when groups are added."
      columns={[
        { key: 'name', label: 'Team', render: (record) => <span className="primary-cell">{record.name ?? 'Untitled team'}</span> },
        { key: 'description', label: 'About', render: (record) => record.description || '-' },
        { key: 'members', label: 'Members', render: (record) => Array.isArray(record.members) ? record.members.map(personName).join(', ') || 'No members' : '-' },
        { key: 'memberCount', label: 'Size', render: (record) => Array.isArray(record.members) ? `${record.members.length} ${record.members.length === 1 ? 'member' : 'members'}` : '-' },
      ]}
    />
  )
}