import CollectionView from './CollectionView.jsx'
import { useCollection } from '../hooks/useCollection.js'
import { titleCase } from '../format.js'
import { API_BASE_URL } from '../api.js'

export default function Workouts() {
  const collection = useCollection(`${API_BASE_URL}/api/workouts/`)

  return (
    <CollectionView
      eyebrow="TRAINING / LIBRARY"
      title="Workouts"
      description="Sessions available for the next training block."
      collection={collection}
      emptyTitle="Workout library is empty"
      emptyMessage="Suggested sessions will appear here when workouts are added."
      columns={[
        { key: 'title', label: 'Workout', render: (record) => <span className="primary-cell">{record.title ?? 'Untitled workout'}</span> },
        { key: 'description', label: 'Details', render: (record) => record.description ?? '-' },
        { key: 'activityType', label: 'Focus', render: (record) => <span className="type-label">{titleCase(record.activityType)}</span> },
        { key: 'difficulty', label: 'Level', render: (record) => <span className={`difficulty-tag difficulty-${record.difficulty ?? 'default'}`}>{titleCase(record.difficulty)}</span> },
        { key: 'durationMinutes', label: 'Duration', render: (record) => `${record.durationMinutes ?? '-'} min` },
      ]}
    />
  )
}