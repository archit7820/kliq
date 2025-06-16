
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift } from 'lucide-react';

interface InviteCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean | null;
  isChecking: boolean;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
}

const InviteCodeInput: React.FC<InviteCodeInputProps> = ({
  value,
  onChange,
  isValid,
  isChecking,
  disabled = false,
  required = false,
  autoFocus = false,
}) => {
  return (
    <div>
      <Label htmlFor="invite-code" className="text-gray-700 flex items-center">
        <Gift className="inline-block w-5 h-5 mr-2 text-green-400" />
        Invite Code
      </Label>
      <div className="relative mt-1">
        <Input
          id="invite-code"
          autoFocus={autoFocus}
          placeholder="e.g. FRIEND123"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          required={required}
          className={`pl-3 ${isValid === false ? 'border-red-500' : isValid === true ? 'border-green-500' : ''}`}
          disabled={disabled}
        />
        {value && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold"
                style={{ color: isValid === true ? "#16a34a" : isValid === false ? "#e11d48" : "#64748b" }}>
            {isChecking ? "…" : isValid === true ? "Valid" : isValid === false ? "Invalid" : ""}
          </span>
        )}
      </div>
    </div>
  );
};

export default InviteCodeInput;
