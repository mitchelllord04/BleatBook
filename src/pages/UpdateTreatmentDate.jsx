import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/useAuth";
import { getAnimal, updateAnimal } from "../services/animals";

function UpdateTreatmentDate() {
  const { user, loading } = useAuth();
  const { animalId } = useParams();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!user) return;
      const data = await getAnimal(user.uid, animalId);
      setAnimal(data);

      const today = new Date().toISOString().slice(0, 10);
      setDate(String(data?.treatmentDate ?? today));
    }
    load();
  }, [user, animalId]);

  if (loading) {
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
  if (!animal) return <h2>Animal not found.</h2>;

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!date.trim()) {
      setError("Select a valid treatment date.");
      return;
    }

    const history = Array.isArray(animal.treatmentDateHistory)
      ? animal.treatmentDateHistory
      : [];

    const updates = {
      treatmentDate: date,
      treatmentDateHistory: [...history, { date }],
    };

    try {
      setSaving(true);
      await updateAnimal(user.uid, animalId, updates);
      navigate(`/animals/${animalId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to save treatment date.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header />
      <div className="container py-4" style={{ maxWidth: "32rem" }}>
        <h1 className="mb-3">Update Treatment Date</h1>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="mb-3">
          <div className="fw-semibold">{animal.name}</div>
          <div className="text-body-secondary">Tag: {animal.tagId}</div>
        </div>

        <form onSubmit={handleSave} className="card">
          <div className="card-body">
            <label className="form-label fw-semibold">New treatment date</label>

            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />

            <div className="d-flex gap-2 mt-3">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>

              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => navigate(`/animals/${animalId}`)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default UpdateTreatmentDate;
