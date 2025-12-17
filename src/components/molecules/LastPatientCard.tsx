import { colors } from "@/lib/colors";
import { calculateAge } from "@/lib/utils";

export const LastPatientCard = ({ patient }: { patient: any }) => (
  <div
    className="p-4 rounded-lg shadow-md border"
    style={{ background: colors.white, borderColor: colors.lightGrey }}
  >
    <h3 className="font-semibold text-lg mb-2">Último paciente</h3>

    <div className="grid grid-cols-2 gap-2 text-sm">
      <p><strong>Nombre:</strong> {patient.name}</p>
      <p><strong>Padre/Tutor:</strong> {patient.parentName}</p>
      <p><strong>CI:</strong> {patient.idCard}</p>
      <p><strong>Edad:</strong> {calculateAge(patient.dateOfBirth)}</p>
      <p><strong>Peso:</strong> {patient.weight}</p>
      <p><strong>Sexo:</strong> {patient.gender}</p>
      <p><strong>Talla:</strong> {patient.height}</p>
      <p><strong>Estado nutricional:</strong> {patient.status}</p>
    </div>

    <a
      href="#"
      className="text-sm font-semibold mt-3 inline-block"
      style={{ color: colors.primary }}
    >
      Ver diagnóstico completo
    </a>
  </div>
);
