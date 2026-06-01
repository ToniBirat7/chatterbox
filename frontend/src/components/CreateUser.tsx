import React, { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { validateEmail, validatePassword, validateName } from "../utils/common";
import { AUTH_URL } from "../consts";

interface FormData {
  fname: string;
  lname: string;
  email: string;
  password: string;
  address: string;
}

interface FormErrors {
  fname?: string;
  lname?: string;
  email?: string;
  password?: string;
  address?: string;
}

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    fname: "",
    lname: "",
    email: "",
    password: "",
    address: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validate form
  const validateForm = (): void => {
    const newErrors: FormErrors = {};

    if (!formData.fname.trim()) {
      newErrors.fname = "First name is required";
    } else if (!validateName(formData.fname)) {
      newErrors.fname = "First name must be at least 2 characters";
    }

    if (!formData.lname.trim()) {
      newErrors.lname = "Last name is required";
    } else if (!validateName(formData.lname)) {
      newErrors.lname = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }

    setErrors(newErrors);
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateForm();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${AUTH_URL}/create-user`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json() as { msg: string };

      if (!response.ok) {
        setSubmitError(data.msg ?? "Failed to create account. Try again.");
        return;
      }

      navigate("/login");
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join Palm Mind and start chatting</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-8 border border-[#3a3a3a]">
          {submitError && (
            <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-sm text-red-400">{submitError}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name */}
            <div>
              <label
                htmlFor="fname"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                id="fname"
                name="fname"
                value={formData.fname}
                onChange={handleChange}
                className={`chat-input w-full ${
                  errors.fname ? "border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="John"
              />
              {errors.fname && (
                <p className="mt-1 text-sm text-red-400">{errors.fname}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lname"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lname"
                name="lname"
                value={formData.lname}
                onChange={handleChange}
                className={`chat-input w-full ${
                  errors.lname ? "border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="Doe"
              />
              {errors.lname && (
                <p className="mt-1 text-sm text-red-400">{errors.lname}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`chat-input w-full ${
                  errors.email ? "border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`chat-input w-full pr-12 ${
                    errors.password ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={`chat-input w-full resize-none ${
                  errors.address ? "border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="123 Main Street, City, State, ZIP"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-400">{errors.address}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-white hover:text-gray-300 font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
