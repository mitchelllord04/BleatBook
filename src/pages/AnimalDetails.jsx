import { useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getAnimal, deleteAnimal } from "../services/animals";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import WeightChart from "../components/WeightChart";
import TreatmentHistory from "../components/TreatmentHistory";

function AnimalDetails() {
  const { user, loading } = useAuth();
  const { animalId } = useParams();

  const [animal, setAnimal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadAnimal() {
      if (!user) return;
      const data = await getAnimal(user.uid, animalId);
      setAnimal(data);
    }
    loadAnimal();
  }, [user, animalId]);

  async function handleDelete() {
    if (!user) return;
    if (!window.confirm(`Delete ${animal?.name ?? "this animal"}?`)) return;

    try {
      setDeleting(true);
      await deleteAnimal(user.uid, animalId);
      navigate("/view");
    } catch (err) {
      console.error(err);
      alert("Failed to delete animal.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <div className="spinner-border" role="status" />
            <p className="mt-3 text-body-secondary">Loading data…</p>
          </div>
        </div>
      </>
    );
  }

  if (!animal) return <h2>Loading animal...</h2>;

  const rows = [
    ["Species", animal.species],
    ["Sex", animal.sex],
    ["Breed", animal.breed],
    ["Weight", animal.weight ? `${animal.weight} lbs` : ""],
    ["DOB", animal.dob],
    ["Purchased", animal.dop],
    ["Last Trim", animal.lastTrim],
    ["Due Date", animal.dueDate],
    ["Treatment", animal.treatmentDate],
    ["Vaccination", animal.vaccinationDate],
    ["Medications", animal.meds],
    ["Vaccinations", animal.vaccinations],
    ["Notes", animal.notes],
  ];

  const actionFor = (label) => {
    if (label === "Weight") {
      return (
        <button
          className="btn btn-sm btn-outline-secondary"
          type="button"
          onClick={() => navigate(`/updateWeight/${animalId}`)}
        >
          Update
        </button>
      );
    }
    if (label === "Treatment") {
      return (
        <button
          className="btn btn-sm btn-outline-secondary"
          type="button"
          onClick={() => navigate(`/updateTreatmentDate/${animalId}`)}
        >
          Update
        </button>
      );
    }
    return null;
  };

  return (
    <>
      <Header />

      <div className="container py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="mb-1">{animal.name}</h1>
            <div className="text-body-secondary">
              Tag: <span className="fw-semibold">{animal.tagId}</span>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/view")}
            >
              Back
            </button>

            <button
              className="btn btn-primary"
              onClick={() => navigate(`/edit/${animalId}`)}
            >
              Edit
            </button>

            <button
              className="btn btn-outline-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <span className="d-inline-flex align-items-center gap-2">
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  />
                  Deleting…
                </span>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <div className="d-flex flex-column">
              {rows.map(([label, value], i) => (
                <div key={label}>
                  <div className="row align-items-start py-3">
                    <div className="col-4 fw-semibold text-body-secondary">
                      {label}
                    </div>

                    <div className="col-8 ps-4">
                      <div className="d-flex align-items-start justify-content-between gap-3">
                        <div>{value || "N/A"}</div>
                        {actionFor(label)}
                      </div>
                    </div>
                  </div>

                  {i < rows.length - 1 && <hr className="m-0 opacity-25" />}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 mt-5 mb-2">
          <h2 className="m-0">Weight History</h2>
          <span className="text-body-secondary">
            (based on weight updates, not all dates)
          </span>
        </div>
        <div className="mt-4">
          <WeightChart weightHistory={animal.weightHistory} />
        </div>
        <div className="d-flex align-items-center gap-2 mt-5 mb-2">
          <h2 className="m-0">Treatment History</h2>
        </div>
        <div className="mt-4">
          <TreatmentHistory
            treatmentDateHistory={animal.treatmentDateHistory}
          />
        </div>
      </div>
    </>
  );
}

export default AnimalDetails;
