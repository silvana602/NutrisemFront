"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Heading } from "@/components/atoms/Heading";
import { Button } from "@/components/ui/Button";
import { db, seedOnce } from "@/mocks/db";
import { uid } from "@/mocks/utils";
import { calculateAgeInMonths, formatPediatricAge } from "@/lib/pediatricAge";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types/user";
import type { Gender } from "@/types/patient";
import type { User } from "@/types/user";
import type { Patient } from "@/types/patient";
import type { Guardian } from "@/types/guardian";

seedOnce();

type FormData = {
  patientFirstName: string;
  patientLastName: string;
  patientIdentityNumber: string;
  patientBirthDate: string;
  patientGender: "" | Gender;
  patientAddress: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianIdentityNumber: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianAddress: string;
  confirmTutorData: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>> & {
  submit?: string;
};

const RELATIONSHIP_OPTIONS = [
  { value: "mother", label: "Madre" },
  { value: "father", label: "Padre" },
  { value: "legal_guardian", label: "Guardián legal" },
  { value: "other", label: "Otro familiar/cuidador" },
] as const;

const INITIAL_FORM: FormData = {
  patientFirstName: "",
  patientLastName: "",
  patientIdentityNumber: "",
  patientBirthDate: "",
  patientGender: "",
  patientAddress: "",
  guardianFirstName: "",
  guardianLastName: "",
  guardianIdentityNumber: "",
  guardianRelationship: "mother",
  guardianPhone: "",
  guardianAddress: "",
  confirmTutorData: false,
};

function sanitizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function buildTemporaryPassword(source: string): string {
  const digits = source.replace(/\D/g, "");
  const suffix = digits.slice(-4).padStart(4, "0");
  return `nutri${suffix}`;
}

function parseBirthDate(rawDate: string): Date | null {
  if (!rawDate) return null;
  const date = new Date(`${rawDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function validateForm(form: FormData): FormErrors {
  const errors: FormErrors = {};

  const patientFirstName = sanitizeText(form.patientFirstName);
  const patientLastName = sanitizeText(form.patientLastName);
  const patientIdentityNumber = sanitizeText(form.patientIdentityNumber);
  const patientAddress = sanitizeText(form.patientAddress);
  const guardianFirstName = sanitizeText(form.guardianFirstName);
  const guardianLastName = sanitizeText(form.guardianLastName);
  const guardianIdentityNumber = sanitizeText(form.guardianIdentityNumber);
  const guardianPhone = sanitizeText(form.guardianPhone);
  const guardianAddress = sanitizeText(form.guardianAddress);

  if (!patientFirstName) errors.patientFirstName = "Ingresa el nombre del paciente.";
  if (!patientLastName) errors.patientLastName = "Ingresa el apellido del paciente.";
  if (!patientIdentityNumber) {
    errors.patientIdentityNumber = "Ingresa CI o número de identificación del paciente.";
  }
  if (!patientAddress) errors.patientAddress = "Ingresa la dirección del paciente.";
  if (!form.patientGender) errors.patientGender = "Selecciona el sexo biológico del paciente.";

  const birthDate = parseBirthDate(form.patientBirthDate);
  if (!birthDate) {
    errors.patientBirthDate = "Ingresa una fecha de nacimiento valida.";
  } else {
    const ageMonths = calculateAgeInMonths(birthDate);
    if (ageMonths > 60) {
      errors.patientBirthDate =
        "Para este módulo pediátrico el paciente debe tener 60 meses o menos.";
    }
  }

  if (!guardianFirstName) errors.guardianFirstName = "Ingresa el nombre del guardián.";
  if (!guardianLastName) errors.guardianLastName = "Ingresa el apellido del guardián.";
  if (!guardianIdentityNumber) {
    errors.guardianIdentityNumber = "Ingresa el CI del guardián.";
  }
  if (!guardianPhone) errors.guardianPhone = "Ingresa un teléfono de contacto.";
  if (guardianPhone && guardianPhone.replace(/\D/g, "").length < 7) {
    errors.guardianPhone = "Ingresa un teléfono valido (mínimo 7 dígitos).";
  }
  if (!guardianAddress) errors.guardianAddress = "Ingresa la dirección del guardián.";

  if (!form.confirmTutorData) {
    errors.confirmTutorData =
      "Debes confirmar que los datos fueron proporcionados por el guardián.";
  }

  const duplicatePatient = db.patients.some(
    (patient) => patient.identityNumber.toLowerCase() === patientIdentityNumber.toLowerCase()
  );

  if (duplicatePatient) {
    errors.patientIdentityNumber =
      "Ya existe un paciente registrado con ese número de identificación.";
  }

  return errors;
}

export const NewPatientRegistrationContent: React.FC = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");

  const ageLabel = useMemo(() => {
    const birthDate = parseBirthDate(form.patientBirthDate);
    if (!birthDate) return "Sin dato";
    return formatPediatricAge(calculateAgeInMonths(birthDate));
  }, [form.patientBirthDate]);

  const setField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, submit: undefined }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!user) {
      setErrors({ submit: "No hay una sesión activa para registrar al paciente." });
      return;
    }

    const clinician = db.clinicians.find((item) => item.userId === user.userId) ?? null;
    if (!clinician) {
      setErrors({ submit: "No se encontro el profesional responsable para este registro." });
      return;
    }

    const birthDate = parseBirthDate(form.patientBirthDate);
    if (!birthDate) {
      setErrors({ patientBirthDate: "Ingresa una fecha de nacimiento valida." });
      return;
    }
    const patientGender = form.patientGender;
    if (patientGender !== "female" && patientGender !== "male") {
      setErrors({ patientGender: "Selecciona el sexo biológico del paciente." });
      return;
    }

    setIsSubmitting(true);
    try {
      const patientUserId = uid("usr");
      const patientId = uid("pat");
      const guardianId = uid("gua");
      const patientClinicianId = uid("pc");

      const patientIdentity = sanitizeText(form.patientIdentityNumber);
      const guardianIdentity = sanitizeText(form.guardianIdentityNumber);
      const guardianPhone = sanitizeText(form.guardianPhone);

      const patientPassword = buildTemporaryPassword(patientIdentity);
      const guardianPassword = buildTemporaryPassword(guardianIdentity || guardianPhone);

      const patientUser: User = {
        userId: patientUserId,
        role: UserRole.patient,
        firstName: sanitizeText(form.patientFirstName),
        lastName: sanitizeText(form.patientLastName),
        identityNumber: patientIdentity,
        phone: guardianPhone,
        address: sanitizeText(form.patientAddress),
        password: patientPassword,
      };

      const patient: Patient = {
        patientId,
        userId: patientUserId,
        firstName: sanitizeText(form.patientFirstName),
        lastName: sanitizeText(form.patientLastName),
        identityNumber: patientIdentity,
        birthDate,
        gender: patientGender,
        address: sanitizeText(form.patientAddress),
      };

      const guardian: Guardian = {
        guardianId,
        patientId,
        firstName: sanitizeText(form.guardianFirstName),
        lastName: sanitizeText(form.guardianLastName),
        identityNumber: guardianIdentity,
        phone: guardianPhone,
        address: sanitizeText(form.guardianAddress),
        relationship: form.guardianRelationship,
        password: guardianPassword,
      };

      db.users.push(patientUser);
      db.patients.push(patient);
      db.guardians.push(guardian);
      db.patientClinicians.push({
        patientClinicianId,
        patientId,
        clinicianId: clinician.clinicianId,
      });
      db.passwords.set(patientUserId, patientPassword);

      setSubmitMessage(
        `Paciente registrado correctamente. Usuario temporal: ${patientIdentity}.`
      );

      router.push(`/dashboard/clinician/patients?newPatientId=${encodeURIComponent(patientId)}`);
    } catch (error) {
      console.error("Error registrando paciente:", error);
      setErrors({ submit: "No se pudo registrar el paciente. Intenta nuevamente." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nutri-clinician-page px-1 py-1 sm:px-2">
      <div className="nutri-clinician-page-header p-4 sm:p-5">
        <Heading
          containerClassName="space-y-2"
          description="Completa los datos del niño y del guardián responsable para habilitar consultas y diagnósticos."
        >
          Registro de paciente pediátrico
        </Heading>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="nutri-clinician-surface p-4 sm:p-5">
          <h2 className="mb-4 text-base font-semibold text-nutri-primary">1. Datos del paciente</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="nutri-label" htmlFor="patient-first-name">
                Nombres del paciente
              </label>
              <input
                id="patient-first-name"
                className="nutri-input"
                value={form.patientFirstName}
                onChange={(event) => setField("patientFirstName", event.target.value)}
                placeholder="Ejemplo: Maria Fernanda"
              />
              {errors.patientFirstName && (
                <p className="mt-1 text-xs text-rose-700">{errors.patientFirstName}</p>
              )}
            </div>

            <div>
              <label className="nutri-label" htmlFor="patient-last-name">
                Apellidos del paciente
              </label>
              <input
                id="patient-last-name"
                className="nutri-input"
                value={form.patientLastName}
                onChange={(event) => setField("patientLastName", event.target.value)}
                placeholder="Ejemplo: Flores Meneses"
              />
              {errors.patientLastName && (
                <p className="mt-1 text-xs text-rose-700">{errors.patientLastName}</p>
              )}
            </div>

            <div>
              <label className="nutri-label" htmlFor="patient-id-number">
                CI / identificación del paciente
              </label>
              <input
                id="patient-id-number"
                className="nutri-input"
                value={form.patientIdentityNumber}
                onChange={(event) => setField("patientIdentityNumber", event.target.value)}
                placeholder="Número de CI o certificado"
              />
              {errors.patientIdentityNumber && (
                <p className="mt-1 text-xs text-rose-700">{errors.patientIdentityNumber}</p>
              )}
            </div>

            <div>
              <label className="nutri-label" htmlFor="patient-gender">
                Sexo biológico
              </label>
              <select
                id="patient-gender"
                className="nutri-input"
                value={form.patientGender}
                onChange={(event) => setField("patientGender", event.target.value as FormData["patientGender"])}
              >
                <option value="">Selecciona</option>
                <option value="female">Femenino</option>
                <option value="male">Masculino</option>
              </select>
              {errors.patientGender && (
                <p className="mt-1 text-xs text-rose-700">{errors.patientGender}</p>
              )}
            </div>

            <div>
              <label className="nutri-label" htmlFor="patient-birth-date">
                Fecha de nacimiento
              </label>
              <input
                id="patient-birth-date"
                type="date"
                className="nutri-input"
                value={form.patientBirthDate}
                onChange={(event) => setField("patientBirthDate", event.target.value)}
              />
              <p className="mt-1 text-xs text-nutri-dark-grey/80">Edad calculada: {ageLabel}</p>
              {errors.patientBirthDate && (
                <p className="mt-1 text-xs text-rose-700">{errors.patientBirthDate}</p>
              )}
            </div>

            <div>
              <label className="nutri-label" htmlFor="patient-address">
                Dirección del paciente
              </label>
              <input
                id="patient-address"
                className="nutri-input"
                value={form.patientAddress}
                onChange={(event) => setField("patientAddress", event.target.value)}
                placeholder="Barrio, zona, referencia"
              />
              {errors.patientAddress && (
                <p className="mt-1 text-xs text-rose-700">{errors.patientAddress}</p>
              )}
            </div>
          </div>
        </section>

        <section className="nutri-clinician-surface p-4 sm:p-5">
          <h2 className="mb-4 text-base font-semibold text-nutri-primary">2. Datos del guardián responsable</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="nutri-label" htmlFor="guardian-first-name">
                Nombres del guardián
              </label>
              <input
                id="guardian-first-name"
                className="nutri-input"
                value={form.guardianFirstName}
                onChange={(event) => setField("guardianFirstName", event.target.value)}
                placeholder="Ejemplo: Rita"
              />
              {errors.guardianFirstName && (
                <p className="mt-1 text-xs text-rose-700">{errors.guardianFirstName}</p>
              )}
            </div>

            <div>
              <label className="nutri-label" htmlFor="guardian-last-name">
                Apellidos del guardián
              </label>
              <input
                id="guardian-last-name"
                className="nutri-input"
                value={form.guardianLastName}
                onChange={(event) => setField("guardianLastName", event.target.value)}
                placeholder="Ejemplo: Meneses"
              />
              {errors.guardianLastName && (
                <p className="mt-1 text-xs text-rose-700">{errors.guardianLastName}</p>
              )}
            </div>

            <div>
              <label className="nutri-label" htmlFor="guardian-id-number">
                CI del guardián
              </label>
              <input
                id="guardian-id-number"
                className="nutri-input"
                value={form.guardianIdentityNumber}
                onChange={(event) => setField("guardianIdentityNumber", event.target.value)}
                placeholder="Número de CI"
              />
              {errors.guardianIdentityNumber && (
                <p className="mt-1 text-xs text-rose-700">{errors.guardianIdentityNumber}</p>
              )}
            </div>

            <div>
              <label className="nutri-label" htmlFor="guardian-relationship">
                Parentesco
              </label>
              <select
                id="guardian-relationship"
                className="nutri-input"
                value={form.guardianRelationship}
                onChange={(event) => setField("guardianRelationship", event.target.value)}
              >
                {RELATIONSHIP_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="nutri-label" htmlFor="guardian-phone">
                Teléfono del guardián
              </label>
              <input
                id="guardian-phone"
                className="nutri-input"
                value={form.guardianPhone}
                onChange={(event) => setField("guardianPhone", event.target.value)}
                placeholder="Ejemplo: 70011223"
              />
              {errors.guardianPhone && (
                <p className="mt-1 text-xs text-rose-700">{errors.guardianPhone}</p>
              )}
            </div>

            <div>
              <label className="nutri-label" htmlFor="guardian-address">
                Dirección del guardián
              </label>
              <input
                id="guardian-address"
                className="nutri-input"
                value={form.guardianAddress}
                onChange={(event) => setField("guardianAddress", event.target.value)}
                placeholder="Zona, calle y referencia"
              />
              {errors.guardianAddress && (
                <p className="mt-1 text-xs text-rose-700">{errors.guardianAddress}</p>
              )}
            </div>
          </div>

          <label className="mt-4 flex items-start gap-2 text-sm text-nutri-dark-grey">
            <input
              type="checkbox"
              checked={form.confirmTutorData}
              onChange={(event) => setField("confirmTutorData", event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-nutri-light-grey"
            />
            Confirmo que los datos fueron brindados por el guardián responsable del paciente.
          </label>
          {errors.confirmTutorData && (
            <p className="mt-1 text-xs text-rose-700">{errors.confirmTutorData}</p>
          )}
        </section>

        {(errors.submit || submitMessage) && (
          <div className="nutri-clinician-surface-soft rounded-lg border border-nutri-light-grey px-4 py-3 text-sm">
            {errors.submit && <p className="text-rose-700">{errors.submit}</p>}
            {!errors.submit && submitMessage && <p className="text-emerald-700">{submitMessage}</p>}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="sm:min-w-[180px]"
            onClick={() => router.push("/dashboard/clinician/patients")}
          >
            Cancelar
          </Button>
          <Button type="submit" className="sm:min-w-[220px]" disabled={isSubmitting}>
            {isSubmitting ? "Guardando paciente..." : "Guardar paciente"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewPatientRegistrationContent;
