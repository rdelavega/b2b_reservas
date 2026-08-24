export function reservationEmailTemplate(
  titulo: string,
  mensaje: string,
  detalles: Record<string, string>,
) {
  const filas = Object.entries(detalles)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 8px;color:#666;">${k}</td><td style="padding:4px 8px;"><strong>${v}</strong></td></tr>`,
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;">
      <h2>${titulo}</h2>
      <p>${mensaje}</p>
      <table>${filas}</table>
      <p style="color:#999;font-size:12px;">Sistema de Reservas para Restaurantes</p>
    </div>
  `;
}
