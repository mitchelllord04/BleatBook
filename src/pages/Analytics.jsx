import Header from "../components/Header";
import { useState, useEffect, useMemo } from "react";
import { getAnimals } from "../services/animals";
import { useAuth } from "../context/useAuth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

const SPECIES_ORDER = ["Goat", "Pig", "Cow", "Sheep", "Chicken", "Other"];

function toDateStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  if (!a || !b) return null;
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  const ms = db - da;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function parseWeight(w) {
  const n = Number(w);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizeWeightHistory(a) {
  const hist = Array.isArray(a?.weightHistory) ? a.weightHistory : [];
  return hist
    .filter((p) => p && p.date && Number.isFinite(Number(p.value)))
    .slice()
    .sort((x, y) => String(x.date).localeCompare(String(y.date)))
    .map((p) => ({ date: String(p.date), value: Number(p.value) }));
}

function lastTrimDate(a) {
  const d = a?.lastTrim;
  return d ? String(d) : null;
}

function ageYears(dobStr, todayStr) {
  if (!dobStr || !todayStr) return null;
  const dob = new Date(`${dobStr}T00:00:00`);
  const today = new Date(`${todayStr}T00:00:00`);
  if (Number.isNaN(dob.getTime()) || Number.isNaN(today.getTime())) return null;

  let years = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years--;
  return years >= 0 ? years : null;
}

function lastWeight(a) {
  const h = normalizeWeightHistory(a);
  if (h.length) return h[h.length - 1];
  const v = parseWeight(a?.weight);
  return v == null ? null : { date: null, value: v };
}

function normalizeTreatmentHistory(a) {
  const hist = Array.isArray(a?.treatmentDateHistory)
    ? a.treatmentDateHistory
    : [];
  const valid = hist
    .filter((p) => p && p.date)
    .slice()
    .sort((x, y) => String(x.date).localeCompare(String(y.date)))
    .map((p) => String(p.date));
  if (valid.length) return valid;
  if (a?.treatmentDate) return [String(a.treatmentDate)];
  return [];
}

function lastTreatmentDate(a) {
  const h = normalizeTreatmentHistory(a);
  return h.length ? h[h.length - 1] : null;
}

function computeAnalytics(animals, todayStr) {
  const totalAnimals = animals.length;

  const speciesCounts = SPECIES_ORDER.reduce((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {});

  let males = 0;
  let females = 0;

  for (const a of animals) {
    if (a.sex === "Male") males++;
    if (a.sex === "Female") females++;

    const s = String(a.species || "Other");
    if (speciesCounts[s] !== undefined) speciesCounts[s] += 1;
    else speciesCounts.Other += 1;
  }

  const dueSoonDays = 14;
  const dueSoon = animals
    .map((a) => ({
      id: a.id,
      name: a.name,
      tagId: a.tagId,
      dueDate: a.dueDate ? String(a.dueDate) : "",
      species: a.species,
      sex: a.sex,
    }))
    .filter((a) => a.dueDate && a.dueDate >= todayStr)
    .filter((a) => {
      const d = daysBetween(todayStr, a.dueDate);
      return d != null && d <= dueSoonDays;
    })
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
    .slice(0, 8);

  let mostRecentTreatment = null;
  let mostRecentTreatmentAnimal = null;
  let mostRecentWeighIn = null;
  let mostRecentWeighInAnimal = null;

  let mostRecentTrim = null;
  let mostRecentTrimAnimal = null;

  const ages = [];

  for (const a of animals) {
    const d = lastTreatmentDate(a);
    if (d && (!mostRecentTreatment || d > mostRecentTreatment)) {
      mostRecentTreatment = d;
      mostRecentTreatmentAnimal = a;
    }

    const lwFull = lastWeight(a);
    if (
      lwFull?.date &&
      (!mostRecentWeighIn || lwFull.date > mostRecentWeighIn)
    ) {
      mostRecentWeighIn = lwFull.date;
      mostRecentWeighInAnimal = {
        id: a.id,
        name: a.name,
        tagId: a.tagId,
        value: lwFull.value,
      };
    }

    const lt = lastTrimDate(a);
    if (lt && (!mostRecentTrim || lt > mostRecentTrim)) {
      mostRecentTrim = lt;
      mostRecentTrimAnimal = { id: a.id, name: a.name, tagId: a.tagId };
    }

    const ay = ageYears(a?.dob, todayStr);
    if (ay != null) ages.push(ay);
  }

  const latestWeights = [];
  const deltas = [];

  for (const a of animals) {
    const lw = lastWeight(a);
    if (lw && Number.isFinite(lw.value)) latestWeights.push(lw.value);

    const h = normalizeWeightHistory(a);
    if (h.length >= 2) {
      const prev = h[h.length - 2].value;
      const cur = h[h.length - 1].value;
      const dv = cur - prev;
      if (Number.isFinite(dv)) deltas.push(dv);
    }
  }

  const avgLatestWeight =
    latestWeights.length > 0
      ? latestWeights.reduce((s, v) => s + v, 0) / latestWeights.length
      : null;

  const avgWeightDelta =
    deltas.length > 0
      ? deltas.reduce((s, v) => s + v, 0) / deltas.length
      : null;

  const byDate = new Map();

  for (const a of animals) {
    const h = normalizeWeightHistory(a);
    for (const p of h) {
      if (!byDate.has(p.date)) byDate.set(p.date, { sum: 0, n: 0 });
      const agg = byDate.get(p.date);
      agg.sum += p.value;
      agg.n += 1;
    }
  }

  const weightTrendDates = Array.from(byDate.keys()).sort();
  const weightTrendValues = weightTrendDates.map((d) => {
    const { sum, n } = byDate.get(d);
    return n ? sum / n : null;
  });

  const lastTrend =
    weightTrendValues.length > 0
      ? weightTrendValues[weightTrendValues.length - 1]
      : null;

  const lastTrendDate =
    weightTrendDates.length > 0
      ? weightTrendDates[weightTrendDates.length - 1]
      : null;

  const avgAgeYears =
    ages.length > 0 ? ages.reduce((s, v) => s + v, 0) / ages.length : null;

  return {
    totalAnimals,
    speciesCounts,
    males,
    females,
    dueSoon,
    mostRecentWeighIn,
    mostRecentWeighInAnimal,
    mostRecentTrim,
    mostRecentTrimAnimal,
    avgAgeYears,
    mostRecentTreatment,
    mostRecentTreatmentAnimal,
    avgLatestWeight,
    avgWeightDelta,
    weightTrendDates,
    weightTrendValues,
    lastTrend,
    lastTrendDate,
  };
}

function Analytics() {
  const { user, loading } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;

      setPageLoading(true);

      const start = Date.now();
      const data = await getAnimals(user.uid);
      setAnimals(data);

      const elapsed = Date.now() - start;
      const minDelay = 800;
      const remaining = minDelay - elapsed;

      if (remaining > 0) setTimeout(() => setPageLoading(false), remaining);
      else setPageLoading(false);
    }

    load();
  }, [user]);

  const todayStr = useMemo(() => toDateStr(), []);

  const computed = useMemo(
    () => computeAnalytics(animals, todayStr),
    [animals, todayStr],
  );

  if (loading || pageLoading) {
    return (
      <>
        <Header />
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <div className="spinner-border" role="status" />
            <p className="mt-3 text-body-secondary">Loading animals…</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) return <h2>Not logged in</h2>;

  const doughnutData = {
    labels: SPECIES_ORDER,
    datasets: [
      {
        label: "Animals",
        data: SPECIES_ORDER.map((k) => computed.speciesCounts[k] || 0),
        backgroundColor: [
          "#0d6efd",
          "#198754",
          "#ffc107",
          "#dc3545",
          "#6f42c1",
          "#20c997",
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
  };

  const trendData = {
    labels: computed.weightTrendDates,
    datasets: [
      {
        label: "Average weight (lbs)",
        data: computed.weightTrendValues,
        tension: 0.25,
        borderColor: "#212529",
        backgroundColor: "#212529",
        borderWidth: 3,
        pointRadius: 3,
        pointHoverRadius: 6,
        fill: false,
        spanGaps: true,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      y: { title: { display: true, text: "lbs" } },
      x: { title: { display: true, text: "Date" } },
    },
  };

  const mostRecentTreatmentText = computed.mostRecentTreatment
    ? `${computed.mostRecentTreatment}`
    : "—";

  return (
    <>
      <Header />

      <div className="container py-4" style={{ maxWidth: "70rem" }}>
        <div className="mb-4">
          <h1 className="mb-1">Analytics</h1>
          <p className="text-body-secondary m-0">
            Overview of your livestock records
          </p>
        </div>

        {/* Row 1: Total, Males, Females, Avg Weight */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="text-body-secondary fw-semibold">
                  Total Animals
                </div>
                <div className="fs-2 fw-bold">{computed.totalAnimals}</div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="text-body-secondary fw-semibold">Males</div>
                <div className="fs-2 fw-bold">{computed.males}</div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="text-body-secondary fw-semibold">Females</div>
                <div className="fs-2 fw-bold">{computed.females}</div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="text-body-secondary fw-semibold">
                  Avg. Weight
                </div>
                <div className="fs-2 fw-bold">
                  {computed.avgLatestWeight == null
                    ? "—"
                    : `${computed.avgLatestWeight.toFixed(1)} lbs`}
                </div>
                <div className="text-body-secondary mt-1">
                  Avg change per entry:{" "}
                  {computed.avgWeightDelta == null
                    ? "—"
                    : `${computed.avgWeightDelta >= 0 ? "+" : ""}${computed.avgWeightDelta.toFixed(
                        1,
                      )} lbs`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Avg Age, Most Recent Weigh-In, Most Recent Treatment, Most Recent Trim */}
        <div className="row g-3 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="text-body-secondary fw-semibold">Avg. Age</div>
                <div className="fs-2 fw-bold">
                  {computed.avgAgeYears == null
                    ? "—"
                    : computed.avgAgeYears.toFixed(1)}
                </div>
                <div className="text-body-secondary mt-1">years</div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="text-body-secondary fw-semibold">
                  Most Recent Weigh-In
                </div>
                <div className="fs-5 fw-semibold">
                  {computed.mostRecentWeighIn || "—"}
                </div>
                <div className="text-body-secondary mt-1">
                  {computed.mostRecentWeighInAnimal
                    ? `${computed.mostRecentWeighInAnimal.name || "—"} · Tag ${
                        computed.mostRecentWeighInAnimal.tagId || "—"
                      }${
                        Number.isFinite(computed.mostRecentWeighInAnimal.value)
                          ? ` · ${computed.mostRecentWeighInAnimal.value} lbs`
                          : ""
                      }`
                    : "No weigh-ins recorded yet."}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="text-body-secondary fw-semibold">
                  Most Recent Treatment
                </div>
                <div className="fs-5 fw-semibold">
                  {mostRecentTreatmentText}
                </div>
                <div className="text-body-secondary mt-2">
                  {computed.mostRecentTreatmentAnimal
                    ? `${computed.mostRecentTreatmentAnimal.name || "—"} · Tag ${
                        computed.mostRecentTreatmentAnimal.tagId || "—"
                      }`
                    : "No treatment dates recorded yet."}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="text-body-secondary fw-semibold">
                  Most Recent Trim
                </div>
                <div className="fs-5 fw-semibold">
                  {computed.mostRecentTrim || "—"}
                </div>
                <div className="text-body-secondary mt-1">
                  {computed.mostRecentTrimAnimal
                    ? `${computed.mostRecentTrimAnimal.name || "—"} · Tag ${
                        computed.mostRecentTrimAnimal.tagId || "—"
                      }`
                    : "No trims recorded yet."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Species Breakdown + Weight Trend */}
        <div className="row g-3 mb-4">
          <div className="col-lg-5">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="mb-1 fw-semibold">Species Breakdown</h5>
                    <div className="text-body-secondary">
                      Distribution of animals by species
                    </div>
                  </div>
                </div>
                <div style={{ height: "18rem" }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="mb-1 fw-semibold">Weight Trend</h5>
                    <div className="text-body-secondary">
                      Average weight across all recorded weigh-ins
                      {computed.lastTrendDate && computed.lastTrend != null
                        ? ` • Latest: ${computed.lastTrend.toFixed(
                            1,
                          )} lbs on ${computed.lastTrendDate}`
                        : ""}
                    </div>
                  </div>
                </div>
                <div style={{ height: "18rem" }}>
                  {computed.weightTrendDates.length < 2 ? (
                    <div className="d-flex justify-content-center align-items-center h-100 text-body-secondary">
                      Add at least two weigh-ins on different days to see a
                      trend line.
                    </div>
                  ) : (
                    <Line data={trendData} options={trendOptions} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="mb-1 fw-semibold">Upcoming Due Dates</h5>
                    <div className="text-body-secondary">
                      Animals with a due date within the next 14 days
                    </div>
                  </div>
                  <div className="text-body-secondary fw-semibold">
                    {computed.dueSoon.length
                      ? `${computed.dueSoon.length}`
                      : "0"}
                  </div>
                </div>

                {computed.dueSoon.length === 0 ? (
                  <div className="text-body-secondary">
                    No upcoming due dates.
                  </div>
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
                          <tr key={a.id}>
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
        </div>
      </div>
    </>
  );
}

export default Analytics;
