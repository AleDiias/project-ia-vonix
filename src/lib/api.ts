
const API_BASE_URL = "http://192.168.11.14:7501";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendChatMessage(message: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const data = await response.json();
    return data.response || data.message;
  } catch (error) {
    console.error("Chat API Error:", error);
    throw error;
  }
}

export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(`${API_BASE_URL}/tts/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Failed to convert text to speech");
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error("TTS API Error:", error);
    throw error;
  }
}
