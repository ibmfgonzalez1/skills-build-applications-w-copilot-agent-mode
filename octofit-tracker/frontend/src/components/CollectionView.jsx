export default function CollectionView({
  eyebrow,
  title,
  description,
  collection,
  columns,
  emptyTitle,
  emptyMessage,
}) {
  const { records, count, loading, error, next } = collection

  return (
    <section className="resource-view" aria-labelledby="resource-title">
      <div className="view-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="resource-title">{title}</h1>
          <p className="view-description">{description}</p>
        </div>
        <div className="record-total" aria-label={`${count} total records`}>
          <strong>{count}</strong>
          <span>{count === 1 ? 'record' : 'records'}</span>
        </div>
      </div>

      <div className="data-panel">
        <div className="data-panel-heading">
          <div>
            <span className="panel-kicker">OCTOFIT TRACKER</span>
            <h2>{title} overview</h2>
          </div>
          <span className="live-label"><span /> Live data</span>
        </div>

        {loading ? (
          <div className="table-state" role="status">Loading {title.toLowerCase()}...</div>
        ) : error ? (
          <div className="table-state error-state" role="alert">
            <strong>Could not load {title.toLowerCase()}</strong>
            <span>{error}</span>
          </div>
        ) : records.length === 0 ? (
          <div className="table-state empty-state">
            <strong>{emptyTitle}</strong>
            <span>{emptyMessage}</span>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="tracker-table">
                <thead>
                  <tr>
                    {columns.map((column) => <th key={column.key}>{column.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record._id ?? record.id ?? `${title}-${index}`}>
                      {columns.map((column) => (
                        <td key={column.key}>
                          {column.render ? column.render(record, index) : record[column.key] ?? '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>Showing {records.length} {records.length === 1 ? 'entry' : 'entries'}{count > records.length ? ` of ${count}` : ''}</span>
              {next && <span className="page-indicator">More records available</span>}
            </div>
          </>
        )}
      </div>
    </section>
  )
}