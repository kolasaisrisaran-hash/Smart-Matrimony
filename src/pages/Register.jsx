import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      setFormData((prev) => ({
        ...prev,
        dob: value,
        age: age > 0 ? age : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        photo: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    localStorage.setItem("matrimony_draft", JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/preview", { state: formData });
  };

  return (
    <div className="page-fade min-h-screen bg-gradient-to-r from-pink-200 via-rose-100 to-purple-200 flex items-center justify-center py-12 px-4">
      <div className="card-glass p-8 md:p-10 w-full max-w-5xl">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center text-pink-600 mb-8 leading-tight">
          💖 Create Your Matrimony Profile
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
            label="Full Name"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
          />

          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            placeholder="Select Gender"
            options={["Male", "Female"]}
            onChange={handleChange}
          />

          <Input
            label="Date of Birth"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
          />

          <Input
            label="Age"
            type="text"
            name="age"
            placeholder="Age"
            value={formData.age || ""}
            onChange={() => {}}
            readOnly
            bgClass="bg-gray-100"
          />

          <Input
            label="Height"
            name="height"
            placeholder={`Enter height (5'8")`}
            value={formData.height}
            onChange={handleChange}
          />

          <Select
            label="Marital Status"
            name="maritalStatus"
            value={formData.maritalStatus}
            placeholder="Select Marital Status"
            options={["Never Married", "Divorced", "Widowed"]}
            onChange={handleChange}
          />

          <Input
            label="Mother Tongue"
            name="motherTongue"
            placeholder="Enter mother tongue"
            value={formData.motherTongue}
            onChange={handleChange}
          />

          <Input
            label="Religion"
            name="religion"
            placeholder="Enter religion"
            value={formData.religion}
            onChange={handleChange}
          />

          <Input
            label="Caste"
            name="caste"
            placeholder="Enter caste"
            value={formData.caste}
            onChange={handleChange}
          />

          <Input
            label="Sub-Caste"
            name="subCaste"
            placeholder="Enter sub-caste"
            value={formData.subCaste}
            onChange={handleChange}
          />

          <Input
            label="Education"
            name="education"
            placeholder="Enter education"
            value={formData.education}
            onChange={handleChange}
          />

          <Input
            label="Occupation"
            name="occupation"
            placeholder="Enter occupation"
            value={formData.occupation}
            onChange={handleChange}
          />

          <Input
            label="Annual Income"
            name="income"
            placeholder="Enter annual income"
            value={formData.income}
            onChange={handleChange}
          />

          <Input
            label="Country"
            name="country"
            placeholder="Enter country"
            value={formData.country}
            onChange={handleChange}
          />

          <Input
            label="State"
            name="state"
            placeholder="Enter state"
            value={formData.state}
            onChange={handleChange}
          />

          <Input
            label="City"
            name="city"
            placeholder="Enter city"
            value={formData.city}
            onChange={handleChange}
          />

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleChange}
          />

          <Input
            label="Father Name"
            name="fatherName"
            placeholder="Enter father name"
            value={formData.fatherName}
            onChange={handleChange}
          />

          <Input
            label="Mother Name"
            name="motherName"
            placeholder="Enter mother name"
            value={formData.motherName}
            onChange={handleChange}
          />

          <Input
            label="Number of Siblings"
            name="siblings"
            placeholder="Enter number of siblings"
            value={formData.siblings}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="input-soft"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              About Me
            </label>
            <textarea
              name="about"
              placeholder="Write something about yourself"
              className="input-soft w-full"
              rows="3"
              value={formData.about}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter Gmail address"
              value={formData.email}
              onChange={handleChange}
              className="input-soft"
              pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
              title="Only Gmail addresses are allowed"
              required
            />
          </div>

          <div className="relative w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="input-soft w-full pr-24 password-input"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-[42px] text-sm font-semibold text-pink-600 hover:text-pink-700 z-10 bg-transparent border-none"
            >
              {showPassword ? "Hide" : "View"}
            </button>
          </div>

          <button type="submit" className="btn-primary md:col-span-2 w-full">
            Preview Profile ✅
          </button>
        </form>
      </div>
    </div>
  );
};

const Input = ({
  label,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  readOnly = false,
  bgClass = "",
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`input-soft ${bgClass}`}
      required={!readOnly}
    />
  </div>
);

const Select = ({ label, name, value, options, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="input-soft"
      required
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default Register;