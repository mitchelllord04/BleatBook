import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

import validator from "validator";
import PasswordField from "../components/PasswordField";

function CreateAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleCreateAccount(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!validator.isEmail(email)) {
      setError("Invalid email address.");
      return;
    }

    if (!validator.isStrongPassword(password)) {
      setError("Password is too weak.");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(cred.user, {
        displayName: name.trim(),
      });

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <div className="card shadow-sm" style={{ maxWidth: 450, width: "100%" }}>
        <div className="card-body p-4">
          <h1 className="h3 mb-1">Create Account</h1>
          <p className="text-body-secondary mb-4">
            Join BleatBook and start tracking your animals 🐐
          </p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleCreateAccount} className="d-grid gap-3">
            {/* Name */}
            <div>
              <label className="form-label">Name</label>
              <input
                className="form-control"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <PasswordField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="form-text">
                Use at least 8 characters with numbers + symbols.
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary">
              Create Account
            </button>

            {/* Back */}
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/")}
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;
