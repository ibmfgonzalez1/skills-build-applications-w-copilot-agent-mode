import CollectionView from './CollectionView.jsx'
import { useCollection } from '../hooks/useCollection.js'
import { API_BASE_URL } from '../api.js'

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'O'
}

export default function Users() {
  const collection = useCollection(`${API_BASE_URL}/api/users/`)

  return (
    <CollectionView
      eyebrow="COMMUNITY / ATHLETES"
      title="Users"
      description="Member profiles registered with OctoFit Tracker."
      collection={collection}
      emptyTitle="No profiles found"
      emptyMessage="Registered member profiles will appear here."
      columns={[
        { key: 'name', label: 'Athlete', render: (record) => <span className="person-cell"><span className="avatar-mark">{initials(record.name)}</span><span className="primary-cell">{record.name ?? 'Unnamed member'}</span></span> },
        { key: 'email', label: 'Email', render: (record) => record.email ?? '-' },
        { key: 'createdAt', label: 'Joined', render: (record) => record.createdAt ? new Date(record.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '-' },
      ]}
    />
  )
}