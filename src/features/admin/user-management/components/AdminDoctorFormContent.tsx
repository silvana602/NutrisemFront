"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/atoms/Heading";
import { Button } from "@/components/ui/Button";
import { db, seedOnce } from "@/mocks/db";
import { uid } from "@/mocks/utils";
import { buildAdminDoctorProfilePath } from "@/lib/routes/admin";
import type {
  DoctorProfileFormData,
  DoctorProfileFormErrors,
} from "../types";
import {
  buildDoctorClinicianFromForm,
  buildDoctorTemporaryPassword,
  buildDoctorUserFromForm,
  createEmptyDoctorProfileFormData,
  mapDoctorEntitiesToFormData,
  sanitizeDoctorIdentityInput,
  sanitizeDoctorLicenseInput,
  sanitizeDoctorPhoneInput,
  sanitizeDoctorText,
  validateDoctorProfileForm,
} from "../utils";

seedOnce();

type DoctorFormMode = "create" | "edit";

type AdminDoctorFormContentProps = {
  mode: DoctorFormMode;
  clinicianId?: string | null;
};

const DEFAULT_PROFESSION_OPTIONS = [
  "Médico cirujano",
  "Médico general",
  "Nutricionista",
];

const DEFAULT_SPECIALTY_OPTIONS = [
  "Pediatría",
  "Nutrición pediátrica",
  "Medicina familiar",
];

function buildDoctorsListPathWithResult(
  mode: DoctorFormMode,
  clinicianId: string
): string {
  const queryKey = mode === "create" ? "newClinicianId" : "updatedClinicianId";
  return `/dashboard/admin/users/medicos?${queryKey}=${encodeURIComponent(clinicianId)}`;
}

function getPageCopy(mode: DoctorFormMode) {
  if (mode === "edit") {
    return {
      title: "Editar datos del médico",
      description:
        "Actualiza información personal y profesional del médico para mantener su perfil al día.",
      submitLabel: "Guardar cambios",
      submittingLabel: "Guardando cambios...",
    };
  }

  return {
    title: "Alta de nuevo médico",
    description:
      "Completa los datos personales y profesionales para registrar un médico en el sistema.",
    submitLabel: "Registrar médico",
    submittingLabel: "Registrando médico...",
  };
}

export function AdminDoctorFormContent({
  mode,
  clinicianId = null,
}: AdminDoctorFormContentProps) {
  const router = useRouter();

  const currentDoctor = useMemo(() => {
    if (mode !== "edit" || !clinicianId) return null;
    const clinician = db.clinicians.find((item) => item.clinicianId === clinicianId) ?? null;
    if (!clinician) return null;
    const user = db.users.find((item) => item.userId === clinician.userId) ?? null;
    if (!user) return null;
    return { clinician, user };
  }, [mode, clinicianId]);

  const [form, setForm] = useState<DoctorProfileFormData>(() => {
    if (mode === "edit" && currentDoctor) {
      return mapDoctorEntitiesToFormData(currentDoctor.clinician, currentDoctor.user);
    }
    return createEmptyDoctorProfileFormData();
  });
  const [errors, setErrors] = useState<DoctorProfileFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageCopy = getPageCopy(mode);
  const isCreateMode = mode === "create";

  const professionOptions = useMemo(() => {
    const values = [...DEFAULT_PROFESSION_OPTIONS, ...db.clinicians.map((item) => item.profession)];
    return Array.from(new Set(values.map((value) => sanitizeDoctorText(value)).filter(Boolean)))
      .sort((first, second) => first.localeCompare(second, "es"));
  }, []);

  const specialtyOptions = useMemo(() => {
    const values = [...DEFAULT_SPECIALTY_OPTIONS, ...db.clinicians.map((item) => item.specialty)];
    return Array.from(new Set(values.map((value) => sanitizeDoctorText(value)).filter(Boolean)))
      .sort((first, second) => first.localeCompare(second, "es"));
  }, []);

  const residenceOptions = useMemo(() => {
    const values = db.clinicians.map((item) => sanitizeDoctorText(item.residence)).filter(Boolean);
    return Array.from(new Set(values)).sort((first, second) => first.localeCompare(second, "es"));
  }, []);

  const institutionOptions = useMemo(() => {
    const values = db.clinicians.map((item) => sanitizeDoctorText(item.institution)).filter(Boolean);
    return Array.from(new Set(values)).sort((first, second) => first.localeCompare(second, "es"));
  }, []);

  const generatedTemporaryPassword = useMemo(() => {
    if (!isCreateMode) return null;
    return buildDoctorTemporaryPassword(form.ci);
  }, [form.ci, isCreateMode]);

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

  const setField = <K extends keyof DoctorProfileFormData>(
    key: K,
    value: DoctorProfileFormData[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, submit: undefined }));
  };

  const normalizeField = (key: keyof DoctorProfileFormData) => {
    if (key === "ci") {
      setField("ci", sanitizeDoctorIdentityInput(form.ci));
      return;
    }
    if (key === "telefono") {
      setField("telefono", sanitizeDoctorPhoneInput(form.telefono));
      return;
    }
    if (key === "numeroColegiatura") {
      setField("numeroColegiatura", sanitizeDoctorLicenseInput(form.numeroColegiatura));
      return;
    }
    setField(key, sanitizeDoctorText(form[key]));
  };

  const onCancel = () => {
    router.push(buildAdminDoctorProfilePath());
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (mode === "edit" && !currentDoctor) {
      setErrors({
        submit:
          "No se encontró el médico solicitado. Verifica el registro antes de editarlo.",
      });
      return;
    }

    const nextErrors = validateDoctorProfileForm({
      form,
      users: db.users,
      clinicians: db.clinicians,
      currentUserId: currentDoctor?.user.userId ?? null,
      currentClinicianId: currentDoctor?.clinician.clinicianId ?? null,
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const userId = uid("usr");
        const nextClinicianId = uid("cli");
        const temporaryPassword = buildDoctorTemporaryPassword(form.ci);

        const nextUser = buildDoctorUserFromForm({
          form,
          userId,
          password: temporaryPassword,
        });
        const nextClinician = buildDoctorClinicianFromForm({
          form,
          clinicianId: nextClinicianId,
          userId,
        });

        db.users.push(nextUser);
        db.clinicians.push(nextClinician);
        db.passwords.set(userId, temporaryPassword);

        router.push(buildDoctorsListPathWithResult("create", nextClinicianId));
        return;
      }

      if (!currentDoctor) {
        setErrors({
          submit:
            "No se encontró el médico solicitado. Verifica el registro antes de editarlo.",
        });
        setIsSubmitting(false);
        return;
      }

      const currentPassword =
        db.passwords.get(currentDoctor.user.userId) ??
        currentDoctor.user.password ??
        buildDoctorTemporaryPassword(form.ci);

      const updatedUser = buildDoctorUserFromForm({
        form,
        userId: currentDoctor.user.userId,
        password: currentPassword,
      });
      const updatedClinician = buildDoctorClinicianFromForm({
        form,
        clinicianId: currentDoctor.clinician.clinicianId,
        userId: currentDoctor.user.userId,
      });

      Object.assign(currentDoctor.user, updatedUser);
      Object.assign(currentDoctor.clinician, updatedClinician);
      db.passwords.set(currentDoctor.user.userId, currentPassword);

      router.push(
        buildDoctorsListPathWithResult("edit", currentDoctor.clinician.clinicianId)
      );
    } catch (error) {
      console.error("Error guardando médico:", error);
      setErrors({ submit: "No se pudo guardar la información del médico." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <div className="nutri-platform-page-header p-4 sm:p-5">
        <Heading containerClassName="space-y-2" description={pageCopy.description}>
          {pageCopy.title}
        </Heading>
      </div>

      {mode === "edit" && !currentDoctor ? (
        <section className="nutri-platform-surface p-4 sm:p-5">
          <p className="text-sm text-rose-700">
            No se encontró el médico solicitado.
          </p>
          <div className="mt-4">
            <Button variant="outline" onClick={onCancel}>
              Volver a gestión de médicos
            </Button>
          </div>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {(errors.submit || fieldErrorMessages.length > 0) && (
            <section className="nutri-platform-surface-soft rounded-lg border border-nutri-light-grey px-4 py-3 text-sm">
              {errors.submit && <p className="text-rose-700">{errors.submit}</p>}
              {fieldErrorMessages.length > 0 && (
                <p className="text-rose-700">
                  Revisa los campos obligatorios: {fieldErrorMessages.length} pendiente(s).
                </p>
              )}
            </section>
          )}

          {isCreateMode && (
            <section className="nutri-platform-surface-soft rounded-lg border border-nutri-secondary/25 px-4 py-3 text-sm text-nutri-dark-grey">
              <p className="font-semibold text-nutri-primary">Credenciales temporales</p>
              <p className="mt-1">
                Usuario de ingreso: <span className="font-semibold">{form.ci || "CI del médico"}</span>
              </p>
              <p className="mt-1">
                Contraseña temporal:{" "}
                <span className="font-semibold">{generatedTemporaryPassword}</span>
              </p>
              <p className="mt-1 text-xs text-nutri-dark-grey/80">
                Solicita el cambio de contraseña en el primer inicio de sesión.
              </p>
            </section>
          )}

          <section className="nutri-platform-surface p-4 sm:p-5">
            <h2 className="mb-4 text-base font-semibold text-nutri-primary">
              1. Datos personales
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="nutri-label" htmlFor="doctor-first-name">
                  Nombres
                </label>
                <input
                  id="doctor-first-name"
                  className="nutri-input"
                  value={form.nombres}
                  onChange={(event) => setField("nombres", event.target.value)}
                  onBlur={() => normalizeField("nombres")}
                  placeholder="Ejemplo: Juan Carlos"
                  autoComplete="given-name"
                />
                {errors.nombres && (
                  <p className="mt-1 text-xs text-rose-700">{errors.nombres}</p>
                )}
              </div>

              <div>
                <label className="nutri-label" htmlFor="doctor-last-name">
                  Apellidos
                </label>
                <input
                  id="doctor-last-name"
                  className="nutri-input"
                  value={form.apellidos}
                  onChange={(event) => setField("apellidos", event.target.value)}
                  onBlur={() => normalizeField("apellidos")}
                  placeholder="Ejemplo: Mendoza Quiroga"
                  autoComplete="family-name"
                />
                {errors.apellidos && (
                  <p className="mt-1 text-xs text-rose-700">{errors.apellidos}</p>
                )}
              </div>

              <div>
                <label className="nutri-label" htmlFor="doctor-ci">
                  CI
                </label>
                <input
                  id="doctor-ci"
                  className="nutri-input"
                  value={form.ci}
                  onChange={(event) => setField("ci", event.target.value)}
                  onBlur={() => normalizeField("ci")}
                  placeholder="Número de identificación"
                  inputMode="numeric"
                  autoComplete="off"
                />
                {errors.ci && <p className="mt-1 text-xs text-rose-700">{errors.ci}</p>}
              </div>

              <div>
                <label className="nutri-label" htmlFor="doctor-phone">
                  Teléfono
                </label>
                <input
                  id="doctor-phone"
                  className="nutri-input"
                  value={form.telefono}
                  onChange={(event) => setField("telefono", event.target.value)}
                  onBlur={() => normalizeField("telefono")}
                  placeholder="Ejemplo: 70011223"
                  inputMode="tel"
                  autoComplete="tel"
                />
                {errors.telefono && (
                  <p className="mt-1 text-xs text-rose-700">{errors.telefono}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="nutri-label" htmlFor="doctor-address">
                  Dirección
                </label>
                <input
                  id="doctor-address"
                  className="nutri-input"
                  value={form.direccion}
                  onChange={(event) => setField("direccion", event.target.value)}
                  onBlur={() => normalizeField("direccion")}
                  placeholder="Zona, calle y referencia"
                  autoComplete="street-address"
                />
                {errors.direccion && (
                  <p className="mt-1 text-xs text-rose-700">{errors.direccion}</p>
                )}
              </div>
            </div>
          </section>

          <section className="nutri-platform-surface p-4 sm:p-5">
            <h2 className="mb-4 text-base font-semibold text-nutri-primary">
              2. Datos profesionales
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="nutri-label" htmlFor="doctor-profession">
                  Profesión
                </label>
                <input
                  id="doctor-profession"
                  className="nutri-input"
                  value={form.profesion}
                  onChange={(event) => setField("profesion", event.target.value)}
                  onBlur={() => normalizeField("profesion")}
                  placeholder="Ejemplo: Médico cirujano"
                  list="doctor-profession-options"
                />
                <datalist id="doctor-profession-options">
                  {professionOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                {errors.profesion && (
                  <p className="mt-1 text-xs text-rose-700">{errors.profesion}</p>
                )}
              </div>

              <div>
                <label className="nutri-label" htmlFor="doctor-specialty">
                  Especialidad
                </label>
                <input
                  id="doctor-specialty"
                  className="nutri-input"
                  value={form.especialidad}
                  onChange={(event) => setField("especialidad", event.target.value)}
                  onBlur={() => normalizeField("especialidad")}
                  placeholder="Ejemplo: Pediatría"
                  list="doctor-specialty-options"
                />
                <datalist id="doctor-specialty-options">
                  {specialtyOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                {errors.especialidad && (
                  <p className="mt-1 text-xs text-rose-700">{errors.especialidad}</p>
                )}
              </div>

              <div>
                <label className="nutri-label" htmlFor="doctor-license">
                  Número de colegiatura
                </label>
                <input
                  id="doctor-license"
                  className="nutri-input"
                  value={form.numeroColegiatura}
                  onChange={(event) => setField("numeroColegiatura", event.target.value)}
                  onBlur={() => normalizeField("numeroColegiatura")}
                  placeholder="Ejemplo: MP-001"
                  autoComplete="off"
                />
                {errors.numeroColegiatura && (
                  <p className="mt-1 text-xs text-rose-700">
                    {errors.numeroColegiatura}
                  </p>
                )}
              </div>

              <div>
                <label className="nutri-label" htmlFor="doctor-residence">
                  Residencia
                </label>
                <input
                  id="doctor-residence"
                  className="nutri-input"
                  value={form.residencia}
                  onChange={(event) => setField("residencia", event.target.value)}
                  onBlur={() => normalizeField("residencia")}
                  placeholder="Ciudad o región"
                  list="doctor-residence-options"
                />
                <datalist id="doctor-residence-options">
                  {residenceOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                {errors.residencia && (
                  <p className="mt-1 text-xs text-rose-700">{errors.residencia}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="nutri-label" htmlFor="doctor-institution">
                  Institución
                </label>
                <input
                  id="doctor-institution"
                  className="nutri-input"
                  value={form.institucion}
                  onChange={(event) => setField("institucion", event.target.value)}
                  onBlur={() => normalizeField("institucion")}
                  placeholder="Ejemplo: Hospital del Niño"
                  list="doctor-institution-options"
                />
                <datalist id="doctor-institution-options">
                  {institutionOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                {errors.institucion && (
                  <p className="mt-1 text-xs text-rose-700">{errors.institucion}</p>
                )}
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
              {isSubmitting ? pageCopy.submittingLabel : pageCopy.submitLabel}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
