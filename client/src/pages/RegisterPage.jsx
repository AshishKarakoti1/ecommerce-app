import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authApi";
import { AuthContext } from "../context/authContext";

export default function RegisterPage() {
    const { login } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await registerUser({ name, email, password });
            login(res.data);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">Register</h2>
            {error && <div className="mb-4 text-red-600">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border p-2 rounded"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border p-2 rounded"
                />
                <input
                    type="password"
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="border p-2 rounded"
                />
                <button
                    type="submit"
                    className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
                >
                    Register
                </button>
            </form>
        </div>
    );
}
