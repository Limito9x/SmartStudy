import { Field } from "../field";
import { Input } from "../input";
import { Button } from "../button";
import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder }: SearchBarProps) {
  const [value, setValue] = useState("");
  return (
    <Field className="w-full max-w-sm" orientation={"horizontal"}>
      <Input
        placeholder={placeholder || "Tìm kiếm..."}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch(value);
        }}
      />
      <Button onClick={() => onSearch(value)}>
        <Search size={16} />
      </Button>
    </Field>
  );
}
