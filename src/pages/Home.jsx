import { useAuth } from "../context/useAuth";
import { useEffect, useMemo, useState } from "react";
import { getAnimals } from "../services/animals";
import { useNavigate } from "react-router-dom";

function latestDateFromHistory(hist) {
  if (!Array.isArray(hist)) return null;
  let best = null;
  for (const p of hist) {
    const d = p?.date ? String(p.date) : null;
    if (d && (!best || d > best)) best = d;
  }
  return best;
}

function latestWeightFromHistory(hist) {
  if (!Array.isArray(hist)) return null;

  let best = null;

  for (const p of hist) {
    const d = p?.date ? String(p.date) : null;
    const v = Number(p?.value);

    if (!d || !Number.isFinite(v)) continue;

    if (!best || d > best.date) {
      best = { date: d, value: v };
    }
  }

  return best;
}

const daysBetween = (a, b) => {
  if (!a || !b) return null;
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
};

function Home() {
  const { user, loading } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!user) return;

      setPageLoading(true);
      const start = Date.now();

      const data = await getAnimals(user.uid);
      setAnimals(data);

      const elapsed = Date.now() - start;
      const minDelay = 500;
      const remaining = minDelay - elapsed;

      if (remaining > 0) {
        setTimeout(() => setPageLoading(false), remaining);
      } else {
        setPageLoading(false);
      }
    }

    load();
  }, [user]);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayPretty = useMemo(() => new Date().toLocaleDateString(), []);

  const computed = useMemo(() => {
    const total = animals.length;

    const dueSoonDays = 14;
    const dueSoon = [];

    let mostRecentTreatment = null;
    let mostRecentTreatmentAnimal = null;

    let mostRecentWeight = null;
    let mostRecentWeightAnimal = null;

    const activity = [];

    for (const a of animals) {
      // due soon (build then sort once at end)
      const dueDate = a.dueDate ? String(a.dueDate) : "";
      if (dueDate && dueDate >= todayStr) {
        const d = daysBetween(todayStr, dueDate);
        if (d != null && d <= dueSoonDays) {
          dueSoon.push({ id: a.id, name: a.name, tagId: a.tagId, dueDate });
        }
      }

      // latest treatment (no sorting)
      const treatDate =
        latestDateFromHistory(a.treatmentDateHistory) ||
        (a.treatmentDate ? String(a.treatmentDate) : null);

      if (
        treatDate &&
        (!mostRecentTreatment || treatDate > mostRecentTreatment)
      ) {
        mostRecentTreatment = treatDate;
        mostRecentTreatmentAnimal = a;
      }

      const latestWeight = latestWeightFromHistory(a.weightHistory);

      if (
        latestWeight &&
        (!mostRecentWeight || latestWeight.date > mostRecentWeight.date)
      ) {
        mostRecentWeight = latestWeight; // store full object
        mostRecentWeightAnimal = a;
      }

      if (latestWeight && a.weightHistory.length >= 2) {
        activity.push({
          kind: "Weighed",
          date: latestWeight.date,
          id: a.id,
          name: a.name,
          tagId: a.tagId,
        });
      }

      if (treatDate) {
        activity.push({
          kind: "Treated",
          date: treatDate,
          id: a.id,
          name: a.name,
          tagId: a.tagId,
        });
      }
    }

    dueSoon.sort((x, y) => String(x.dueDate).localeCompare(String(y.dueDate)));
    const dueSoonTop = dueSoon.slice(0, 6);

    activity.sort((x, y) => String(y.date).localeCompare(String(x.date)));

    const activity30Days = activity.filter((x) => {
      const diff = daysBetween(x.date, todayStr);
      return diff != null && diff >= 0 && diff <= 30;
    }).length;

    return {
      total,
      dueSoon: dueSoonTop,
      mostRecentTreatment,
      mostRecentTreatmentAnimal,
      mostRecentWeight,
      mostRecentWeightAnimal,
      activity30Days,
      activity: activity.slice(0, 6),
    };
  }, [animals, todayStr]);

  if (loading || pageLoading) {
    return (
      <>
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <div className="spinner-border" role="status" />
            <p className="mt-3 text-body-secondary">Loading…</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) return <h2>Not logged in</h2>;

  return (
    <>
      <div className="container py-4" style={{ maxWidth: "70rem" }}>
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
          <div>
            <h1 className="mb-1">
              Welcome, {user.displayName?.split(" ")[0] || "there"} 🐐
            </h1>
            <div className="text-body-secondary">Today: {todayPretty}</div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/add")}
            >
              Add Animal
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/view")}
            >
              View Animals
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/analytics")}
            >
              Analytics
            </button>
          </div>
        </div>

        {computed.total === 0 && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body text-center py-5">
              <h3 className="fw-bold mb-2">No animals yet</h3>
              <p className="text-body-secondary mb-4">
                Start tracking weights, treatments, due dates, and more by
                adding your first animal.
              </p>

              <button
                className="btn btn-primary px-4"
                onClick={() => navigate("/add")}
              >
                Add Your First Animal
              </button>
            </div>
          </div>
        )}

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="text-body-secondary fw-semibold">
                  Total Animals
                </div>
                <div className="fs-2 fw-bold">{computed.total}</div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="text-body-secondary fw-semibold">
                  Latest Weigh-In
                </div>

                <div className="fs-5 fw-semibold">
                  {computed.mostRecentWeight
                    ? `${computed.mostRecentWeight.date}`
                    : "—"}
                </div>

                <div className="text-body-secondary mt-1">
                  {computed.mostRecentWeightAnimal
                    ? `${computed.mostRecentWeightAnimal.name || "—"} • Tag ${
                        computed.mostRecentWeightAnimal.tagId || "—"
                      } • ${computed.mostRecentWeight.value} lbs`
                    : "No weight history yet."}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="text-body-secondary fw-semibold">
                  Latest Treatment
                </div>
                <div className="fs-5 fw-semibold">
                  {computed.mostRecentTreatment || "—"}
                </div>
                <div className="text-body-secondary mt-1">
                  {computed.mostRecentTreatmentAnimal
                    ? `${computed.mostRecentTreatmentAnimal.name || "—"} • Tag ${
                        computed.mostRecentTreatmentAnimal.tagId || "—"
                      }`
                    : "No treatment history yet."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-7">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="mb-1 fw-semibold">Due Soon</h5>
                    <div className="text-body-secondary">
                      Upcoming due dates (next 14 days)
                    </div>
                  </div>
                </div>

                {computed.dueSoon.length === 0 ? (
                  <div className="text-body-secondary">Nothing due soon.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr className="text-body-secondary">
                          <th>Name</th>
                          <th>Tag</th>
                          <th>Due</th>
                          <th className="text-end">In</th>
                        </tr>
                      </thead>
                      <tbody>
                        {computed.dueSoon.map((a) => (
                          <tr
                            key={a.id}
                            role="button"
                            onClick={() => navigate(`/animals/${a.id}`)}
                          >
                            <td className="fw-semibold">{a.name || "—"}</td>
                            <td>{a.tagId || "—"}</td>
                            <td>{a.dueDate || "—"}</td>
                            <td className="text-end">
                              {a.dueDate
                                ? `${daysBetween(todayStr, a.dueDate)}d`
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body p-4">
                <h5 className="mb-1 fw-semibold">Recent Activity</h5>
                <div className="text-body-secondary mb-3">
                  Latest weigh-ins and treatments
                </div>

                {computed.activity.length === 0 ? (
                  <div className="text-body-secondary">
                    No activity recorded yet.
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {computed.activity.map((x, idx) => (
                      <div
                        key={`${x.kind}-${x.id}-${x.date}-${idx}`}
                        className="list-group-item px-0 d-flex justify-content-between align-items-start"
                      >
                        <div>
                          <div className="fw-semibold">
                            {x.kind}: {x.name || "—"}{" "}
                            <span className="text-body-secondary">
                              · Tag {x.tagId || "—"}
                            </span>
                          </div>
                          <div className="text-body-secondary">{x.date}</div>
                        </div>

                        <button
                          className="btn btn-sm btn-outline-secondary"
                          type="button"
                          onClick={() => navigate(`/animals/${x.id}`)}
                        >
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
