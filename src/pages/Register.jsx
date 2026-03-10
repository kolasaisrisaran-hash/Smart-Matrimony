import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = useMemo(() => location.state?.mode === "edit", [location.state]);
  const editData = location.state?.data || null;

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState(
    editData ||
      JSON.parse(localStorage.getItem("matrimony_draft") || "null") || {
        name: "",
        gender: "",
        dob: "",
        age: "",
        height: "",
        maritalStatus: "",
        motherTongue: "",
        religion: "",
        caste: "",
        subCaste: "",
        education: "",
        occupation: "",
        income: "",
        country: "",
        state: "",
        city: "",
        phone: "",
        fatherName: "",
        motherName: "",
        siblings: "",
        about: "",
        photo: "",
        email: "",
        password: "",
      }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dob") {
      const birthDate = new Date(value);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

      setFormData((p) => ({ ...p, dob: value, age }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((p) => ({ ...p, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    localStorage.setItem("matrimony_draft", JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = { ...formData };
    if (isEdit && !payload.password) delete payload.password;

    navigate("/preview", { state: payload });
  };

  return (
    <div className="page-fade min-h-screen bg-gradient-to-r from-pink-200 via-rose-100 to-purple-200 flex items-center justify-center py-12 px-4">
      <div className="card-glass p-10 w-full max-w-5xl">
        <h2 className="text-4xl font-extrabold text-center text-pink-600 mb-8">
          💖 {isEdit ? "Edit Your Profile" : "Create Your Matrimony Profile"}
        </h2>

        {formData.photo && (
          <div className="flex justify-center mb-6">
            <img
              src={formData.photo}
              alt="preview"
              className="w-24 h-24 rounded-full object-cover border-4 border-pink-500 shadow-lg"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />
          <Select
            name="gender"
            value={formData.gender}
            options={["Male", "Female"]}
            onChange={handleChange}
          />

          <Input type="date" name="dob" value={formData.dob} onChange={handleChange} />

          <input
            type="text"
            value={formData.age || ""}
            readOnly
            placeholder="Age"
            className="input-soft bg-gray-100"
          />

          <Input
            name="height"
            placeholder="Height (5'8)"
            value={formData.height}
            onChange={handleChange}
          />
          <Select
            name="maritalStatus"
            value={formData.maritalStatus}
            options={["Never Married", "Divorced", "Widowed"]}
            onChange={handleChange}
          />

          <Input
            name="motherTongue"
            placeholder="Mother Tongue"
            value={formData.motherTongue}
            onChange={handleChange}
          />
          <Input
            name="religion"
            placeholder="Religion"
            value={formData.religion}
            onChange={handleChange}
          />
          <Input name="caste" placeholder="Caste" value={formData.caste} onChange={handleChange} />
          <Input
            name="subCaste"
            placeholder="Sub-Caste"
            value={formData.subCaste}
            onChange={handleChange}
          />
          <Input
            name="education"
            placeholder="Education"
            value={formData.education}
            onChange={handleChange}
          />
          <Input
            name="occupation"
            placeholder="Occupation"
            value={formData.occupation}
            onChange={handleChange}
          />
          <Input
            name="income"
            placeholder="Annual Income"
            value={formData.income}
            onChange={handleChange}
          />
          <Input
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
          />
          <Input name="state" placeholder="State" value={formData.state} onChange={handleChange} />
          <Input name="city" placeholder="City" value={formData.city} onChange={handleChange} />

          <Input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />

          <Input
            name="fatherName"
            placeholder="Father Name"
            value={formData.fatherName}
            onChange={handleChange}
          />
          <Input
            name="motherName"
            placeholder="Mother Name"
            value={formData.motherName}
            onChange={handleChange}
          />
          <Input
            name="siblings"
            placeholder="Number of Siblings"
            value={formData.siblings}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-semibold mb-1">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="input-soft"
            />
          </div>

          <textarea
            name="about"
            placeholder="About Me"
            className="input-soft md:col-span-2"
            rows="3"
            value={formData.about}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email (only @gmail.com)"
            value={formData.email}
            onChange={handleChange}
            className="input-soft"
            pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
            title="Only Gmail addresses are allowed"
            required
          />

          {/* ✅ Password with show/hide */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={isEdit ? "New Password (optional)" : "Password"}
              value={formData.password}
              onChange={handleChange}
              className="input-soft pr-16"
              required={!isEdit}
            />

            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-pink-600 hover:text-pink-700"
            >
              {showPassword ? "Hide" : "View"}
            </button>
          </div>

          <button type="submit" className="btn-primary md:col-span-2 w-full">
            {isEdit ? "Preview Update ✅" : "Preview Profile ✅"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Input = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  required = true,
}) => (
  <input
    type={type}
    name={name}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="input-soft"
    required={required}
  />
);

const Select = ({ name, value, options, onChange }) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="input-soft"
    required
  >
    <option value="">Select</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

export default Register;