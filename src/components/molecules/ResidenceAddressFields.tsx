"use client";

import React from "react";
import { TextInput } from "@/components/atoms/TextInput";
import type { ResidenceAddress } from "@/types";

type FieldErrors = Partial<Record<keyof ResidenceAddress, string>>;

type ResidenceAddressFieldsProps = {
  idPrefix: string;
  label: string;
  value: ResidenceAddress;
  onChange: (next: ResidenceAddress) => void;
  errors?: FieldErrors;
};

export function ResidenceAddressFields({
  idPrefix,
  label,
  value,
  onChange,
  errors,
}: ResidenceAddressFieldsProps) {
  const setField = <K extends keyof ResidenceAddress>(field: K, nextValue: string) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <section className="space-y-3">
      <p className="text-sm font-semibold text-nutri-primary">{label}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="nutri-label" htmlFor={`${idPrefix}-department`}>
            Departamento
          </label>
          <TextInput
            id={`${idPrefix}-department`}
            value={value.department}
            onChange={(event) => setField("department", event.target.value)}
            placeholder="Ej: La Paz"
            autoComplete="address-level1"
          />
          {errors?.department && <p className="mt-1 text-xs text-rose-700">{errors.department}</p>}
        </div>

        <div>
          <label className="nutri-label" htmlFor={`${idPrefix}-province`}>
            Provincia
          </label>
          <TextInput
            id={`${idPrefix}-province`}
            value={value.province}
            onChange={(event) => setField("province", event.target.value)}
            placeholder="Ej: Murillo"
            autoComplete="address-level2"
          />
          {errors?.province && <p className="mt-1 text-xs text-rose-700">{errors.province}</p>}
        </div>

        <div>
          <label className="nutri-label" htmlFor={`${idPrefix}-municipality`}>
            Municipio
          </label>
          <TextInput
            id={`${idPrefix}-municipality`}
            value={value.municipality}
            onChange={(event) => setField("municipality", event.target.value)}
            placeholder="Ej: El Alto"
            autoComplete="address-level3"
          />
          {errors?.municipality && (
            <p className="mt-1 text-xs text-rose-700">{errors.municipality}</p>
          )}
        </div>

        <div>
          <label className="nutri-label" htmlFor={`${idPrefix}-locality`}>
            Lugar de residencia (comunidad / pueblo / ciudad)
          </label>
          <TextInput
            id={`${idPrefix}-locality`}
            value={value.locality}
            onChange={(event) => setField("locality", event.target.value)}
            placeholder="Ej: Villa Adela"
            autoComplete="address-line1"
          />
          {errors?.locality && <p className="mt-1 text-xs text-rose-700">{errors.locality}</p>}
        </div>

        <div className="sm:col-span-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div>
              <label className="nutri-label" htmlFor={`${idPrefix}-street-type`}>
                Av. / Calle
              </label>
              <TextInput
                id={`${idPrefix}-street-type`}
                value={value.streetType}
                onChange={(event) => setField("streetType", event.target.value)}
                placeholder="Ej: Av. / Calle"
                autoComplete="address-line2"
              />
              {errors?.streetType && (
                <p className="mt-1 text-xs text-rose-700">{errors.streetType}</p>
              )}
            </div>
            <div>
              <label className="nutri-label" htmlFor={`${idPrefix}-door`}>
                Nro de puerta
              </label>
              <TextInput
                id={`${idPrefix}-door`}
                value={value.doorNumber}
                onChange={(event) => setField("doorNumber", event.target.value)}
                placeholder="Ej: 12, S/N"
                autoComplete="address-line2"
              />
              {errors?.doorNumber && (
                <p className="mt-1 text-xs text-rose-700">{errors.doorNumber}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
