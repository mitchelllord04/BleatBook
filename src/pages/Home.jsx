import Header from "../components/Header";
import { useAuth } from "../context/useAuth";
import { useEffect, useMemo, useState } from "react";
import { getAnimals } from "../services/animals";
import { useNavigate } from "react-router-dom";

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

  const daysBetween = (a, b) => {
    if (!a || !b) return null;
    const da = new Date(`${a}T00:00:00`);
    const db = new Date(`${b}T00:00:00`);
    return Math.round((db - da) / (1000 * 60 * 60 * 24));
  };

  const lastTreatmentFromAnimal = (a) => {
    const hist = Array.isArray(a.treatmentDateHistory)
      ? a.treatmentDateHistory
      : [];
    const valid = hist
      .filter((p) => p && p.date)
      .slice()
      .sort((x, y) => String(x.date).localeCompare(String(y.date)));
    if (valid.length) return String(valid[valid.length - 1].date);
    if (a.treatmentDate) return String(a.treatmentDate);
    return null;
  };

  const lastWeightFromAnimal = (a) => {
    const hist = Array.isArray(a.weightHistory) ? a.weightHistory : [];
    const valid = hist
      .filter((p) => p && p.date && Number.isFinite(Number(p.value)))
      .slice()
      .sort((x, y) => String(x.date).localeCompare(String(y.date)));
    if (valid.length) return { date: String(valid[valid.length - 1].date) };
    return null;
  };

  const computed = useMemo(() => {
    const total = animals.length;

    const dueSoonDays = 14;
    const dueSoon = animals
      .map((a) => ({
        id: a.id,
        name: a.name,
        tagId: a.tagId,
        dueDate: a.dueDate ? String(a.dueDate) : "",
      }))
      .filter((a) => a.dueDate && a.dueDate >= todayStr)
      .filter((a) => {
        const d = daysBetween(todayStr, a.dueDate);
        return d != null && d <= dueSoonDays;
      })
      .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
      .slice(0, 6);

    let mostRecentTreatment = null;
    let mostRecentTreatmentAnimal = null;

    for (const a of animals) {
      const d = lastTreatmentFromAnimal(a);
      if (!d) continue;
      if (!mostRecentTreatment || d > mostRecentTreatment) {
        mostRecentTreatment = d;
        mostRecentTreatmentAnimal = a;
      }
    }

    const activity = [];
    for (const a of animals) {
      const weightHist = Array.isArray(a.weightHistory) ? a.weightHistory : [];
      if (weightHist.length >= 2) {
        const lw = lastWeightFromAnimal(a);
        if (lw?.date)
          activity.push({
            kind: "Weighed",
            date: lw.date,
            id: a.id,
            name: a.name,
            tagId: a.tagId,
          });
      }

      const treatHist = Array.isArray(a.treatmentDateHistory)
        ? a.treatmentDateHistory
        : [];

      if (treatHist.length >= 1) {
        const lt = lastTreatmentFromAnimal(a);
        if (lt)
          activity.push({
            kind: "Treated",
            date: lt,
            id: a.id,
            name: a.name,
            tagId: a.tagId,
          });
      }
    }

    activity.sort((x, y) => String(y.date).localeCompare(String(x.date)));

    return {
      total,
      dueSoon,
      mostRecentTreatment,
      mostRecentTreatmentAnimal,
      activity: activity.slice(0, 6),
    };
  }, [animals, todayStr]);

  if (loading || pageLoading) {
    return (
      <>
        <Header />
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
      <Header />

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
                <div className="text-body-secondary fw-semibold">Due Soon</div>
                <div className="fs-2 fw-bold">{computed.dueSoon.length}</div>
                <div className="text-body-secondary mt-1">Next 14 days</div>
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
                    ? `${computed.mostRecentTreatmentAnimal.name || "—"} · Tag ${
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
