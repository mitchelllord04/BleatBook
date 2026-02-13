import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useAuth } from "../context/useAuth";
import { getAnimals } from "../services/animals";
import { useNavigate } from "react-router-dom";

function View() {
  const { user, loading } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [sort, setSort] = useState("");
  const [order, setOrder] = useState("asc");
  const [species, setSpecies] = useState("All");
  const [sex, setSex] = useState("All");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const navigate = useNavigate();

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

  const sortSelect = (e) => setSort(e.target.value);
  const orderSelect = (e) => setOrder(e.target.value);
  const speciesSelect = (e) => setSpecies(e.target.value);
  const sexSelect = (e) => setSex(e.target.value);

  const handleSearch = () => setSearch(query);

  const term = search.trim().toLowerCase();

  const filteredAnimals = animals
    .filter((a) => species === "All" || a.species === species)
    .filter((a) => sex === "All" || a.sex === sex)
    .filter((a) => {
      if (!term) return true;
      const name = String(a.name ?? "").toLowerCase();
      const tag = String(a.tagId ?? "").toLowerCase();
      return name.includes(term) || tag.includes(term);
    });

  const shownAnimals = [...filteredAnimals].sort((a, b) => {
    if (!sort) return 0;

    const dir = order === "asc" ? 1 : -1;

    if (sort === "weight") {
      return dir * ((Number(a.weight) || 0) - (Number(b.weight) || 0));
    }

    if (sort === "dob" || sort === "dop") {
      return dir * String(a[sort] ?? "").localeCompare(String(b[sort] ?? ""));
    }

    return (
      dir *
      String(a.tagId ?? "").localeCompare(String(b.tagId ?? ""), undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  });

  return (
    <>
      <Header />

      <div className="container py-4">
        <h1 className="mb-5">My Animals</h1>

        <div className="d-flex flex-column flex-lg-row gap-3 mb-4 align-items-stretch">
          <div className="d-flex flex-column flex-md-row flex-wrap gap-3 align-items-stretch align-items-md-center">
            <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
              <label className="m-0 fw-semibold">Sort by:</label>
              <select
                className="form-select w-100 w-sm-auto"
                value={sort}
                onChange={sortSelect}
              >
                <option value="">Select…</option>
                <option value="tagId">ID</option>
                <option value="weight">Weight</option>
                <option value="dob">DOB</option>
                <option value="dop">DOP</option>
              </select>
            </div>

            <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
              <label className="m-0 fw-semibold">Direction:</label>
              <select
                className="form-select w-100 w-sm-auto"
                value={order}
                onChange={orderSelect}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
              <label className="m-0 fw-semibold">Species:</label>
              <select
                className="form-select w-100 w-sm-auto"
                value={species}
                onChange={speciesSelect}
              >
                <option value="All">All</option>
                <option value="Goat">Goat</option>
                <option value="Sheep">Sheep</option>
                <option value="Cow">Cow</option>
                <option value="Pig">Pig</option>
                <option value="Chicken">Chicken</option>
              </select>
            </div>

            <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
              <label className="m-0 fw-semibold">Sex:</label>
              <select
                className="form-select w-100 w-sm-auto"
                value={sex}
                onChange={sexSelect}
              >
                <option value="All">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div
            className="w-100 w-lg-auto ms-lg-auto"
            style={{ maxWidth: "22rem" }}
          >
            <div className="input-group mt-3 mt-lg-0">
              <input
                className="form-control "
                type="search"
                placeholder="Search by name or ID..."
                value={query}
                onChange={(e) => {
                  const v = e.target.value;
                  setQuery(v);
                  if (v.trim() === "") setSearch("");
                }}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleSearch}
              >
                <i className="bi bi-search" />
              </button>
            </div>
          </div>
        </div>

        {animals.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center text-center py-5">
            <div>
              <h4 className="mb-2">No animals yet</h4>
              <p className="text-body-secondary m-0">Add one to get started!</p>
            </div>
          </div>
        ) : shownAnimals.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center text-center py-5">
            <p className="text-body-secondary m-0">
              No animals match your current filters/search.
            </p>
          </div>
        ) : (
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Sex</th>
                <th>Species</th>
                <th>Weight</th>
                <th>DOB</th>
                <th>DOP</th>
              </tr>
            </thead>
            <tbody>
              {shownAnimals.map((a) => (
                <tr key={a.id} onClick={() => navigate(`/animals/${a.id}`)}>
                  <td>{a.tagId}</td>
                  <td>{a.name}</td>
                  <td>{a.sex}</td>
                  <td>{a.species}</td>
                  <td>{a.weight}lbs</td>
                  <td>{a.dob}</td>
                  <td>{a.dop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default View;
