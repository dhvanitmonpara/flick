import { PostTopic } from "@/types/postTopics";
import parseTopic from "./parse-topic";

function unparseTopic(parsedTopic: string): string | null {
  if (!parsedTopic || typeof parsedTopic !== "string") {
    console.warn("⚠️ unparseTopic: Invalid input", parsedTopic);
    return null;
  }

  // Normalize the input: convert spaces to + for URL-encoded format
  // Also handle case where URL parameter might be space-separated or + separated
  const normalizedInput = parsedTopic.replace(/ /g, "+").toLowerCase();

  // Try exact match first
  for (const topic of PostTopic) {
    if (parseTopic(topic).toLowerCase() === normalizedInput) {
      return topic;
    }
  }

  // Try with space instead of +
  const spaceInput = parsedTopic.replace(/\+/g, " ").toLowerCase();
  for (const topic of PostTopic) {
    if (topic.toLowerCase() === spaceInput) {
      return topic;
    }
  }

  // Try case-insensitive exact match with original value
  const lowerParsed = parsedTopic.toLowerCase();
  for (const topic of PostTopic) {
    if (topic.toLowerCase() === lowerParsed) {
      return topic;
    }
  }

  console.warn("❌ unparseTopic: No match found for:", parsedTopic);
  return null;
}

export default unparseTopic;
