function TreatmentHistory({ treatmentDateHistory }) {
  const items = (
    Array.isArray(treatmentDateHistory) ? treatmentDateHistory : []
  )
    .filter((x) => x && x.date)
    .slice()
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  if (items.length === 0) {
    return (
      <div className="card mt-4">
        <div className="card-body">
          <div className="fw-semibold mb-1">Treatment history</div>
          <div className="text-body-secondary">
            No treatment dates recorded yet.
          </div>
        </div>
      </div>
    );
  }

  function daysAgo(dateString) {
    if (!dateString) return "";

    const today = new Date();
    const past = new Date(dateString);

    const diffTime = today - past;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  }

  return (
    <div className="card mt-4">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
          <div className="fw-semibold">Treatments</div>
          <span className="badge text-bg-secondary">{items.length}</span>
        </div>

        <ul className="list-group list-group-flush">
          {items.map((x, i) => (
            <li key={`${x.date}-${i}`} className="list-group-item px-0 py-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="fw-semibold">{x.date}</div>
                <div className="text-body-secondary small">
                  {daysAgo(x.date)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TreatmentHistory;
