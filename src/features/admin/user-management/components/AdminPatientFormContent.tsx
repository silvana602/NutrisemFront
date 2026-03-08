"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/atoms/Heading";
import { Button } from "@/components/ui/Button";
import { handleFormArrowNavigation } from "@/lib/forms/arrowFieldNavigation";
import { buildAdminPatientProfilePath } from "@/lib/routes/admin";
import { db, seedOnce } from "@/mocks/db";
import { uid } from "@/mocks/utils";
import type {
  PatientProfileFormData,
  PatientProfileFormErrors,
} from "../types";
import {
  buildGuardianEntityFromForm,
  buildPatientEntityFromForm,
  buildPatientTemporaryPassword,
  buildPatientUserFromForm,
  createEmptyPatientProfileFormData,
  mapPatientEntitiesToFormData,
  parsePatientBirthDate,
  sanitizePatientIdentityInput,
  sanitizePatientPhoneInput,
  sanitizePatientText,
  validatePatientProfileForm,
} from "../utils";

seedOnce();

type AdminPatientFormContentProps = {
  patientId?: string | null;
};

const GENDER_OPTIONS = [
  { value: "female", label: "Femenino" },
  { value: "male", label: "Masculino" },
] as const;

const TUTOR_RELATIONSHIP_OPTIONS = [
  "Madre",
  "Padre",
  "Tutor legal",
  "Abuela",
  "Abuelo",
  "Otro familiar",
];

type TextFieldKey =
  | "nombres"
  | "apellidos"
  | "direccion"
  | "tutorNombres"
  | "tutorApellidos"
  | "tutorParentesco"
  | "tutorDireccion";

function buildPatientsListPathWithResult(patientId: string): string {
  return `/dashboard/admin/users/pacientes?updatedPatientId=${encodeURIComponent(patientId)}`;
}

export function AdminPatientFormContent({
  patientId = null,
}: AdminPatientFormContentProps) {
  const router = useRouter();

  const currentPatient = useMemo(() => {
    if (!patientId) return null;

    const patient = db.patients.find((item) => item.patientId === patientId) ?? null;
    if (!patient) return null;

    const user = db.users.find((item) => item.userId === patient.userId) ?? null;
    if (!user) return null;

    const guardian = db.guardians.find((item) => item.patientId === patient.patientId) ?? null;

    return { patient, user, guardian };
  }, [patientId]);

  const [form, setForm] = useState<PatientProfileFormData>(() => {
    if (!currentPatient) return createEmptyPatientProfileFormData();
    return mapPatientEntitiesToFormData(
      currentPatient.patient,
      currentPatient.user,
      currentPatient.guardian
    );
  });
  const [errors, setErrors] = useState<PatientProfileFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fieldErrorMessages = useMemo(
    () =>
      Object.entries(errors)
        .filter(
          (entry): entry is [string, string] =>
            entry[0] !== "submit" &&
            typeof entry[1] === "string" &&
            entry[1].trim().length > 0
        )
        .map((entry) => entry[1]),
    [errors]
  );

  const setField = <K extends keyof PatientProfileFormData>(
    key: K,
    value: PatientProfileFormData[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, submit: undefined }));
  };

  const normalizeIdentityField = (key: "ci" | "tutorCi") => {
    setField(key, sanitizePatientIdentityInput(form[key]));
  };

  const normalizePhoneField = (key: "telefono" | "tutorTelefono") => {
    setField(key, sanitizePatientPhoneInput(form[key]));
  };

  const normalizeTextField = (key: TextFieldKey) => {
    setField(key, sanitizePatientText(form[key]));
  };

  const onCancel = () => {
    router.push(buildAdminPatientProfilePath());
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!currentPatient) {
      setErrors({
        submit:
          "No se encontró el paciente solicitado. Verifica el registro antes de editarlo.",
      });
      return;
    }

    const nextErrors = validatePatientProfileForm({
      form,
      users: db.users,
      guardians: db.guardians,
      currentUserId: currentPatient.user.userId,
      currentGuardianId: currentPatient.guardian?.guardianId ?? null,
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const birthDate = parsePatientBirthDate(form.fechaNacimiento);
    if (!birthDate) {
      setErrors({ fechaNacimiento: "Ingresa una fecha de nacimiento válida." });
      return;
    }

    const gender = form.sexoBiologico;
    if (gender !== "female" && gender !== "male") {
      setErrors({ sexoBiologico: "Selecciona el sexo biológico del paciente." });
      return;
    }

    setIsSubmitting(true);

    try {
      const currentPassword =
        db.passwords.get(currentPatient.user.userId) ??
        currentPatient.user.password ??
        buildPatientTemporaryPassword(form.ci);

      const updatedUser = buildPatientUserFromForm({
        form,
        userId: currentPatient.user.userId,
        password: currentPassword,
      });

      const updatedPatient = buildPatientEntityFromForm({
        form,
        patientId: currentPatient.patient.patientId,
        userId: currentPatient.user.userId,
        birthDate,
        gender,
      });

      Object.assign(currentPatient.user, updatedUser);
      Object.assign(currentPatient.patient, updatedPatient);
      db.passwords.set(currentPatient.user.userId, currentPassword);

      const guardianPassword =
        currentPatient.guardian?.password ??
        buildPatientTemporaryPassword(form.tutorCi || form.tutorTelefono);

      const updatedGuardian = buildGuardianEntityFromForm({
        form,
        guardianId: currentPatient.guardian?.guardianId ?? uid("gua"),
        patientId: currentPatient.patient.patientId,
        password: guardianPassword,
      });

      if (currentPatient.guardian) {
        Object.assign(currentPatient.guardian, updatedGuardian);
      } else {
        db.guardians.push(updatedGuardian);
      }

      router.push(buildPatientsListPathWithResult(currentPatient.patient.patientId));
    } catch (error) {
      console.error("Error guardando paciente:", error);
      setErrors({ submit: "No se pudo guardar la información del paciente." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <div className="nutri-platform-page-header p-4 sm:p-5">
        <Heading
          containerClassName="space-y-2"
          description="Actualiza datos del paciente y del tutor responsable para mantener los registros al día."
        >
          Editar datos del paciente
        </Heading>
      </div>

      {!currentPatient ? (
        <section className="nutri-platform-surface p-4 sm:p-5">
          <p className="text-sm text-rose-700">No se encontró el paciente solicitado.</p>
          <div className="mt-4">
            <Button variant="outline" onClick={onCancel}>
              Volver a gestión de pacientes
            </Button>
          </div>
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          onKeyDown={handleFormArrowNavigation}
          className="space-y-5"
        >
          {(errors.submit || fieldErrorMessages.length > 0) && (
            <section className="nutri-platform-surface-soft rounded-lg border border-nutri-light-grey px-4 py-3 text-sm">
              {errors.submit ? <p className="text-rose-700">{errors.submit}</p> : null}
              {fieldErrorMessages.length > 0 ? (
                <p className="text-rose-700">
                  Revisa los campos obligatorios: {fieldErrorMessages.length} pendiente(s).
                </p>
              ) : null}
            </section>
          )}

          <section className="nutri-platform-surface p-4 sm:p-5">
            <h2 className="mb-4 text-base font-semibold text-nutri-primary">
              1. Datos del paciente
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="nutri-label" htmlFor="admin-patient-first-name">
                  Nombres
                </label>
                <input
                  id="admin-patient-first-name"
                  className="nutri-input"
                  value={form.nombres}
                  onChange={(event) => setField("nombres", event.target.value)}
                  onBlur={() => normalizeTextField("nombres")}
                  placeholder="Ejemplo: María Fernanda"
                  autoComplete="given-name"
                />
                {errors.nombres ? <p className="mt-1 text-xs text-rose-700">{errors.nombres}</p> : null}
              </div>

              <div>
                <label className="nutri-label" htmlFor="admin-patient-last-name">
                  Apellidos
                </label>
                <input
                  id="admin-patient-last-name"
                  className="nutri-input"
                  value={form.apellidos}
                  onChange={(event) => setField("apellidos", event.target.value)}
                  onBlur={() => normalizeTextField("apellidos")}
                  placeholder="Ejemplo: Flores Meneses"
                  autoComplete="family-name"
                />
                {errors.apellidos ? (
                  <p className="mt-1 text-xs text-rose-700">{errors.apellidos}</p>
                ) : null}
              </div>

              <div>
                <label className="nutri-label" htmlFor="admin-patient-ci">
                  CI
                </label>
                <input
                  id="admin-patient-ci"
                  className="nutri-input"
                  value={form.ci}
                  onChange={(event) => setField("ci", event.target.value)}
                  onBlur={() => normalizeIdentityField("ci")}
                  placeholder="Número de identificación"
                  autoComplete="off"
                />
                {errors.ci ? <p className="mt-1 text-xs text-rose-700">{errors.ci}</p> : null}
              </div>

              <div>
                <label className="nutri-label" htmlFor="admin-patient-gender">
                  Sexo biológico
                </label>
                <select
                  id="admin-patient-gender"
                  className="nutri-input"
                  value={form.sexoBiologico}
                  onChange={(event) =>
                    setField(
                      "sexoBiologico",
                      event.target.value as PatientProfileFormData["sexoBiologico"]
                    )
                  }
                >
                  <option value="">Selecciona</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.sexoBiologico ? (
                  <p className="mt-1 text-xs text-rose-700">{errors.sexoBiologico}</p>
                ) : null}
              </div>

              <div>
                <label className="nutri-label" htmlFor="admin-patient-birth-date">
                  Fecha de nacimiento
                </label>
                <input
                  id="admin-patient-birth-date"
                  type="date"
                  className="nutri-input"
                  value={form.fechaNacimiento}
                  onChange={(event) => setField("fechaNacimiento", event.target.value)}
                />
                {errors.fechaNacimiento ? (
                  <p className="mt-1 text-xs text-rose-700">{errors.fechaNacimiento}</p>
                ) : null}
              </div>

              <div>
                <label className="nutri-label" htmlFor="admin-patient-phone">
                  Teléfono de contacto
                </label>
                <input
                  id="admin-patient-phone"
                  className="nutri-input"
                  value={form.telefono}
                  onChange={(event) => setField("telefono", event.target.value)}
                  onBlur={() => normalizePhoneField("telefono")}
                  placeholder="Ejemplo: 70011223"
                  inputMode="tel"
                  autoComplete="tel"
                />
                {errors.telefono ? (
                  <p className="mt-1 text-xs text-rose-700">{errors.telefono}</p>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label className="nutri-label" htmlFor="admin-patient-address">
                  Dirección del paciente
                </label>
                <input
                  id="admin-patient-address"
                  className="nutri-input"
                  value={form.direccion}
                  onChange={(event) => setField("direccion", event.target.value)}
                  onBlur={() => normalizeTextField("direccion")}
                  placeholder="Zona, calle y referencia"
                  autoComplete="street-address"
                />
                {errors.direccion ? (
                  <p className="mt-1 text-xs text-rose-700">{errors.direccion}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="nutri-platform-surface p-4 sm:p-5">
            <h2 className="mb-4 text-base font-semibold text-nutri-primary">
              2. Datos del tutor responsable
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="nutri-label" htmlFor="admin-tutor-first-name">
                  Nombres del tutor
                </label>
                <input
                  id="admin-tutor-first-name"
                  className="nutri-input"
                  value={form.tutorNombres}
                  onChange={(event) => setField("tutorNombres", event.target.value)}
                  onBlur={() => normalizeTextField("tutorNombres")}
                  placeholder="Ejemplo: Rita"
                  autoComplete="given-name"
                />
                {errors.tutorNombres ? (
                  <p className="mt-1 text-xs text-rose-700">{errors.tutorNombres}</p>
                ) : null}
              </div>

              <div>
                <label className="nutri-label" htmlFor="admin-tutor-last-name">
                  Apellidos del tutor
                </label>
                <input
                  id="admin-tutor-last-name"
                  className="nutri-input"
                  value={form.tutorApellidos}
                  onChange={(event) => setField("tutorApellidos", event.target.value)}
                  onBlur={() => normalizeTextField("tutorApellidos")}
                  placeholder="Ejemplo: Meneses"
                  autoComplete="family-name"
                />
                {errors.tutorApellidos ? (
                  <p className="mt-1 text-xs text-rose-700">{errors.tutorApellidos}</p>
                ) : null}
              </div>

              <div>
                <label className="nutri-label" htmlFor="admin-tutor-ci">
                  CI del tutor
                </label>
                <input
                  id="admin-tutor-ci"
                  className="nutri-input"
                  value={form.tutorCi}
                  onChange={(event) => setField("tutorCi", event.target.value)}
                  onBlur={() => normalizeIdentityField("tutorCi")}
                  placeholder="Número de identificación"
                  autoComplete="off"
                />
                {errors.tutorCi ? (
                  <p className="mt-1 text-xs text-rose-700">{errors.tutorCi}</p>
                ) : null}
              </div>

              <div>
                <label className="nutri-label" htmlFor="admin-tutor-relationship">
                  Parentesco
                </label>
                <input
                  id="admin-tutor-relationship"
                  className="nutri-input"
                  value={form.tutorParentesco}
                  onChange={(event) => setField("tutorParentesco", event.target.value)}
                  onBlur={() => normalizeTextField("tutorParentesco")}
                  list="admin-tutor-relationship-options"
                />
                <datalist id="admin-tutor-relationship-options">
                  {TUTOR_RELATIONSHIP_OPTIONS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                {errors.tutorParentesco ? (
                  <p className="mt-1 text-xs text-rose-700">{errors.tutorParentesco}</p>
                ) : null}
              </div>

              <div>
                <label className="nutri-label" htmlFor="admin-tutor-phone">
                  Teléfono del tutor
                </label>
                <input
                  id="admin-tutor-phone"
                  className="nutri-input"
                  value={form.tutorTelefono}
                  onChange={(event) => setField("tutorTelefono", event.target.value)}
                  onBlur={() => normalizePhoneField("tutorTelefono")}
                  placeholder="Ejemplo: 70011223"
                  inputMode="tel"
                  autoComplete="tel"
                />
                {errors.tutorTelefono ? (
                  <p className="mt-1 text-xs text-rose-700">{errors.tutorTelefono}</p>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label className="nutri-label" htmlFor="admin-tutor-address">
                  Dirección del tutor
                </label>
                <input
                  id="admin-tutor-address"
                  className="nutri-input"
                  value={form.tutorDireccion}
                  onChange={(event) => setField("tutorDireccion", event.target.value)}
                  onBlur={() => normalizeTextField("tutorDireccion")}
                  placeholder="Zona, calle y referencia"
                  autoComplete="street-address"
                />
                {errors.tutorDireccion ? (
                  <p className="mt-1 text-xs text-rose-700">{errors.tutorDireccion}</p>
                ) : null}
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="sm:min-w-[180px]"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button type="submit" className="sm:min-w-[220px]" disabled={isSubmitting}>
              {isSubmitting ? "Guardando cambios..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
