import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editData = location.state?.data || null;

  const loggedUser = JSON.parse(localStorage.getItem("logged_user") || "null");

  const isEditMode = Boolean(editData || loggedUser?._id);

  const [showPassword, setShowPassword] = useState(false);

  const maxDob = new Date(
    new Date().getFullYear() - 18,
    new Date().getMonth(),
    new Date().getDate()
  )
    .toISOString()
    .split("T")[0];

  const motherTongueOptions = [
    "Telugu",
    "Hindi",
    "Tamil",
    "Kannada",
    "Malayalam",
    "English",
    "Marathi",
    "Bengali",
    "Gujarati",
    "Punjabi",
    "Urdu",
    "Odia",
  ];

  const religionOptions = [
    "Hindu",
    "Muslim",
    "Christian",
    "Sikh",
    "Jain",
    "Buddhist",
    "Other",
  ];

  const casteOptions = [
    "OC",
    "BC-A",
    "BC-B",
    "BC-C",
    "BC-D",
    "BC-E",
    "SC",
    "ST",
    "Other",
  ];

  const countryOptions = ["India", "USA", "UK", "Canada", "Australia", "Other"];

  const stateOptions = [
    "Andhra Pradesh",
    "Telangana",
    "Tamil Nadu",
    "Karnataka",
    "Kerala",
    "Maharashtra",
    "Delhi",
    "Gujarat",
    "West Bengal",
    "Other",
  ];

  const heightOptions = useMemo(() => {
    const heights = [];
    for (let feet = 4; feet <= 7; feet++) {
      for (let inches = 0; inches < 12; inches++) {
        heights.push(`${feet}'${inches}"`);
      }
    }
    return heights;
  }, []);

  const [formData, setFormData] = useState(
    editData ||
      JSON.parse(localStorage.getItem("matrimony_draft") || "null") ||
      loggedUser || {
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

  const calculateAge = (dob) => {
    if (!dob) return "";

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age > 0 ? age : "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dob") {
      const age = calculateAge(value);

      setFormData((prev) => ({
        ...prev,
        dob: value,
        age,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    if (!formData.dob) {
      alert("Please select Date of Birth");
      return;
    }

    if (!formData.age || Number(formData.age) < 18) {
      alert("Only users aged 18 and above can register");
      return;
    }

    if (!isEditMode && !formData.password) {
      alert("Password required");
      return;
    }

    navigate("/profile-preview", { state: { data: formData } });
  };

  return (
    <div className="page-fade min-h-screen bg-gradient-to-r from-pink-200 via-rose-100 to-purple-200 flex items-center justify-center py-12 px-4">
      <div className="card-glass p-8 md:p-10 w-full max-w-5xl">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center text-pink-600 mb-3 leading-tight">
          💖 Create Your Matrimony Profile
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Input
            label="Full Name"
            name="name"
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

          <div>
            <label className="block text-sm font-semibold mb-2">
              Date of Birth
            </label>

            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              max={maxDob}
              className="input-soft"
              required
            />
          </div>

          <Input
            label="Age"
            name="age"
            value={formData.age}
            readOnly
            bgClass="bg-gray-100"
          />

          <Select
            label="Height"
            name="height"
            value={formData.height}
            placeholder="Select Height"
            options={heightOptions}
            onChange={handleChange}
          />

          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />

          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <Input
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          {!isEditMode && (
            <PasswordInput
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              value={formData.password}
              onChange={handleChange}
            />
          )}

          <button
            type="submit"
            className="btn-primary md:col-span-2 w-full"
          >
            Preview Profile ✅
          </button>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, name, value, onChange, readOnly = false, bgClass = "" }) => (
  <div>
    <label className="block text-sm font-semibold mb-2">{label}</label>
    <input
      type="text"
      name={name}
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
    <label className="block text-sm font-semibold mb-2">{label}</label>
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

const PasswordInput = ({ showPassword, setShowPassword, value, onChange }) => (
  <div className="relative w-full">
    <label className="block text-sm font-semibold mb-2">Password</label>

    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={value}
      onChange={onChange}
      className="input-soft w-full pr-24"
      required
    />

    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute right-4 top-[42px] text-sm font-semibold text-pink-600"
    >
      {showPassword ? "Hide" : "View"}
    </button>
  </div>
);
export default Register;