import { describe, expect, it } from "vitest";
import {
  validateDocumentNumber,
  validateRequired,
} from "@/utils/validators";

describe("validators", () => {
  it("validateRequired retorna error para texto vacio", () => {
    expect(validateRequired("", "La CI")).toBe("La CI es obligatorio");
    expect(validateRequired("   ", "La CI")).toBe("La CI es obligatorio");
  });

  it("validateRequired retorna null cuando hay contenido", () => {
    expect(validateRequired("1234", "La CI")).toBeNull();
  });

  it("validateDocumentNumber valida longitud y formato", () => {
    expect(validateDocumentNumber("12")).toBe("Número de documento inválido");
    expect(validateDocumentNumber("ABCD-1234")).toBeNull();
    expect(validateDocumentNumber("ABC#123")).toBe("Número de documento inválido");
  });
});
