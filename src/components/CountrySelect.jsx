import Select from "react-select";

const COUNTRIES = [
  { value: "AF", label: "ðŸ‡¦ðŸ‡« Afghanistan" },
  { value: "AL", label: "ðŸ‡¦ðŸ‡± Albania" },
  { value: "DZ", label: "ðŸ‡©ðŸ‡¿ Algeria" },
  { value: "AR", label: "ðŸ‡¦ðŸ‡· Argentina" },
  { value: "AU", label: "ðŸ‡¦ðŸ‡º Australia" },
  { value: "AT", label: "ðŸ‡¦ðŸ‡¹ Austria" },
  { value: "BE", label: "ðŸ‡§ðŸ‡ª Belgium" },
  { value: "BR", label: "ðŸ‡§ðŸ‡· Brazil" },
  { value: "CA", label: "ðŸ‡¨ðŸ‡¦ Canada" },
  { value: "CL", label: "ðŸ‡¨ðŸ‡± Chile" },
  { value: "CN", label: "ðŸ‡¨ðŸ‡³ China" },
  { value: "CO", label: "ðŸ‡¨ðŸ‡´ Colombia" },
  { value: "HR", label: "ðŸ‡­ðŸ‡· Croatia" },
  { value: "CZ", label: "ðŸ‡¨ðŸ‡¿ Czech Republic" },
  { value: "DK", label: "ðŸ‡©ðŸ‡° Denmark" },
  { value: "EG", label: "ðŸ‡ªðŸ‡¬ Egypt" },
  { value: "FI", label: "ðŸ‡«ðŸ‡® Finland" },
  { value: "FR", label: "ðŸ‡«ðŸ‡· France" },
  { value: "DE", label: "ðŸ‡©ðŸ‡ª Germany" },
  { value: "GH", label: "ðŸ‡¬ðŸ‡­ Ghana" },
  { value: "GR", label: "ðŸ‡¬ðŸ‡· Greece" },
  { value: "HK", label: "ðŸ‡­ðŸ‡° Hong Kong" },
  { value: "HU", label: "ðŸ‡­ðŸ‡º Hungary" },
  { value: "IN", label: "ðŸ‡®ðŸ‡³ India" },
  { value: "ID", label: "ðŸ‡®ðŸ‡© Indonesia" },
  { value: "IE", label: "ðŸ‡®ðŸ‡ª Ireland" },
  { value: "IL", label: "ðŸ‡®ðŸ‡± Israel" },
  { value: "IT", label: "ðŸ‡®ðŸ‡¹ Italy" },
  { value: "JP", label: "ðŸ‡¯ðŸ‡µ Japan" },
  { value: "JO", label: "ðŸ‡¯ðŸ‡´ Jordan" },
  { value: "KE", label: "ðŸ‡°ðŸ‡ª Kenya" },
  { value: "KW", label: "ðŸ‡°ðŸ‡¼ Kuwait" },
  { value: "LB", label: "ðŸ‡±ðŸ‡§ Lebanon" },
  { value: "MY", label: "ðŸ‡²ðŸ‡¾ Malaysia" },
  { value: "MX", label: "ðŸ‡²ðŸ‡½ Mexico" },
  { value: "MA", label: "ðŸ‡²ðŸ‡¦ Morocco" },
  { value: "NL", label: "ðŸ‡³ðŸ‡± Netherlands" },
  { value: "NZ", label: "ðŸ‡³ðŸ‡¿ New Zealand" },
  { value: "NG", label: "ðŸ‡³ðŸ‡¬ Nigeria" },
  { value: "NO", label: "ðŸ‡³ðŸ‡´ Norway" },
  { value: "PK", label: "ðŸ‡µðŸ‡° Pakistan" },
  { value: "PE", label: "ðŸ‡µðŸ‡ª Peru" },
  { value: "PH", label: "ðŸ‡µðŸ‡­ Philippines" },
  { value: "PL", label: "ðŸ‡µðŸ‡± Poland" },
  { value: "PT", label: "ðŸ‡µðŸ‡¹ Portugal" },
  { value: "QA", label: "ðŸ‡¶ðŸ‡¦ Qatar" },
  { value: "RO", label: "ðŸ‡·ðŸ‡´ Romania" },
  { value: "SA", label: "ðŸ‡¸ðŸ‡¦ Saudi Arabia" },
  { value: "SG", label: "ðŸ‡¸ðŸ‡¬ Singapore" },
  { value: "ZA", label: "ðŸ‡¿ðŸ‡¦ South Africa" },
  { value: "KR", label: "ðŸ‡°ðŸ‡· South Korea" },
  { value: "ES", label: "ðŸ‡ªðŸ‡¸ Spain" },
  { value: "SE", label: "ðŸ‡¸ðŸ‡ª Sweden" },
  { value: "CH", label: "ðŸ‡¨ðŸ‡­ Switzerland" },
  { value: "TW", label: "ðŸ‡¹ðŸ‡¼ Taiwan" },
  { value: "TH", label: "ðŸ‡¹ðŸ‡­ Thailand" },
  { value: "TR", label: "ðŸ‡¹ðŸ‡· Turkey" },
  { value: "AE", label: "ðŸ‡¦ðŸ‡ª UAE" },
  { value: "GB", label: "ðŸ‡¬ðŸ‡§ United Kingdom" },
  { value: "US", label: "ðŸ‡ºðŸ‡¸ United States" },
  { value: "VN", label: "ðŸ‡»ðŸ‡³ Vietnam" },
];

// matchBy: "code" (default) matches on value e.g. "GB"
//          "name" matches on label text e.g. "United Kingdom" (for Google Autocomplete)
export default function CountrySelect({
  value,
  onChange,
  required,
  matchBy = "code",
}) {
  const selected =
    matchBy === "name"
      ? COUNTRIES.find((c) =>
          c.label.toLowerCase().includes(value?.toLowerCase())
        ) || null
      : COUNTRIES.find((c) => c.value === value) || null;

  return (
    <Select
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: "transparent",
          height: "50px",
          borderRadius: "0.375rem",
          borderColor: state.isFocused
            ? "#305CDE"
            : "oklch(87.2% 0.01 258.338)",
          boxShadow: state.isFocused ? "0 0 0 2px #305CDE" : "none",
          "&:hover": { borderColor: "#305CDE" },
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "#305CDE"
            : state.isFocused
            ? "#f0f0f0"
            : "white",
          color: state.isSelected ? "white" : "#305CDE",
        }),
        placeholder: (base) => ({
          ...base,
          color: "#9ca3af",
        }),
      }}
      options={COUNTRIES}
      placeholder="Country"
      required={required}
      value={selected}
      onChange={(selected) =>
        onChange({
          target: {
            name: "location.country",
            value: selected?.value ?? "",
          },
        })
      }
    />
  );
}

