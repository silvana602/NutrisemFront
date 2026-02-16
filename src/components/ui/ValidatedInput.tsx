import { cn } from "@/lib/utils";

interface Props {
    label: string;
    placeholder: string;
    suffix: string;
    value?: string;
    error?: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}

export const ValidatedInput = ({
    label,
    placeholder,
    suffix,
    value,
    error,
    disabled = false,
    onChange,
}: Props) => (
    <div className="flex flex-col gap-1.5">
        <label className="nutri-label mb-0">{label}</label>

        <div className="relative">
            <input
                type="text"
                inputMode="decimal"
                placeholder={placeholder}
                value={value ?? ""}
                aria-invalid={Boolean(error)}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "nutri-input pr-10 disabled:cursor-not-allowed disabled:opacity-65",
                    error && "border-nutri-secondary"
                )}
            />

            <span className="absolute right-3 top-2.5 text-sm text-nutri-secondary">
                {suffix}
            </span>
        </div>

        {error && (
            <span className="text-xs font-medium text-nutri-secondary">
                {error}
            </span>
        )}
    </div>
);
