"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onSelect: (address: string) => void;
  placeholder?: string;
}

export default function AddressSearch({ onSelect, placeholder = "חפש כתובת..." }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    function initAuto() {
      if (!inputRef.current) return;
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "IL" },
        fields: ["formatted_address", "geometry", "place_id"],
        types: ["address"],
      });
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current!.getPlace();
        const addr = place.formatted_address ?? "";
        setValue(addr);
        onSelect(addr);
      });
    }

    if (window.google?.maps?.places) {
      initAuto();
    } else {
      // wait for the global script loaded in layout to be ready
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(interval);
          initAuto();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    if (!e.target.value) onSelect("");
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 py-3 text-[#111] placeholder-[#aaa] focus:outline-none focus:border-[#f97316] transition-colors text-right"
        dir="rtl"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]">🔍</span>
    </div>
  );
}
