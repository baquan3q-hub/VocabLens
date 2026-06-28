import { isLookupTerm, lookupRequestSchema } from "@vocablens/shared";
import { lookupTerm } from "@/lib/lookup";

export async function POST(request: Request) {
  try {
    const input = lookupRequestSchema.parse(await request.json());
    if (!isLookupTerm(input.term)) {
      return Response.json({ error: "Vui lòng chọn đúng một từ tiếng Anh." }, { status: 400 });
    }
    return Response.json({ data: await lookupTerm(input.term, input.context) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tra từ lúc này.";
    return Response.json({ error: message }, { status: 400 });
  }
}
