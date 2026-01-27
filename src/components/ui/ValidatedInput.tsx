interface Props {
    label: string;
    placeholder: string;
    suffix: string;
    value?: number;
    error?: string;
    onChange: (value: number) => void;
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
                type="number"
                step="any"
                placeholder={placeholder}
                value={value ?? ""}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`w-full border border-black rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-300" : "border-[var(--color-nutri-primary)]"
                    }`}
            />

            <span className="absolute right-3 top-2.5 text-sm text-gray-500">
                {suffix}
            </span>
        </div>

        {error && (
            <span className="text-xs text-red-600 font-medium">{error}</span>
        )}
    </div>
);
