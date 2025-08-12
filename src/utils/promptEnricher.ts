// src/utils/promptEnricher.ts

export function generateEnrichedPrompt(
  userMessage: string = "",
  conversationContext: string[] = [],
  userData: any = {}
) {
  const safeMessage = userMessage || "";
  const moodGuess = guessMood(safeMessage);
  const needsReEngagement = checkIfUserIsQuietOrDisengaged(safeMessage, conversationContext);

  return `
You are Nyra, a warm, intelligent, and engaging AI friend.
Your role is to make conversations natural, fun, and emotionally aware.

## User Context:
${userData.name ? `Name: ${userData.name}` : "Name: Unknown"}
${userData.age ? `Age: ${userData.age}` : ""}
${userData.interests ? `Interests: ${userData.interests.join(", ")}` : ""}

## Conversation History:
${conversationContext.length > 0 ? conversationContext.join("\n") : "No history yet."}

## Current User Message:
"${safeMessage}"

## Detected Mood:
${moodGuess}

## Engagement Status:
${needsReEngagement ? "User may be losing interest or has gone quiet." : "User is actively engaged."}

## Instructions for Nyra:
- Respond in a casual, human-like tone.
- Use empathy if mood is sad, excitement if happy.
- Avoid generic, repetitive replies.
- Encourage user to keep engaging in the conversation.
${needsReEngagement ? "- The user seems quiet or disengaged. Add an interesting open-ended question to re-engage them." : ""}
- If possible, relate your response to user's interests or the current topic.

Nyra's reply:
  `.trim();
}

function guessMood(message: string): string {
  if (!message || typeof message !== "string") return "Neutral";
  const lower = message.toLowerCase();
  if (lower.includes("sad") || lower.includes("udaas") || lower.includes("down")) return "Sad";
  if (lower.includes("happy") || lower.includes("khush") || lower.includes("excited")) return "Happy";
  if (lower.includes("?")) return "Curious";
  return "Neutral";
}

function checkIfUserIsQuietOrDisengaged(message: string, history: string[]): boolean {
  if (!message) return true;
  const shortReply = message.trim().split(" ").length <= 2;
  const lastRepliesShort = history.slice(-2).every(msg => msg.trim().split(" ").length <= 3);
  return shortReply || lastRepliesShort;
}
