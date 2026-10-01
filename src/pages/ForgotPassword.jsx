import { useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";

function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (token && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = token
        ? await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, { token, password })
        : await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, { email });
      setMessage(response.data.message);
      if (token) setResetComplete(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to complete the request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5">
      <section className="mx-auto" style={{ maxWidth: "440px" }}>
        <h1 className="h3 mb-2">{token ? "Choose a new password" : "Reset your password"}</h1>
        <p className="text-muted mb-4">
          {token ? "Set a new password for your CricCart account." : "Enter your account email and we will send a reset link."}
        </p>
        <form onSubmit={handleSubmit}>
          {message && <div className="alert alert-success" role="status">{message}</div>}
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {!token ? (
            <div className="mb-4">
              <label className="form-label" htmlFor="reset-email">Email</label>
              <input id="reset-email" type="email" className="form-control" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
          ) : !resetComplete && (
            <>
              <div className="mb-3">
                <label className="form-label" htmlFor="new-password">New password</label>
                <input id="new-password" type="password" className="form-control" autoComplete="new-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>
              <div className="mb-4">
                <label className="form-label" htmlFor="confirm-new-password">Confirm new password</label>
                <input id="confirm-new-password" type="password" className="form-control" autoComplete="new-password" minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
              </div>
            </>
          )}
          {!resetComplete && (
            <button type="submit" className="btn btn-success w-100" disabled={loading}>
              {loading ? "Please wait..." : token ? "Reset password" : "Send reset link"}
            </button>
          )}
          <p className="text-center mt-3 mb-0"><Link to="/login">Back to login</Link></p>
        </form>
      </section>
    </main>
  );
}

export default ForgotPassword;