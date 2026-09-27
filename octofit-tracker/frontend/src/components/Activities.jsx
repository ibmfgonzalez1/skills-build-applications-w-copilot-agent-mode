import CollectionView from './CollectionView.jsx'
import { useCollection } from '../hooks/useCollection.js'
import { formatDate, personName, titleCase } from '../format.js'

const codespaceName = import.meta.env.VITE_CODESPACE_NAME?.trim()
const activitiesApiUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev/api/activities`
  : 'http://localhost:8000/api/activities'

export default function Activities() {
  const collection = useCollection(`${activitiesApiUrl}/`)

  return (
    <CollectionView
      eyebrow="MOVEMENT / LOG"
      title="Activities"
      description="Recent training sessions across the OctoFit community."
      collection={collection}
      emptyTitle="No activities yet"
      emptyMessage="Activity entries will appear here when they are recorded."
      columns={[
        { key: 'type', label: 'Activity', render: (record) => <span className="type-label">{titleCase(record.type)}</span> },
        { key: 'userId', label: 'Athlete', render: (record) => <span className="primary-cell">{personName(record.userId)}</span> },
        { key: 'teamId', label: 'Team', render: (record) => personName(record.teamId) },
        { key: 'durationMinutes', label: 'Duration', render: (record) => `${record.durationMinutes ?? '-'} min` },
        { key: 'points', label: 'Points', render: (record) => <span className="points-cell">{record.points ?? '-'}</span> },
        { key: 'occurredAt', label: 'Date', render: (record) => formatDate(record.occurredAt) },
      ]}
    />
  )
}