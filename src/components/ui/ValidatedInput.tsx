interface Props {
    label: string;
    placeholder: string;
    suffix: string;
    value?: string;
    error?: string;
    onChange: (value: string) => void;
}

export const ValidatedInput = ({
    label,
    placeholder,
    suffix,
    value,
    error,
    onChange,
}: Props) => (
    <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium">{label}</label>

        <div className="relative">
            <input
                type="text"
                inputMode="decimal"
                placeholder={placeholder}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2
                    ${error
                        ? "border border-red-500 focus:ring-red-300"
                        : "border border-[var(--color-nutri-primary)] focus:ring-[var(--color-nutri-primary)]"
                    }`}
            />

            <span className="absolute right-3 top-2.5 text-sm text-gray-500">
                {suffix}
            </span>
        </div>

        {error && (
            <span className="text-xs text-red-600 font-medium">
                {error}
            </span>
        )}
    </div>
);
