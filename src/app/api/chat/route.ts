import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateEnrichedPrompt } from "@/utils/promptEnricher";

// Supabase client (using NEXT_PUBLIC vars from your .env.local)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { message, conversationContext, isFirstMessage } = await req.json();
    const userId = "test-user"; // TODO: Replace with actual auth user ID

    // Get user profile
    let { data: userData } = await supabase
      .from("user_data")
      .select("*")
      .eq("user_id", userId)
      .single();

    let messages = userData?.messages || [];
    messages.push({ sender: "user", content: message });

    // Enrich prompt using promptEnricher
    const enrichedPrompt = generateEnrichedPrompt(
      message,
      messages.map((m: any) => m.content),
      userData || {}
    );

    // Call LLM API (Groq/any provider)
    const aiReply = await generateAIReply(enrichedPrompt);

    messages.push({ sender: "nyra", content: aiReply });

    // Save updated messages
    if (userData) {
      await supabase.from("user_data").update({ messages }).eq("user_id", userId);
    } else {
      await supabase.from("user_data").insert([{ user_id: userId, messages }]);
    }

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// This function will hit Groq API (replace with your logic)
async function generateAIReply(prompt: string) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 200,
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Sorry, I couldn't think of a reply.";
}
