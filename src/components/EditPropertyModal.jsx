import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import { apiFetch } from "../utils/api";
import ProgressBar from "../components/ProgressBar";
import Input from "../components/Input";
import Button from "../components/Button";
import ExtraInput from "../components/ExtraInput";
import ImageUploadPopup from "../components/ImageUploadPopup";
import ImageReorder from "../components/ImageReorder";
import YesNoToggle from "../components/YesNoToggle";
import Counter from "../components/Counter";
import MapComponent from "../components/MapComponent";
import Notification from "../components/Notification";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import { X } from "lucide-react";
import CountrySelect from "../components/CountrySelect";
import AvailabilityCalendar from "../components/AvailabilityCalendar";

const LIBRARIES = ["places"];

const TREATMENT_ROOM_FEATURES = [
  {
    key: "plug",
    title: "Plug sockets",
    description: "Guests have access to electrical power outlets",
  },
  {
    key: "sound",
    title: "Sound Insulation",
    description: "Designed to minimize external and internal noise",
  },
  {
    key: "lockable",
    title: "Lockable door/storage",
    description: "Provides secure lockable storage or doors",
  },
  {
    key: "washbasin",
    title: "Washbasin",
    description: "Dedicated basin for washing and daily use",
  },
  {
    key: "clinicalSurface",
    title: "Clinical grade, wipeable surfaces",
    description: "Durable, non-porous surfaces designed for effective cleaning",
  },
  {
    key: "wasteBin",
    title: "Sharp bin & clinical waste",
    description: "Designated containers for sharps and medical waste disposal",
  },
  {
    key: "meetCQCStandards",
    title: "Meet CQC / local health authority standards",
    description:
      "Meets all required standards set by CQC and local health authorities",
  },
  {
    key: "electricBed",
    title: "Electric or hydraulic treatment bed",
    description:
      "Treatment bed that can be raised, lowered, and tilted electronically or hydraulically",
  },
  {
    key: "adjustableStool",
    title: "Adjustable stool for practitioners",
    description: "Ergonomic stool that can be adjusted for practitioner use",
  },
  {
    key: "trolley",
    title: "Clinical trolley",
    description: "Trolley designed to store and transport clinical instruments",
  },
  {
    key: "magnifyingLamp",
    title: "Magnifying lamp or ring",
    description:
      "Magnifying lamp or ring to enhance visibility during treatments",
  },
  {
    key: "storage",
    title: "Built-in storage cabinets or drawers",
    description: "Built-in storage solutions to keep supplies neatly arranged",
  },
  {
    key: "mirror",
    title: "Mirror for good facial lighting",
    description:
      "Well-lit mirror designed to enhance visibility for facial care",
  },
];

const MEDICAL_FEATURES = [
  {
    key: "consultationArea",
    title: "Consultation area with desk and chairs",
    description:
      "Providing exceptional comfort for patient evaluations and discussions with healthcare professionals.",
  },
  {
    key: "examinationCouch",
    title: "Examination couch with draw around curtain",
    description: "For added privacy during patient consultations.",
  },
  {
    key: "sinkCounter",
    title: "Sink & counter space",
    description: "To ensure hygienic and efficient medical procedures.",
  },
  {
    key: "adjustableEnvironment",
    title: "Adjustable room environment",
    description: "Air filtration, temperature control and lighting.",
  },
  {
    key: "sharpsBin",
    title: "Sharps disposable bin",
    description:
      "Providing a secure and hygienic solution for the proper disposal of medical sharps.",
  },
  {
    key: "naturalLight",
    title: "Natural light",
    description:
      "Enhances the overall ambiance and promotes a healing, calming environment for patients.",
  },
  {
    key: "dirtyTowelShoot",
    title: "In-built dirty towel disposal chute",
    description:
      "Promoting a clean and sterile environment for patients and staff.",
  },
  {
    key: "cqcCompliance",
    title: "Fully CQC compliant",
    description:
      "We are not CQC registered, but the space is fully compliant so basic procedures can be carried out by practitioners with their own CQC approval.",
  },
];

const DEFAULT_FEATURES = {
  wifi: true,
  restrooms: 1,
  sizeSQM: null,
  seatCapacity: null,
  plug: false,
  sound: false,
  lockable: false,
  washbasin: false,
  clinicalSurface: false,
  wasteBin: false,
  meetCQCStandards: false,
  electricBed: false,
  adjustableStool: false,
  trolley: false,
  magnifyingLamp: false,
  storage: false,
  mirror: false,
  bathroom: 1,
  consultationArea: false,
  examinationCouch: false,
  sinkCounter: false,
  adjustableEnvironment: false,
  sharpsBin: false,
  naturalLight: false,
  dirtyTowelShoot: false,
  cqcCompliance: false,
};

const DEFAULT_PRICING = {
  pricingType: "DAILY",
  weekdayPrice: null,
  hourlyPrice: null,
  preTaxPrice: null,
  discounts: {
    newListing: true,
    lastMinute: false,
    weekly: false,
    monthly: false,
  },
};

const EditPropertyModal = ({ property, onClose, onUpdate }) => {
  const totalSteps = 12;
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [availability, setAvailability] = useState(
    property.availability || "all"
  );
  const [blockedDates, setBlockedDates] = useState(property.blockedDates || []);
  const autocompleteRef = useRef(null);

  // ─── Seed spaceData from the property being edited ───────────────────────────
  const [spaceData, setSpaceData] = useState(() => {
    const serverImages = (property.images || []).map((img) => ({
      filename: img.filename,
      url: img.url,
    }));
    return {
      title: property.title || "",
      description: property.description || "",
      location: property.location || { address: "", city: "", country: "" },
      coordinates: property.coordinates || { latitude: null, longitude: null },
      features: { ...DEFAULT_FEATURES, ...(property.features || {}) },
      extras: property.extras || [],
      imageFiles: [],
      imagePreviews: [],
      serverImages,
      removedImages: [],
      coverImage: serverImages[0] || null,
      category: property.category?._id || property.category || "",
      subcategory: property.subcategory?._id || property.subcategory || "",
      pricing: {
        ...DEFAULT_PRICING,
        ...(property.pricing || {}),
        discounts: {
          ...DEFAULT_PRICING.discounts,
          ...(property.pricing?.discounts || {}),
        },
      },
      bookingSettings: {
        approveFirstFive: false,
        instantBook: true,
        approveAllBookings: false,
        ...(property.bookingSettings || {}),
      },
    };
  });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiFetch({
          endpoint: "/categories",
          method: "GET",
        });
        setCategories(response);
      } catch {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // Auto-fetch coordinates when arriving at step 4 with no coordinates
  useEffect(() => {
    if (
      step === 4 &&
      !spaceData.coordinates.latitude &&
      !spaceData.coordinates.longitude
    ) {
      fetchCoordinates();
    }
  }, [step]);

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const selectedCategory = categories.find((c) => c._id === spaceData.category);
  const subcategories = selectedCategory?.subcategory || [];
  const selectedCategoryHasSubcategories = () =>
    Array.isArray(selectedCategory?.subcategory) &&
    selectedCategory.subcategory.length > 0;

  const allPreviews = [
    ...(spaceData.serverImages || [])
      .filter((img) => !(spaceData.removedImages || []).includes(img.filename))
      .map((img) => img.url),
    ...(spaceData.imageFiles || []).map((file) => URL.createObjectURL(file)),
  ];

  // ─── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    const val =
      type === "checkbox" ? checked : type === "number" ? Number(value) : value;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setSpaceData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: val },
      }));
    } else {
      setSpaceData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleFeatureChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    setSpaceData((prev) => {
      const updated = { ...prev };
      let ref = updated;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleExtraChange = (index, updatedExtra) =>
    setSpaceData((prev) => ({
      ...prev,
      extras: prev.extras.map((extra, i) =>
        i === index ? updatedExtra : extra
      ),
    }));

  const handleAddExtra = () =>
    setSpaceData((prev) => ({
      ...prev,
      extras: [...prev.extras, { name: "", price: 0 }],
    }));

  const handleRemoveExtra = (index) =>
    setSpaceData((prev) => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index),
    }));

  const handleImageUpload = (newImages) => {
    setErrors((prev) => ({ ...prev, images: "" }));
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setSpaceData((prev) => ({
      ...prev,
      imageFiles: [...(prev.imageFiles || []), ...newImages],
      imagePreviews: [...(prev.imagePreviews || []), ...newPreviews],
      coverImage: prev.coverImage || newPreviews[0] || null,
    }));
  };

  const handleImageReorder = (reorderedPreviews) => {
    setSpaceData((prev) => {
      const oldPreviews = prev.imagePreviews;
      const serverImages = prev.serverImages || [];
      const imageFiles = prev.imageFiles || [];
      const serverPreviews = oldPreviews.slice(0, serverImages.length);
      const filePreviews = oldPreviews.slice(serverImages.length);
      const reorderedServerImages = [];
      const reorderedFiles = [];
      reorderedPreviews.forEach((preview) => {
        const serverIdx = serverPreviews.indexOf(preview);
        if (serverIdx !== -1)
          reorderedServerImages.push(serverImages[serverIdx]);
        else {
          const fileIdx = filePreviews.indexOf(preview);
          if (fileIdx !== -1) reorderedFiles.push(imageFiles[fileIdx]);
        }
      });
      return {
        ...prev,
        serverImages: reorderedServerImages,
        imageFiles: reorderedFiles,
        imagePreviews: reorderedPreviews,
        coverImage: reorderedPreviews[0] || null,
      };
    });
  };

  const handleDiscountChange = (e) => {
    const { name, checked } = e.target;
    setSpaceData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        discounts: { ...prev.pricing.discounts, [name]: checked },
      },
    }));
  };

  const onLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (!place.address_components) return;
    let streetNumber = "",
      route = "",
      city = "",
      country = "";
    place.address_components.forEach((component) => {
      const types = component.types;
      if (types.includes("street_number")) streetNumber = component.long_name;
      if (types.includes("route")) route = component.long_name;
      if (
        types.includes("locality") ||
        types.includes("postal_town") ||
        types.includes("administrative_area_level_2")
      ) {
        if (!city) city = component.long_name;
      }
      if (types.includes("country")) country = component.short_name;
    });
    const address = [streetNumber, route].filter(Boolean).join(" ");
    setSpaceData((prev) => ({
      ...prev,
      location: { ...prev.location, address, city, country },
    }));
  };

  const fetchCoordinates = async () => {
    try {
      const params = new URLSearchParams({
        address: spaceData.location.address,
        city: spaceData.location.city,
        country: spaceData.location.country,
      });
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/geocode?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch coordinates");
      const data = await response.json();
      setSpaceData((prev) => ({
        ...prev,
        coordinates: { latitude: data.latitude, longitude: data.longitude },
      }));
    } catch {
      setErrors((prev) => ({
        ...prev,
        coordinates: "Unable to locate this address on the map",
      }));
    }
  };

  const addBlock = (start, end) =>
    setBlockedDates((prev) => [...prev, { start, end }]);

  const removeBlock = (dateStr) =>
    setBlockedDates((prev) =>
      prev.filter(({ start, end }) => {
        const d = new Date(dateStr);
        return d < new Date(start) || d > new Date(end);
      })
    );

  // ─── Validation (mirrors CreateSpace exactly) ─────────────────────────────────
  const validateStep = () => {
    const newErrors = {};
    switch (step) {
      case 1:
        if (!spaceData.category)
          newErrors.category = "Please select a category";
        break;
      case 2:
        if (!spaceData.title.trim()) newErrors.title = "Space name is required";
        else if (spaceData.title.trim().length < 5)
          newErrors.title = "Title must be at least 5 characters long";
        if (!spaceData.description.trim())
          newErrors.description = "Description is required";
        else if (spaceData.description.trim().length < 50)
          newErrors.description =
            "Description must be at least 50 characters long";
        break;
      case 3:
        if (!spaceData.location.address.trim())
          newErrors["location.address"] = "Address is required";
        if (!spaceData.location.city.trim())
          newErrors["location.city"] = "City is required";
        if (!spaceData.location.country.trim())
          newErrors["location.country"] = "Country is required";
        break;
      case 4:
        if (!spaceData.coordinates.latitude || !spaceData.coordinates.longitude)
          newErrors.coordinates = "Please pin a location on the map";
        break;
      case 5:
        if (!spaceData.subcategory)
          newErrors.subcategory = "Please select a subcategory";
        break;
      case 6:
        if (!spaceData.features.sizeSQM || spaceData.features.sizeSQM <= 5)
          newErrors["features.sizeSQM"] = "Size must be greater than 5";
        if (
          !spaceData.features.seatCapacity ||
          spaceData.features.seatCapacity <= 0
        )
          newErrors["features.seatCapacity"] =
            "Seat capacity must be greater than 0";
        if (spaceData.features.restrooms < 0)
          newErrors["features.restrooms"] = "Restrooms cannot be negative";
        spaceData.extras.forEach((extra, index) => {
          if (!extra.name?.trim())
            newErrors[`extras.${index}.name`] = "Extra name is required";
          if (extra.price != null && extra.price < 0)
            newErrors[`extras.${index}.price`] = "Price cannot be negative";
        });
        break;
      case 7:
        if (
          spaceData.imageFiles.length === 0 &&
          (!spaceData.serverImages || spaceData.serverImages.length === 0)
        )
          newErrors.images = "At least one photo is required";
        break;
      case 9:
        if (spaceData.pricing.pricingType === "DAILY") {
          if (
            !spaceData.pricing.weekdayPrice ||
            spaceData.pricing.weekdayPrice <= 0
          )
            newErrors.weekdayPrice = "Enter a valid daily price";
        } else if (spaceData.pricing.pricingType === "HOURLY") {
          if (
            !spaceData.pricing.hourlyPrice ||
            spaceData.pricing.hourlyPrice <= 0
          )
            newErrors.hourlyPrice = "Enter a valid hourly price";
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0)
      toast.error("Please fix the errors before continuing");
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setErrors({});
      setStep((prev) => {
        const next = prev + 1;
        if (next === 5 && !selectedCategoryHasSubcategories()) return next + 1;
        return next;
      });
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => {
      const prevStep = prev - 1;
      if (prevStep === 5 && !selectedCategoryHasSubcategories())
        return Math.max(1, prevStep - 1);
      return Math.max(1, prevStep);
    });
  };

  // ─── Submit — PUT instead of POST ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", spaceData.title);
      formData.append("description", spaceData.description);
      formData.append("category", spaceData.category);
      formData.append("subcategory", spaceData.subcategory || "");
      formData.append("pricing", JSON.stringify(spaceData.pricing));
      formData.append("features", JSON.stringify(spaceData.features));
      formData.append(
        "bookingSettings",
        JSON.stringify(spaceData.bookingSettings)
      );
      formData.append("location", JSON.stringify(spaceData.location));
      formData.append("coordinates", JSON.stringify(spaceData.coordinates));
      formData.append("extras", JSON.stringify(spaceData.extras || []));
      formData.append("availability", availability);
      formData.append("blockedDates", JSON.stringify(blockedDates));
      formData.append("removedImages", JSON.stringify(spaceData.removedImages));
      spaceData.imageFiles.forEach((file) => formData.append("images", file));

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/properties/${property._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update space");

      toast.success("Space updated successfully!");
      onUpdate(data.property);
      onClose();
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Shared feature checkbox renderer ────────────────────────────────────────
  const renderFeatureCheckbox = ({ key, title, description }) => {
    const isChecked = spaceData.features[key];
    return (
      <label
        key={key}
        className={`flex items-center justify-between p-4 mt-4 border rounded-xl cursor-pointer transition-all ${
          isChecked
            ? "border-primary bg-blue-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() =>
          setSpaceData((prev) => ({
            ...prev,
            features: { ...prev.features, [key]: !prev.features[key] },
          }))
        }
      >
        <div className="flex flex-col items-start">
          <span className="font-medium text-gray-800">{title}</span>
          <p className="text-sm text-gray-500 mt-1 text-left">{description}</p>
        </div>
        <div
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
            isChecked ? "border-primary bg-primary" : "border-gray-300"
          }`}
        >
          {isChecked && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </label>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <h1 className="text-lg font-semibold text-gray-800">Edit Space</h1>
        <button
          aria-label="Close"
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="container mx-auto max-w-2xl">
          {/* ── Step 1: Category ─────────────────────────────────────────────── */}
          {step === 1 && (
            <div>
              {errors.category && (
                <div className="mt-6">
                  <Notification message={errors.category} type="danger" />
                </div>
              )}
              <h2 className="text-4xl my-4">Category</h2>
              <p className="text-gray-600 mb-4">What type of space is this?</p>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <label
                    key={cat._id}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                      spaceData.category === cat._id
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setSpaceData((prev) => ({
                        ...prev,
                        category: cat._id,
                        subcategory: "",
                      }));
                      setErrors((prev) => ({ ...prev, category: "" }));
                    }}
                  >
                    <span className="font-medium text-gray-800">
                      {cat.name}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        spaceData.category === cat._id
                          ? "border-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {spaceData.category === cat._id && (
                        <div className="w-3 h-3 bg-primary rounded-full" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Title & Description ──────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 className="text-4xl my-4">Edit your space</h2>
              <Input
                label="Space name"
                name="title"
                value={spaceData.title}
                onChange={handleChange}
                error={errors.title}
                required
              />
              <label className="block text-sm font-medium text-gray-700 mt-4">
                Description
              </label>
              <textarea
                name="description"
                value={spaceData.description || ""}
                onChange={handleChange}
                className={`mt-1 p-2 w-full h-48 border rounded-lg focus:ring-primary focus:border-primary ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          )}

          {/* ── Step 3: Location ─────────────────────────────────────────────── */}
          {step === 3 && isLoaded && (
            <div>
              <h2 className="text-4xl my-4">Location</h2>
              <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
                options={{
                  fields: [
                    "address_components",
                    "geometry",
                    "formatted_address",
                  ],
                  types: ["address"],
                }}
              >
                <Input
                  placeholder="Address"
                  defaultValue={spaceData.location.address}
                  required
                />
              </Autocomplete>
              {errors["location.address"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["location.address"]}
                </p>
              )}
              <Input
                placeholder="City"
                name="location.city"
                value={spaceData.location.city}
                onChange={handleChange}
                required
              />
              {errors["location.city"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["location.city"]}
                </p>
              )}
              <CountrySelect
                value={spaceData.location.country}
                onChange={handleChange}
                required
              />
              {errors["location.country"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["location.country"]}
                </p>
              )}
            </div>
          )}

          {/* ── Step 4: Map ──────────────────────────────────────────────────── */}
          {step === 4 && (
            <div>
              <h2 className="text-4xl my-4">Confirm Location</h2>
              <p className="mb-4">
                Pin your location on the map or adjust the marker below
              </p>
              <div className="flex gap-4">
                <div className="mb-4">
                  <input
                    type="number"
                    step="0.000001"
                    name="coordinates.latitude"
                    value={spaceData.coordinates.latitude || ""}
                    onChange={handleChange}
                    placeholder="Latitude"
                    className={`mt-1 p-2 w-full border rounded-lg focus:ring-primary focus:border-primary ${
                      errors.latitude ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="number"
                    step="0.000001"
                    name="coordinates.longitude"
                    value={spaceData.coordinates.longitude || ""}
                    onChange={handleChange}
                    placeholder="Longitude"
                    className={`mt-1 p-2 w-full border rounded-lg focus:ring-primary focus:border-primary ${
                      errors.longitude ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              </div>
              <div className="w-full h-[350px] md:h-[400px] border border-gray-200 rounded-lg mt-4">
                <MapComponent
                  coordinates={spaceData.coordinates}
                  onCoordinatesChange={(lat, lng) =>
                    setSpaceData((prev) => ({
                      ...prev,
                      coordinates: { latitude: lat, longitude: lng },
                    }))
                  }
                />
              </div>
            </div>
          )}

          {/* ── Step 5: Subcategory ──────────────────────────────────────────── */}
          {step === 5 && (
            <div>
              {errors.subcategory && (
                <div className="mt-6">
                  <Notification message={errors.subcategory} type="danger" />
                </div>
              )}
              <h2 className="text-4xl my-4">Subcategory</h2>
              <p className="text-gray-600 mb-4">
                Choose the option that best describes your space within{" "}
                <span className="font-medium text-gray-800">
                  {selectedCategory?.name}
                </span>
                .
              </p>
              <div className="grid grid-cols-2 gap-4">
                {subcategories.map((sub) => {
                  const subId = sub._id || sub;
                  const subName = sub.name || sub;
                  return (
                    <label
                      key={subId}
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                        spaceData.subcategory === subId
                          ? "border-primary bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setSpaceData((prev) => ({
                          ...prev,
                          subcategory: subId,
                        }));
                        setErrors((prev) => ({ ...prev, subcategory: "" }));
                      }}
                    >
                      <span className="font-medium text-gray-800">
                        {subName}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          spaceData.subcategory === subId
                            ? "border-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {spaceData.subcategory === subId && (
                          <div className="w-3 h-3 bg-primary rounded-full" />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 6: Features & Extras ────────────────────────────────────── */}
          {step === 6 && (
            <div className="h-[500px] md:h-[600px] overflow-y-scroll">
              <h2 className="text-4xl my-4">Features & Extras</h2>
              <div className="mb-4">
                <YesNoToggle
                  label="WiFi access"
                  subtitle="Guests get access to free internet connection"
                  name="features.wifi"
                  value={spaceData.features.wifi}
                  onChange={handleFeatureChange}
                />
                <Counter
                  label="Restrooms"
                  subtitle="Numbers of restrooms guests can use"
                  name="features.restrooms"
                  value={spaceData.features.restrooms}
                  onChange={handleFeatureChange}
                />
                {spaceData.category === "6915bd724f4f95223e555e57" && (
                  <>
                    <h2 className="text-xl font-semibold my-4">
                      Treatment Room Features
                    </h2>
                    {TREATMENT_ROOM_FEATURES.map(renderFeatureCheckbox)}
                  </>
                )}
                {spaceData.category === "6915bd724f4f95223e555e5b" && (
                  <>
                    <h2 className="text-xl font-semibold my-4">
                      Medical Room Features
                    </h2>
                    {MEDICAL_FEATURES.map(renderFeatureCheckbox)}
                  </>
                )}
                <div className="mt-5 flex gap-6 items-center">
                  <Input
                    label="Size (SQM)"
                    name="features.sizeSQM"
                    type="number"
                    value={spaceData.features.sizeSQM}
                    onChange={handleFeatureChange}
                    classes="w-full"
                    error={errors["features.sizeSQM"]}
                  />
                  <Input
                    label="Seat Capacity"
                    name="features.seatCapacity"
                    type="number"
                    value={spaceData.features.seatCapacity}
                    onChange={handleFeatureChange}
                    classes="w-full"
                    error={errors["features.seatCapacity"]}
                  />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Extras</h3>
                {spaceData.extras.map((extra, index) => (
                  <ExtraInput
                    key={index}
                    extra={extra}
                    onChange={(updated) => handleExtraChange(index, updated)}
                    onRemove={() => handleRemoveExtra(index)}
                  />
                ))}
                <Button
                  onClick={handleAddExtra}
                  className="mt-2 bg-primary text-white px-4 py-2 rounded-lg"
                >
                  Add More
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 7: Photos ───────────────────────────────────────────────── */}
          {step === 7 && (
            <div>
              <h2 className="text-4xl my-4">Photos</h2>
              <Button
                onClick={() => setShowPopup(true)}
                className="mb-4 bg-primary text-white px-4 py-2 rounded-lg"
              >
                Add Photos
              </Button>
              {errors.images && (
                <Notification message={errors.images} type="danger" />
              )}
              {allPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-3 pb-10 h-[450px] md:h-[510px] overflow-scroll mt-4">
                  {allPreviews.map((img, index) => (
                    <div
                      key={index}
                      className={`relative w-full overflow-hidden rounded-lg border border-gray-200 ${
                        index === 0 ? "col-span-2 h-80" : "h-64"
                      }`}
                    >
                      <img
                        src={typeof img === "string" ? img : img}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              {showPopup && (
                <ImageUploadPopup
                  onClose={() => setShowPopup(false)}
                  onUpload={handleImageUpload}
                />
              )}
            </div>
          )}

          {/* ── Step 8: Rearrange ────────────────────────────────────────────── */}
          {step === 8 && (
            <div>
              <h2 className="text-4xl my-4">Rearrange Images</h2>
              <ImageReorder
                images={allPreviews}
                onReorder={handleImageReorder}
                onAddMore={() => setShowPopup(true)}
              />
            </div>
          )}

          {/* ── Step 9: Pricing ──────────────────────────────────────────────── */}
          {step === 9 && (
            <div className="text-center flex flex-col items-center p-6">
              <div className="flex items-center gap-6 mb-8">
                {["DAILY", "HOURLY"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setSpaceData((prev) => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          pricingType: type,
                          ...(type === "DAILY"
                            ? { hourlyPrice: null }
                            : { weekdayPrice: null }),
                        },
                      }))
                    }
                    className={`px-5 py-2 rounded-full font-medium transition ${
                      spaceData.pricing.pricingType === type
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {type === "DAILY" ? "Daily" : "Hourly"}
                  </button>
                ))}
              </div>
              <h3 className="text-3xl font-semibold mb-2">
                {spaceData.pricing.pricingType === "DAILY"
                  ? "Set a Weekday Price"
                  : "Set an Hourly Price"}
              </h3>
              <p className="text-gray-600 mb-6">You can change it anytime.</p>
              <div className="flex items-center justify-center px-6 pt-4 mb-3">
                <span className="text-4xl font-bold text-primary mr-1 mb-4">
                  £
                </span>
                <Input
                  name={
                    spaceData.pricing.pricingType === "DAILY"
                      ? "pricing.weekdayPrice"
                      : "pricing.hourlyPrice"
                  }
                  type="number"
                  min="0"
                  value={
                    spaceData.pricing.pricingType === "DAILY"
                      ? spaceData.pricing.weekdayPrice
                      : spaceData.pricing.hourlyPrice
                  }
                  onChange={handleChange}
                  autoFocus
                  required
                  className="border-none bg-transparent text-center text-4xl font-semibold text-primary focus:ring-0 focus:outline-none no-spinner dynamic-width"
                />
              </div>
              {errors.weekdayPrice && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.weekdayPrice}
                </p>
              )}
              {errors.hourlyPrice && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.hourlyPrice}
                </p>
              )}
            </div>
          )}

          {/* ── Step 10: Booking Settings ────────────────────────────────────── */}
          {step === 10 && (
            <div>
              <h2 className="text-4xl font-semibold mb-2">Booking settings</h2>
              <p className="text-gray-600 mb-6">You can change it anytime.</p>
              <div className="space-y-4">
                {[
                  {
                    key: "approveFirstFive",
                    label: "Approve first 5 bookings",
                    desc: "You'll manually approve your first 5 bookings. After that, bookings can be automatic.",
                    recommended: true,
                  },
                  {
                    key: "instantBook",
                    label: "Instant Book",
                    desc: "Guests can book instantly without needing your approval.",
                  },
                  {
                    key: "approveAllBookings",
                    label: "Approve All Bookings",
                    desc: "You'll manually approve all your bookings.",
                  },
                ].map(({ key, label, desc, recommended }) => (
                  <label
                    key={key}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                      spaceData.bookingSettings[key]
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setSpaceData((prev) => ({
                        ...prev,
                        bookingSettings: {
                          approveFirstFive: false,
                          instantBook: false,
                          approveAllBookings: false,
                          [key]: true,
                        },
                      }))
                    }
                  >
                    <div className="w-[90%] flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">
                          {label}
                        </span>
                        {recommended && (
                          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 text-left">{desc}</p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        spaceData.bookingSettings[key]
                          ? "border-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {spaceData.bookingSettings[key] && (
                        <div className="w-3 h-3 bg-primary rounded-full" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 11: Discounts ───────────────────────────────────────────── */}
          {step === 11 && (
            <div>
              <h2 className="text-4xl font-semibold mb-2">Discounts</h2>
              <p className="text-gray-600 mb-6">
                Encourage more bookings with discounts.
              </p>
              <div className="space-y-4">
                {[
                  {
                    key: "newListing",
                    label: "New Listing Promotion (20%)",
                    desc: "Get noticed faster with an automatic 20% discount on your first few bookings.",
                  },
                  {
                    key: "lastMinute",
                    label: "Last Minute Discount (1%)",
                    desc: "Offer small savings for guests booking within a few days of arrival.",
                  },
                  {
                    key: "weekly",
                    label: "Weekly Discount (10%)",
                    desc: "Reward guests who stay for 7 nights or more.",
                  },
                  {
                    key: "monthly",
                    label: "Monthly Discount (20%)",
                    desc: "Attract long-term stays with generous monthly savings.",
                  },
                ].map(({ key, label, desc }) => (
                  <label
                    key={key}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                      spaceData.pricing.discounts[key]
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      handleDiscountChange({
                        target: {
                          name: key,
                          checked: !spaceData.pricing.discounts[key],
                        },
                      })
                    }
                  >
                    <div className="w-[90%] flex flex-col items-start">
                      <span className="font-medium text-gray-800">{label}</span>
                      <p className="text-sm text-gray-500 mt-1 text-left">
                        {desc}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                        spaceData.pricing.discounts[key]
                          ? "border-primary bg-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {spaceData.pricing.discounts[key] && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 12: Availability ────────────────────────────────────────── */}
          {step === 12 && (
            <div>
              <h2 className="text-4xl font-semibold mb-2">Availability</h2>
              <p className="text-gray-600 mb-8">
                Configure when your space is open for bookings.
              </p>
              <div className="bg-white p-6 rounded-xl shadow mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Default Availability
                </h3>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                >
                  <option value="all">Available every day</option>
                  <option value="weekdays">Weekdays only</option>
                  <option value="weekends">Weekends only</option>
                  <option value="custom">Custom schedule</option>
                </select>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-lg font-semibold mb-1">Block Dates</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Click dates to mark them as unavailable.
                </p>
                <AvailabilityCalendar
                  blockedDates={blockedDates}
                  bookedDates={[]}
                  onBlock={(start, end) => addBlock(start, end)}
                  onUnblock={(dateStr) => removeBlock(dateStr)}
                  monthsToShow={6}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer: progress + nav */}
      <div className="border-t bg-white px-6 py-4">
        <div className="container mx-auto max-w-2xl">
          <ProgressBar step={step} totalSteps={totalSteps} />
          <div className="mt-4 flex justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="text-gray-600 hover:text-gray-900 disabled:opacity-50 cursor-pointer"
            >
              Back
            </button>
            <Button
              onClick={step === totalSteps ? handleSubmit : handleNext}
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 disabled:opacity-70"
            >
              {isSubmitting
                ? "Saving..."
                : step === totalSteps
                ? "Save Changes"
                : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPropertyModal;
