
export async function GET(): Promise<Response> {
  return Response.json({
    sports: ["Futsal", "Vôlei", "Basquete", "Counter Strike"],
  })
}
