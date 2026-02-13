import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useMemo, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

function WeightChart({ weightHistory }) {
  const [showList, setShowList] = useState(false);

  const points = useMemo(() => {
    return (Array.isArray(weightHistory) ? weightHistory : [])
      .filter((p) => p && p.date && Number.isFinite(Number(p.value)))
      .slice()
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [weightHistory]);

  const labels = points.map((p) => p.date);
  const values = points.map((p) => Number(p.value));

  const data = {
    labels,
    datasets: [
      {
        label: "Weight (lbs)",
        data: values,
        tension: 0.25,
        borderColor: "#212529",
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 6,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      y: { title: { display: true, text: "lbs" } },
      x: { title: { display: true, text: "Date" } },
    },
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
          <div className="fw-semibold">Weight over time</div>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowList((s) => !s)}
            disabled={points.length === 0}
          >
            {showList ? "Hide list" : "View as list"}
          </button>
        </div>

        <div style={{ height: "18rem" }}>
          <Line data={data} options={options} />
        </div>

        <div className={`collapse ${showList ? "show" : ""}`}>
          <div className="mt-3 border rounded">
            <div className="px-3 py-2 fw-semibold border-bottom">
              Weight history
            </div>

            {points.length === 0 ? (
              <div className="px-3 py-2 text-body-secondary">
                No weights yet.
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {points.map((p, idx) => (
                  <div
                    key={`${p.date}-${idx}`}
                    className="list-group-item d-flex align-items-center justify-content-between"
                  >
                    <div className="d-flex flex-column">
                      <span className="fw-semibold">#{idx + 1}</span>
                      <span className="text-body-secondary">{p.date}</span>
                    </div>

                    <span className="fw-semibold">{Number(p.value)} lbs</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeightChart;
