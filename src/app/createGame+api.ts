export async function POST(request: Request) {
  const { sport, home, away, date, location } = await request.json();

  if (!home || !away || !date || !location) {
    return Response.json("Todos os campos são obrigatórios", { status: 400 });
  }

  if (home === away) {
    return Response.json("Os times não podem ser iguais", { status: 400 });
  }

  return Response.json({
    sport,
    home,
    away,
    date,
    location,
  });
}