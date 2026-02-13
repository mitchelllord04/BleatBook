import { useState } from "react";
import { addAnimal } from "../services/animals";
import { useAuth } from "../context/useAuth";
import Header from "../components/Header";

function Add() {
  const { user, loading } = useAuth();

  if (loading) return <h2>Loading...</h2>;
  if (!user) return <h2>Not logged in</h2>;

  const [form, setForm] = useState({
    name: "",
    tagId: "",
    species: "Goat",
    sex: "",
    breed: "",
    weight: "",
    weightHistory: [],
    dob: "",
    dop: "",
    lastTrim: "",
    dueDate: "",
    treatmentDate: "",
    treatmentDateHistory: [],
    vaccinationDate: "",
    meds: "",
    vaccinations: "",
    notes: "",
  });

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const now = new Date().toISOString().slice(0, 10);

    const payload = {
      ...form,
      weightHistory: [
        {
          value: Number(form.weight) || 0,
          date: now,
        },
      ],
      treatmentDateHistory: form.treatmentDate
        ? [{ date: form.treatmentDate }]
        : [],
    };

    try {
      await addAnimal(user.uid, payload);

      setForm({
        name: "",
        tagId: "",
        species: "Goat",
        sex: "",
        breed: "",
        weight: "",
        weightHistory: [],
        dob: "",
        dop: "",
        lastTrim: "",
        dueDate: "",
        treatmentDate: "",
        treatmentDateHistory: [],
        vaccinationDate: "",
        meds: "",
        vaccinations: "",
        notes: "",
      });

      alert("Animal successfully saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save. Check console.");
    }
  };

  return (
    <>
      <Header />

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="m-0">Add Animal</h1>
          <button
            type="submit"
            form="add-animal-form"
            className="btn btn-primary"
          >
            Save
          </button>
        </div>

        <form id="add-animal-form" onSubmit={handleSubmit}>
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title mb-3">Identity</h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Name *</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={setField("name")}
                    placeholder="e.g. Daisy"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Tag / ID</label>
                  <input
                    className="form-control"
                    value={form.tagId}
                    onChange={setField("tagId")}
                    placeholder="e.g. G-014"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title mb-3">Basics</h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Species</label>
                  <select
                    className="form-select"
                    value={form.species}
                    onChange={setField("species")}
                    required
                  >
                    <option>Goat</option>
                    <option>Sheep</option>
                    <option>Cow</option>
                    <option>Pig</option>
                    <option>Chicken</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Sex</label>
                  <select
                    className="form-select"
                    value={form.sex}
                    onChange={setField("sex")}
                    required
                  >
                    <option value="">Select…</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Breed</label>
                  <input
                    className="form-control"
                    value={form.breed}
                    onChange={setField("breed")}
                    placeholder="e.g. Nigerian Dwarf"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Weight</label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      value={form.weight}
                      onChange={setField("weight")}
                      placeholder="e.g. 75"
                      inputMode="numeric"
                      required
                    />
                    <span className="input-group-text">lbs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title mb-3">Dates</h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">DOB</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.dob}
                    onChange={setField("dob")}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">DOP / Acquisition Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.dop}
                    onChange={setField("dop")}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Trim</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.lastTrim}
                    onChange={setField("lastTrim")}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.dueDate}
                    onChange={setField("dueDate")}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Treatment Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.treatmentDate}
                    onChange={setField("treatmentDate")}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Vaccination Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.vaccinationDate}
                    onChange={setField("vaccinationDate")}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Care & Notes</h5>

              <div className="mb-3">
                <label className="form-label">Medications</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.meds}
                  onChange={setField("meds")}
                  placeholder="e.g. Ivermectin 1mL monthly…"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Vaccinations</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.vaccinations}
                  onChange={setField("vaccinations")}
                  placeholder="e.g. CDT, Rabies…"
                />
              </div>

              <div>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={form.notes}
                  onChange={setField("notes")}
                  placeholder="Anything else you want to remember…"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Save Animal
          </button>
        </form>
      </div>
    </>
  );
}

export default Add;
