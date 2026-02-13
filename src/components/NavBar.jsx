import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function NavBar() {
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/");
  }

  return (
    <ul className="nav nav-underline">
      <li className="nav-item">
        <NavLink to="/home" className="nav-link">
          Home
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink to="/add" className="nav-link">
          Add
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink to="/view" className="nav-link">
          View
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink to="/analytics" className="nav-link">
          Analytics
        </NavLink>
      </li>

      <li className="nav-item signout">
        <button
          className="nav-link "
          style={{ textDecoration: "none" }}
          onClick={handleLogout}
        >
          Sign Out
        </button>
      </li>
    </ul>
  );
}

export default NavBar;
