import { useState } from "react";
import { AlertTriangle, ChevronRight, LogOut, Terminal } from "lucide-react";

export function IndustrialTerminal() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    setIsLoading(true);
    setShowError(false);
    setTimeout(() => {
      setIsLoading(false);
      setShowError(true);
    }, 1100);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0d1117",
    border: "1px solid #30363d",
    color: "#e6edf3",
    padding: "10px 12px",
    fontSize: "13px",
    fontFamily: "'Courier New', 'Fira Code', monospace",
    outline: "none",
    borderRadius: "2px",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        color: "#c9d1d9",
        fontFamily: "'Courier New', 'Fira Code', monospace",
        display: "flex",
        flexDirection: "column",
        backgroundImage:
          "linear-gradient(rgba(48,54,61,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(48,54,61,0.25) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          borderBottom: "1px solid #30363d",
          background: "#161b22",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Terminal size={14} color="#ffb800" />
          <span
            style={{
              color: "#ffb800",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            SCANIA NOVEDADES
          </span>
          <span style={{ color: "#30363d" }}>/</span>
          <span
            style={{
              color: "#8b949e",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            IDENTIFICACIÓN DE OPERARIO
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{ width: 8, height: 8, borderRadius: "50%", background: "#238636" }}
          />
          <span style={{ color: "#8b949e", fontSize: "11px", letterSpacing: "0.08em" }}>
            SISTEMA ACTIVO
          </span>
        </div>
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Watermark */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <span
            style={{
              fontSize: "180px",
              fontWeight: 900,
              color: "#ffb800",
              opacity: 0.03,
              letterSpacing: "-4px",
              fontFamily: "Arial Black, sans-serif",
            }}
          >
            SCANIA
          </span>
        </div>

        <div style={{ position: "relative", width: "100%", maxWidth: "420px" }}>
          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                color: "#8b949e",
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              › Sistema de Control de Acceso v2.4
            </div>
            <h1
              style={{
                color: "#e6edf3",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "-0.5px",
                marginBottom: "6px",
                fontFamily: "inherit",
              }}
            >
              Verificar Identidad
            </h1>
            <p style={{ color: "#8b949e", fontSize: "12px", lineHeight: 1.6 }}>
              Ingrese su nombre tal como figura en el registro de operarios autorizados.
            </p>
          </div>

          {/* Form card */}
          <div
            style={{
              border: "1px solid #30363d",
              background: "#161b22",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            {/* Card header */}
            <div
              style={{
                padding: "10px 20px",
                borderBottom: "1px solid #30363d",
                background: "#1c2128",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  color: "#ffb800",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Registro de Operario
              </span>
              <span style={{ color: "#8b949e", fontSize: "11px" }}>
                REQ-ID: 2026-0502
              </span>
            </div>

            <div style={{ padding: "20px" }}>
              <form onSubmit={handleSubmit}>
                {/* First name */}
                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      color: "#8b949e",
                      fontSize: "10px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    NOMBRE{" "}
                    <span style={{ color: "#e74c3c" }}>// OBLIGATORIO</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setShowError(false);
                    }}
                    placeholder="Ej: Pedro"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ffb800";
                      e.target.style.boxShadow = "0 0 0 2px rgba(255,184,0,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#30363d";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {/* Last name */}
                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      color: "#8b949e",
                      fontSize: "10px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    APELLIDO{" "}
                    <span style={{ color: "#e74c3c" }}>// OBLIGATORIO</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setShowError(false);
                    }}
                    placeholder="Ej: González"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ffb800";
                      e.target.style.boxShadow = "0 0 0 2px rgba(255,184,0,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#30363d";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {/* Error */}
                {showError && (
                  <div
                    style={{
                      borderLeft: "2px solid #e74c3c",
                      paddingLeft: "12px",
                      paddingTop: "8px",
                      paddingBottom: "8px",
                      background: "rgba(231,76,60,0.05)",
                      marginBottom: "18px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <AlertTriangle
                        size={13}
                        color="#e74c3c"
                        style={{ marginTop: "1px", flexShrink: 0 }}
                      />
                      <span
                        style={{
                          color: "#e74c3c",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                        }}
                      >
                        ACCESO DENEGADO — Nombre no registrado.
                      </span>
                    </div>
                    <p
                      style={{
                        color: "#8b949e",
                        fontSize: "11px",
                        marginTop: "4px",
                        paddingLeft: "21px",
                      }}
                    >
                      Verificar ortografía o contactar supervisión.
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || !firstName.trim() || !lastName.trim()}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background:
                      !firstName.trim() || !lastName.trim() || isLoading
                        ? "#5a4a00"
                        : "#ffb800",
                    color: "#0d1117",
                    border: "none",
                    cursor:
                      firstName.trim() && lastName.trim() && !isLoading
                        ? "pointer"
                        : "not-allowed",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontFamily: "inherit",
                    borderRadius: "2px",
                    opacity: !firstName.trim() || !lastName.trim() ? 0.5 : 1,
                  }}
                >
                  <span>{isLoading ? "VERIFICANDO..." : "CONFIRMAR IDENTIDAD"}</span>
                  {!isLoading && <ChevronRight size={16} />}
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 2px",
            }}
          >
            <span style={{ color: "#484f58", fontSize: "11px", letterSpacing: "0.05em" }}>
              Acceso restringido · Solo personal autorizado
            </span>
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#484f58",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                fontFamily: "inherit",
              }}
            >
              <LogOut size={12} />
              Salir
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#21262d" }} />
            <span style={{ color: "#484f58", fontSize: "11px", whiteSpace: "nowrap" }}>
              SCANIA © 2026 · Partes Técnicos
            </span>
            <div style={{ flex: 1, height: "1px", background: "#21262d" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
