// Simple OpenAI Service for Farmer Steve AI Chatbot! 🤖🌾
class OpenAIService {
  constructor() {
    // Get API key from environment variables
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
    
    console.log('🔑 Checking for OpenAI API key...');
    if (!this.apiKey) {
      console.error('❌ VITE_OPENAI_API_KEY not found in environment variables');
      console.log('💡 Make sure you have VITE_OPENAI_API_KEY=your_key_here in your .env file');
    } else {
      console.log('✅ OpenAI API key loaded successfully');
    }
  }
  
  async chatWithSteve(userMessage, conversationHistory = []) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please check your .env file has VITE_OPENAI_API_KEY set.');
    }
    
    const systemPrompt = `You are Farmer Steve, a friendly and knowledgeable farmer in a horse riding game. You give helpful tips about:

GAME CONTEXT:
- This is a horse riding farm game with 4 themed fields: Wildflower Field, Wheat Field, Cattle Pasture, and Hay Field
- Players can explore in free roam mode or take on haystack collection challenges
- Horse controls: WASD/Arrow keys to move, SPACE to jump
- There are fences between fields with gates to pass through
- Animals (cows and chickens) roam the fields
- Farmer Joe offers timed haystack collection challenges (collect 12 haystacks in 60 seconds)
- You (Farmer Steve) are in the Wheat Field and give helpful tips

PERSONALITY:
- Friendly, cheerful, and helpful
- Use farm/countryside expressions like "G'day mate!", "Well I'll be!", "That's the spirit!"
- Keep responses conversational and encouraging
- Focus on practical game tips and encouragement
- Sometimes mention the beautiful countryside or farm life

TIPS YOU CAN GIVE:
- Movement controls and horse handling
- How to navigate between fields
- Tips for the haystack challenge
- Exploration advice
- Jumping techniques
- Field-specific information

Keep responses under 100 words and stay in character as a helpful farmer!`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];
    
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          max_tokens: 150,
          temperature: 0.8
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw error;
    }
  }
}

// Create global instance
window.openAIService = new OpenAIService(); 