import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:8000/api/auth/register", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5">
      <section className="mx-auto" style={{ maxWidth: "440px" }}>
        <h1 className="h3 mb-2">Create your account</h1>
        <p className="text-muted mb-4">Join CricCart to manage your cricket gear orders.</p>
        <form onSubmit={handleSignup}>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div className="mb-3">
            <label className="form-label" htmlFor="signup-name">Full name</label>
            <input id="signup-name" className="form-control" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="signup-email">Email</label>
            <input id="signup-email" type="email" className="form-control" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <input id="signup-password" type="password" className="form-control" autoComplete="new-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="signup-confirm-password">Confirm password</label>
            <input id="signup-confirm-password" type="password" className="form-control" autoComplete="new-password" minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          </div>
          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
          <p className="text-center mt-3 mb-0">Already registered? <Link to="/login">Log in</Link></p>
        </form>
      </section>
    </main>
  );
}

export default Signup;