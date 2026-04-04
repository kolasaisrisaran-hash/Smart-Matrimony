import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from "../utils/api";

const emptyForm = {
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
};

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

const maritalStatusOptions = ["Never Married", "Divorced", "Widowed"];

const subCasteOptionsMap = {
  OC: [
    "Kapu",
    "Reddy",
    "Kamma",
    "Velama",
    "Rajulu",
    "Arya Vysya",
    "Brahmin",
    "Vaishya",
    "Other",
  ],
  "BC-A": [
    "Agnikula Kshatriya",
    "Bestha",
    "Jalari",
    "Gangavar",
    "Vanne Kapu",
    "Other",
  ],
  "BC-B": [
    "Padmashali",
    "Goud",
    "Munnuru Kapu",
    "Yadava",
    "Kuruma",
    "Kummari",
    "Vaddera",
    "Other",
  ],
  "BC-C": ["Converted Christian", "Other"],
  "BC-D": [
    "Kummari",
    "Gandla",
    "Nagavamsam",
    "Gavara",
    "Settibalija",
    "Other",
  ],
  "BC-E": ["Shaik", "Syed", "Dudekula", "Pathan", "Other"],
  SC: ["Mala", "Madiga", "Relli", "Adi Andhra", "Other"],
  ST: ["Yanadi", "Lambadi", "Koya", "Sugali", "Gond", "Other"],
  Other: ["Other"],
};

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editData = location.state?.data || null;
  const loggedUser = JSON.parse(localStorage.getItem("logged_user") || "null");
  const draftData = JSON.parse(localStorage.getItem("matrimony_draft") || "null");

  const isEditMode = Boolean(editData || loggedUser?._id);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const maxDob = new Date(
    new Date().getFullYear() - 18,
    new Date().getMonth(),
    new Date().getDate()
  )
    .toISOString()
    .split("T")[0];

  const heightOptions = useMemo(() => {
    const heights = [];
    for (let feet = 4; feet <= 7; feet++) {
      for (let inches = 0; inches < 12; inches++) {
        heights.push(`${feet}'${inches}"`);
      }
    }
    return heights;
  }, []);

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

  const normalizeText = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[._-]/g, "");

  const matchOption = (value, options) => {
    if (!value) return "";

    const raw = String(value).trim();
    const exact = options.find((opt) => opt === raw);
    if (exact) return exact;

    const normalizedValue = normalizeText(raw);
    const normalizedMatch = options.find(
      (opt) => normalizeText(opt) === normalizedValue
    );

    return normalizedMatch || "";
  };

  const normalizeHeight = (value) => {
    if (!value) return "";

    const raw = String(value).trim();

    if (heightOptions.includes(raw)) return raw;

    let match = raw.match(
      /(\d)\s*(?:ft|feet|')\s*(\d{1,2})\s*(?:in|inch|inches|")?/i
    );
    if (match) return `${match[1]}'${match[2]}"`;

    match = raw.match(/^(\d)\s*[\.\-]\s*(\d{1,2})$/);
    if (match) return `${match[1]}'${match[2]}"`;

    match = raw.match(/^(\d)\s+(\d{1,2})$/);
    if (match) return `${match[1]}'${match[2]}"`;

    return matchOption(raw, heightOptions);
  };

  const getImageSrc = (photoValue) => {
    if (!photoValue) return "";

    const value = String(photoValue).trim();
    if (!value) return "";

    if (
      value.startsWith("data:image/") ||
      value.startsWith("blob:") ||
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      return value;
    }

    if (value.startsWith("/")) {
      return `${API_BASE}${value}`;
    }

    return `${API_BASE}/${value}`;
  };

  const getAboutValue = (data = {}) =>
    data.about ||
    data.aboutMe ||
    data.about_me ||
    data.bio ||
    data.description ||
    "";

  const normalizeProfileData = (data = {}) => {
    const normalizedDob = data.dob
      ? String(data.dob).includes("T")
        ? String(data.dob).split("T")[0]
        : data.dob
      : "";

    const rawPhoto =
      data.photo ||
      data.profilePhoto ||
      data.profile_image ||
      data.image ||
      data.avatar ||
      "";

    const matchedCaste = matchOption(data.caste || "", casteOptions);
    const subCasteList = subCasteOptionsMap[matchedCaste] || [];
    const matchedSubCaste = matchOption(
      data.subCaste || data.subcaste || data.sub_caste || "",
      subCasteList
    );

    const normalized = {
      ...emptyForm,
      ...data,
      maritalStatus: matchOption(
        data.maritalStatus || data.marriedStatus || data.marital_status || "",
        maritalStatusOptions
      ),
      motherTongue: matchOption(
        data.motherTongue || data.mother_tongue || data.mothertongue || "",
        motherTongueOptions
      ),
      religion: matchOption(data.religion || "", religionOptions),
      caste: matchedCaste,
      subCaste: matchedSubCaste,
      height: normalizeHeight(data.height),
      income: data.income || data.annualIncome || data.salary || "",
      fatherName: data.fatherName || data.father || "",
      motherName: data.motherName || data.mother || "",
      siblings: data.siblings || data.noOfSiblings || data.numberOfSiblings || "",
      about: getAboutValue(data),
      photo: rawPhoto,
      email: data.email || "",
      dob: normalizedDob,
      password: "",
    };

    normalized.age = normalizedDob
      ? calculateAge(normalizedDob)
      : data.age || "";

    return normalized;
  };

  const getInitialFormData = () => {
    if (editData) return normalizeProfileData(editData);
    if (isEditMode && loggedUser) return normalizeProfileData(loggedUser);
    if (draftData) return normalizeProfileData(draftData);
    return emptyForm;
  };

  const [formData, setFormData] = useState(getInitialFormData);

  const subCasteOptions = subCasteOptionsMap[formData.caste] || [];

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const currentLoggedUser = JSON.parse(
          localStorage.getItem("logged_user") || "null"
        );
        if (!currentLoggedUser?._id) return;

        setLoadingProfile(true);

        const res = await axios.get(
          `${API_BASE}/api/profiles/${currentLoggedUser._id}`
        );

        const latestProfile = res.data?.user || res.data;
        if (!latestProfile) return;

        const normalized = normalizeProfileData(latestProfile);
        setFormData(normalized);

        localStorage.setItem("logged_user", JSON.stringify(latestProfile));
        localStorage.setItem("matrimony_profile", JSON.stringify(latestProfile));
        localStorage.setItem("matrimony_draft", JSON.stringify(latestProfile));
      } catch (err) {
        console.error("Profile fetch failed:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (isEditMode && loggedUser?._id) {
      fetchLatestProfile();
    }
  }, [isEditMode, loggedUser?._id]);

  useEffect(() => {
    localStorage.setItem("matrimony_draft", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dob") {
      setFormData((prev) => ({
        ...prev,
        dob: value,
        age: calculateAge(value),
      }));
      return;
    }

    if (name === "caste") {
      setFormData((prev) => ({
        ...prev,
        caste: value,
        subCaste: "",
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

  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      photo: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailValue = (formData.email || "").trim().toLowerCase();

    if (!emailValue.endsWith("@gmail.com")) {
      alert("Only Gmail addresses are allowed");
      return;
    }

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

    navigate("/preview", {
      state: {
        data: {
          ...formData,
          email: emailValue,
        },
      },
    });
  };

  const previewImageSrc = getImageSrc(formData.photo);

  return (
    <div className="page-fade min-h-screen bg-gradient-to-r from-pink-200 via-rose-100 to-purple-200 flex items-center justify-center py-12 px-4">
      <div className="card-glass p-8 md:p-10 w-full max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-pink-600 mb-3 leading-tight">
          💖 Create Your Matrimony Profile
        </h2>

        <p className="text-center text-gray-500 mb-8 text-sm md:text-base">
          Complete your profile with accurate details to find the right match.
        </p>

        {loadingProfile && isEditMode && (
          <div className="mb-6 text-center text-sm font-semibold text-pink-600">
            Loading latest profile data...
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
            <p className="text-xs text-pink-600 mt-2">
              Only users aged 18 and above can register.
            </p>
          </div>

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

          <Select
            label="Height"
            name="height"
            value={formData.height}
            placeholder="Select Height"
            options={heightOptions}
            onChange={handleChange}
          />

          <Select
            label="Marital Status"
            name="maritalStatus"
            value={formData.maritalStatus}
            placeholder="Select Marital Status"
            options={maritalStatusOptions}
            onChange={handleChange}
          />

          <Select
            label="Mother Tongue"
            name="motherTongue"
            value={formData.motherTongue}
            placeholder="Select Mother Tongue"
            options={motherTongueOptions}
            onChange={handleChange}
          />

          <Select
            label="Religion"
            name="religion"
            value={formData.religion}
            placeholder="Select Religion"
            options={religionOptions}
            onChange={handleChange}
          />

          <Select
            label="Caste"
            name="caste"
            value={formData.caste}
            placeholder="Select Caste"
            options={casteOptions}
            onChange={handleChange}
          />

          <Select
            label="Sub-Caste"
            name="subCaste"
            value={formData.subCaste}
            placeholder={
              formData.caste ? "Select Sub-Caste" : "Select Caste First"
            }
            options={subCasteOptions}
            onChange={handleChange}
            disabled={!formData.caste}
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

          <Select
            label="Country"
            name="country"
            value={formData.country}
            placeholder="Select Country"
            options={countryOptions}
            onChange={handleChange}
          />

          <Select
            label="State"
            name="state"
            value={formData.state}
            placeholder="Select State"
            options={stateOptions}
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

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Profile Photo
            </label>

            <div className="rounded-3xl border border-white/60 bg-white/75 backdrop-blur-sm shadow-[0_10px_30px_rgba(244,114,182,0.10)] p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="shrink-0">
                  {previewImageSrc ? (
                    <div className="relative">
                      <img
                        src={previewImageSrc}
                        alt="Profile Preview"
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="absolute -bottom-2 -right-2 px-2 py-1 rounded-full bg-white text-[10px] font-bold text-emerald-600 border border-emerald-100 shadow-sm">
                        Added
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-100 border border-dashed border-pink-200 flex items-center justify-center text-3xl text-pink-400 shadow-sm">
                      📷
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-pink-600"
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {previewImageSrc ? (
                      <>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          Profile image ready
                        </span>

                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-pink-600 border border-pink-200 hover:bg-pink-50 transition"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200">
                        JPG, PNG supported
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                    Choose a clear front-facing photo for a better profile appearance.
                  </p>
                </div>
              </div>
            </div>
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
              value={formData.about || ""}
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
              title="Only Gmail addresses are allowed"
              required
            />
          </div>

          {!isEditMode && (
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
          )}

          <button
            type="submit"
            className="btn-primary md:col-span-2 w-full"
            disabled={loadingProfile}
          >
            {loadingProfile ? "Loading..." : "Preview Profile ✅"}
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
      value={value || ""}
      onChange={onChange}
      readOnly={readOnly}
      className={`input-soft ${bgClass}`}
      required={!readOnly}
    />
  </div>
);

const Select = ({
  label,
  name,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`input-soft ${
        disabled ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
      required={!disabled}
      disabled={disabled}
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