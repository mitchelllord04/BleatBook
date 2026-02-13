import { useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useEffect, useState } from "react";
import { getAnimal, updateAnimal } from "../services/animals";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function EditAnimalDetails() {
  const { user, loading } = useAuth();
  const [animal, setAnimal] = useState(null);

  const { animalId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!user) return;
      const data = await getAnimal(user.uid, animalId);
      setAnimal(data);
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
            <p className="mt-3 text-body-secondary">Loading animals…</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) return <h2>Not logged in</h2>;
  if (!animal) return <h2>Animal not found.</h2>;

  async function handleSave() {
    try {
      const today = new Date().toISOString().slice(0, 10);

      const wHist = Array.isArray(animal.weightHistory)
        ? [...animal.weightHistory]
        : [];
      const tHist = Array.isArray(animal.treatmentDateHistory)
        ? [...animal.treatmentDateHistory]
        : [];

      const w = Number(animal.weight);
      if (Number.isFinite(w) && w > 0) {
        const entry = { value: w, date: today };
        if (wHist.length === 0) wHist.push(entry);
        else wHist[wHist.length - 1] = entry;
      }

      if (animal.treatmentDate) {
        const entry = { date: animal.treatmentDate };
        if (tHist.length === 0) tHist.push(entry);
        else tHist[tHist.length - 1] = entry;
      }

      const updates = {
        ...animal,
        weightHistory: wHist,
        treatmentDateHistory: tHist,
      };

      await updateAnimal(user.uid, animalId, updates);
      navigate(`/animals/${animalId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    }
  }

  return (
    <>
      <Header />

      <div className="container py-4" style={{ maxWidth: "56rem" }}>
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
          <div>
            <h1 className="mb-1">Edit Animal</h1>
            <div className="text-body-secondary">
              {animal.name} · Tag {animal.tagId}
            </div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate(`/animals/${animalId}`)}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <div className="d-flex flex-column">
              <div className="row align-items-start py-3">
                <div className="col-4 fw-semibold text-body-secondary">
                  Species
                </div>
                <div className="col-8 ps-4">
                  <select
                    className="form-select"
                    value={animal.species}
                    onChange={(e) =>
                      setAnimal((prev) => ({
                        ...prev,
                        species: e.target.value,
                      }))
                    }
                  >
                    <option>Goat</option>
                    <option>Sheep</option>
                    <option>Cow</option>
                    <option>Pig</option>
                    <option>Chicken</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <hr className="m-0 opacity-25" />

              <div className="row align-items-start py-3">
                <div className="col-4 fw-semibold text-body-secondary">Sex</div>
                <div className="col-8 ps-4">
                  <select
                    className="form-select"
                    value={animal.sex}
                    onChange={(e) =>
                      setAnimal((prev) => ({ ...prev, sex: e.target.value }))
                    }
                  >
                    <option value="">Select…</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <hr className="m-0 opacity-25" />

              <div className="row align-items-start py-3">
                <div className="col-4 fw-semibold text-body-secondary">
                  Breed
                </div>
                <div className="col-8 ps-4">
                  <input
                    className="form-control"
                    value={animal.breed}
                    onChange={(e) =>
                      setAnimal((prev) => ({ ...prev, breed: e.target.value }))
                    }
                    placeholder="e.g. Nigerian Dwarf"
                  />
                </div>
              </div>
              <hr className="m-0 opacity-25" />

              <div className="row align-items-start py-3">
                <div className="col-4 fw-semibold text-body-secondary">
                  Weight
                </div>
                <div className="col-8 ps-4">
                  <div className="input-group">
                    <input
                      className="form-control"
                      value={animal.weight}
                      onChange={(e) =>
                        setAnimal((prev) => ({
                          ...prev,
                          weight: e.target.value,
                        }))
                      }
                      placeholder="e.g. 75"
                      inputMode="numeric"
                      required
                    />
                    <span className="input-group-text">lbs</span>
                  </div>
                </div>
              </div>
              <hr className="m-0 opacity-25" />

              <div className="row align-items-start py-3">
                <div className="col-4 fw-semibold text-body-secondary">DOB</div>
                <div className="col-8 ps-4">
                  <input
                    type="date"
                    className="form-control"
                    value={animal.dob}
                    onChange={(e) =>
                      setAnimal((prev) => ({ ...prev, dob: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <hr className="m-0 opacity-25" />

              <div className="row align-items-start py-3">
                <div className="col-4 fw-semibold text-body-secondary">
                  Purchased
                </div>
                <div className="col-8 ps-4">
                  <input
                    type="date"
                    className="form-control"
                    value={animal.dop}
                    onChange={(e) =>
                      setAnimal((prev) => ({ ...prev, dop: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <hr className="m-0 opacity-25" />

              <div className="row align-items-start py-3">
                <div className="col-4 fw-semibold text-body-secondary">
                  Last Trim
                </div>
                <div className="col-8 ps-4">
                  <input
                    type="date"
                    className="form-control"
                    value={animal.lastTrim}
                    onChange={(e) =>
                      setAnimal((prev) => ({
                        ...prev,
                        lastTrim: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <hr className="m-0 opacity-25" />

              <div className="row align-items-start py-3">
                <div className="col-4 fw-semibold text-body-secondary">
                  Due Date
                </div>
                <div className="col-8 ps-4">
                  <input
                    type="date"
                    className="form-control"
                    value={animal.dueDate}
                    onChange={(e) =>
                      setAnimal((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <hr className="m-0 opacity-25" />

              <div className="row align-items-start py-3">
                <div className="col-4 fw-semibold text-body-secondary">
                  Treatment
                </div>
                <div className="col-8 ps-4">
                  <input
                    type="date"
                    className="form-control"
                    value={animal.treatmentDate}
                    onChange={(e) =>
                      setAnimal((prev) => ({
                        ...prev,
                        treatmentDate: e.target.value,
                      }))
                    }
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
              </div>
              <hr className="m-0 opacity-25" />

              <div className="row align-items-start py-3">
                <div className="col-4 fw-semibold text-body-secondary">
                  Vaccination
                </div>
                <div className="col-8 ps-4">
                  <input
                    type="date"
                    className="form-control"
                    value={animal.vaccinationDate}
                    onChange={(e) =>
                      setAnimal((prev) => ({
                        ...prev,
                        vaccinationDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <hr className="m-0 opacity-25" />

              <div className="row align-items-start py-3">
                <div className="col-4 fw-semibold text-body-secondary">
                  Medications
                </div>
                <div className="col-8 ps-4">
                  <textarea
                    className="form-control"
                    rows={3}
                    value={animal.meds}
                    onChange={(e) =>
                      setAnimal((prev) => ({ ...prev, meds: e.target.value }))
                    }
                    placeholder="e.g. Ivermectin 1mL monthly…"
                  />
                </div>
              </div>
              <hr className="m-0 opacity-25" />

              <div className="row align-items-start py-3">
                <div className="col-4 fw-semibold text-body-secondary">
                  Vaccinations
                </div>
                <div className="col-8 ps-4">
                  <textarea
                    className="form-control"
                    rows={3}
                    value={animal.vaccinations}
                    onChange={(e) =>
                      setAnimal((prev) => ({
                        ...prev,
                        vaccinations: e.target.value,
                      }))
                    }
                    placeholder="e.g. CDT, Rabies…"
                  />
                </div>
              </div>
              <hr className="m-0 opacity-25" />

              <div className="row align-items-start py-3">
                <div className="col-4 fw-semibold text-body-secondary">
                  Notes
                </div>
                <div className="col-8 ps-4">
                  <textarea
                    className="form-control"
                    rows={4}
                    value={animal.notes}
                    onChange={(e) =>
                      setAnimal((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Anything else you want to remember…"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditAnimalDetails;
