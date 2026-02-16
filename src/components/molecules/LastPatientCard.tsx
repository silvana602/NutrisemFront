type LastPatient = {
  name: string;
  parentName: string;
  idCard: string;
  age: number | string;
  weight: string;
  gender: string;
  height: string;
  status: string;
};

export const LastPatientCard = ({ patient }: { patient: LastPatient }) => (
  <div className="rounded-lg border border-nutri-light-grey bg-nutri-white p-4 shadow-md">
    <h3 className="mb-2 text-lg font-semibold">Ultimo paciente</h3>

    <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
      <p><strong>Nombre:</strong> {patient.name}</p>
      <p><strong>Padre/Tutor:</strong> {patient.parentName}</p>
      <p><strong>CI:</strong> {patient.idCard}</p>
      <p><strong>Edad:</strong> {patient.age}</p>
      <p><strong>Peso:</strong> {patient.weight}</p>
      <p><strong>Sexo:</strong> {patient.gender}</p>
      <p><strong>Talla:</strong> {patient.height}</p>
      <p><strong>Estado nutricional:</strong> {patient.status}</p>
    </div>

    <a
      href="#"
      className="mt-3 inline-block text-sm font-semibold text-nutri-primary"
    >
      Ver diagnostico completo
    </a>
  </div>
);
