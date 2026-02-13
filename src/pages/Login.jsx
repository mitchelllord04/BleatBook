import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

import PasswordField from "../components/PasswordField";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <div className="card shadow-sm" style={{ maxWidth: 420, width: "100%" }}>
        <div className="card-body p-4">
          <h1 className="h3 mb-1">Welcome to BleatBook!</h1>
          <p className="text-body-secondary mb-4">Log in to your account.</p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleLogin} className="d-grid gap-3">
            <div>
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <PasswordField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Sign In
            </button>

            <div className="d-flex justify-content-between align-items-center">
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => navigate("/reset-password")}
              >
                Forgot password?
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/createAccount")}
              >
                Create account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
