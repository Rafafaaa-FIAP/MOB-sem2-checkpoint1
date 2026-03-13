export async function POST(request: Request): Promise<Response> {
  const { sport } = await request.json()

  if (sport === "") {
    return new Response("Esporte não digitado!", {
    status: 404,
    headers: {
      "Content-Type": "text/plain",
    },
  })
  }
  else {
    return Response.json({
      sport: sport,
    })
  }
}
