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
        <label className="text-sm font-medium text-nutri-dark-grey">{label}</label>

        <div className="relative">
            <input
                type="text"
                inputMode="decimal"
                placeholder={placeholder}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full rounded-lg bg-nutri-white px-3 py-2 pr-10 text-nutri-dark-grey focus:outline-none focus:ring-2
                    ${error
                        ? "border border-nutri-secondary focus:ring-nutri-secondary/40"
                        : "border border-nutri-primary focus:ring-nutri-primary/30"
                    }`}
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
