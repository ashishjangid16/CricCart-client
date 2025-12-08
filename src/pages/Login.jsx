import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", {
        email,
        password,
      });

      //Save token to localStorage here
      localStorage.setItem("token", res.data.token);

      setError("");
      navigate("/"); // Redirect to home or dashboard
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">Login</h2>
      <form onSubmit={handleLogin} className="mx-auto" style={{ maxWidth: "400px" }}>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;





















// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await axios.post("http://localhost:8000/api/users/login", {
//         email,
//         password,
//       });

//       // ✅ Save token to localStorage
//       localStorage.setItem("token", res.data.token);

//       alert("Login successful!");
//       navigate("/"); // redirect to homepage or wherever you want
//     } catch (err) {
//       console.error("Login failed:", err);
//       alert("Invalid credentials or server error.");
//     }
//   };

//   return (
//     <div className="container py-5">
//       <h2 className="text-center mb-4">Login</h2>
//       <form onSubmit={handleLogin} className="w-50 mx-auto">
//         <div className="mb-3">
//           <label>Email:</label>
//           <input
//             type="email"
//             className="form-control"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>

//         <div className="mb-3">
//           <label>Password:</label>
//           <input
//             type="password"
//             className="form-control"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>

//         <button type="submit" className="btn btn-primary w-100">
//           Login 🔐
//         </button>
//       </form>
//     </div>
//   );
// }

// export default Login;
