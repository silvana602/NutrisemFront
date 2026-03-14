export type ResidenceLocation = {
  department: string;
  province: string;
  municipality: string;
};

export type ResidenceAddress = ResidenceLocation & {
  locality: string; // comunidad / pueblo / ciudad
  streetType: string; // Av / Calle / etc.
  doorNumber: string; // nro de puerta (puede incluir lote, manzano, etc.)
};

export function normalizeResidenceText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeResidenceAddress(
  input: Partial<ResidenceAddress> | null | undefined
): ResidenceAddress {
  return {
    department: normalizeResidenceText(input?.department ?? ""),
    province: normalizeResidenceText(input?.province ?? ""),
    municipality: normalizeResidenceText(input?.municipality ?? ""),
    locality: normalizeResidenceText(input?.locality ?? ""),
    streetType: normalizeResidenceText(input?.streetType ?? ""),
    doorNumber: normalizeResidenceText(input?.doorNumber ?? ""),
  };
}

export function formatResidenceLocation(location: Partial<ResidenceLocation> | null | undefined) {
  const department = normalizeResidenceText(location?.department ?? "");
  const province = normalizeResidenceText(location?.province ?? "");
  const municipality = normalizeResidenceText(location?.municipality ?? "");

  const parts = [department, province, municipality].filter(Boolean);
  return parts.length ? parts.join(" / ") : "Sin dato";
}

export function formatResidenceAddress(address: Partial<ResidenceAddress> | null | undefined) {
  const normalized = normalizeResidenceAddress(address);
  const location = formatResidenceLocation(normalized);
  const locality = normalized.locality ? `, ${normalized.locality}` : "";
  const street = normalized.streetType ? `, ${normalized.streetType}` : "";
  const door = normalized.doorNumber ? ` ${normalized.doorNumber}` : "";

  if (location === "Sin dato" && !locality && !street && !door) return "Sin dato";
  return `${location}${locality}${street}${door}`.replace(/^Sin dato, /, "");
}
