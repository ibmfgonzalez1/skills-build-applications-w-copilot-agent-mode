import CollectionView from './CollectionView.jsx'
import { useCollection } from '../hooks/useCollection.js'
import { personName, titleCase } from '../format.js'

const codespaceName = import.meta.env.VITE_CODESPACE_NAME?.trim()
const leaderboardApiUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev/api/leaderboard`
  : 'http://localhost:8000/api/leaderboard'

export default function Leaderboard() {
  const period = new Date().toISOString().slice(0, 7)
  const collection = useCollection(`${leaderboardApiUrl}/`, `period=${period}`)

  return (
    <CollectionView
      eyebrow={`STANDINGS / ${period}`}
      title="Leaderboard"
      description="Monthly points across athletes and teams."
      collection={collection}
      emptyTitle="Standings are clear"
      emptyMessage="Scores will appear when activities are logged for this month."
      columns={[
        { key: 'rank', label: 'Rank', render: (record) => <span className={`rank-cell ${record.rank === 1 ? 'rank-first' : ''}`}>{String(record.rank ?? '-').padStart(2, '0')}</span> },
        { key: 'participantId', label: 'Participant', render: (record) => <span className="primary-cell">{personName(record.participantId)}</span> },
        { key: 'participantType', label: 'Division', render: (record) => <span className="type-label">{titleCase(record.participantType)}</span> },
        { key: 'points', label: 'Points', render: (record) => <span className="points-cell">{record.points ?? 0}</span> },
      ]}
    />
  )
}