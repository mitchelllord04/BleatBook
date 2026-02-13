import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/useAuth";
import { getAnimal, updateAnimal } from "../services/animals";

function UpdateWeight() {
  const { user, loading } = useAuth();
  const { animalId } = useParams();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!user) return;
      const data = await getAnimal(user.uid, animalId);
      setAnimal(data);
      setWeight(String(data?.weight ?? ""));
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

    const w = Number(weight);
    if (!Number.isFinite(w) || w <= 0) {
      setError("Enter a valid weight.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const history = Array.isArray(animal.weightHistory)
      ? animal.weightHistory
      : [];

    const updates = {
      ...animal,
      weight: String(w),
      weightHistory: [...history, { value: w, date: today }],
    };

    try {
      setSaving(true);
      await updateAnimal(user.uid, animalId, updates);
      navigate(`/animals/${animalId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to save weight.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header />
      <div className="container py-4" style={{ maxWidth: "32rem" }}>
        <h1 className="mb-3">Update Weight</h1>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="mb-3">
          <div className="fw-semibold">{animal.name}</div>
          <div className="text-body-secondary">Tag: {animal.tagId}</div>
        </div>

        <form onSubmit={handleSave} className="card">
          <div className="card-body">
            <label className="form-label fw-semibold">New weight</label>
            <div className="input-group">
              <input
                className="form-control"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 75"
              />
              <span className="input-group-text">lbs</span>
            </div>

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

export default UpdateWeight;
