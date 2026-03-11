// AI Prompt Templates
// These are reusable prompts for different AI features

export const SYSTEM_PROMPTS = {
  // Default assistant behavior
  default: `You are a helpful productivity and learning assistant. You help users with:
- Setting and tracking goals
- Managing tasks and habits
- Writing journal entries
- Creating study flashcards
- Focus sessions and time management
- General questions and conversation

Always be encouraging and help users stay motivated.`,

  // Study assistant mode
  study: `You are a knowledgeable study tutor. You help users learn by:
- Explaining concepts clearly
- Creating practice questions
- Breaking down complex topics
- Providing examples and analogies
- Testing understanding with quizzes

Encourage active learning and critical thinking.`,

  // Journal assistant
  journal: `You are a thoughtful journaling companion. You help users:
- Reflect on their day
- Process emotions and thoughts
- Set intentions for tomorrow
- Identify patterns and insights

Be empathetic and reflective in your responses.`,

  // Productivity coach
  productivity: `You are an expert productivity coach. You help users:
- Prioritize tasks effectively
- Manage time wisely
- Build better habits
- Overcome procrastination
- Maintain focus

Give practical, actionable advice.`,
};

// Prompt templates for specific tasks
export const PROMPT_TEMPLATES = {
  // Generate flashcards from text
  generateFlashcards: (topic: string, count: number = 5) => 
    `Generate ${count} flashcards about "${topic}". 

For each flashcard, provide:
- Front: The question or term
- Back: The answer or definition

Format as JSON array:
[
  { "front": "...", "back": "..." },
  ...
]

Make sure questions are clear and answers are accurate.`,

  // Quiz generation
  generateQuiz: (topic: string, count: number = 5) =>
    `Generate ${count} multiple choice quiz questions about "${topic}".

For each question provide:
- question: The question text
- options: Array of 4 options
- correctIndex: Index of correct answer (0-3)

Format as JSON array:
[
  { "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0 },
  ...
]`,

  // Summarize text
  summarize: (text: string, maxLength: number = 100) =>
    `Summarize the following text in no more than ${maxLength} words:

${text}

Provide a concise summary that captures the key points.`,

  // Goal planning
  goalPlan: (goalTitle: string, description: string) =>
    `Help me break down this goal into actionable steps:

Goal: ${goalTitle}
Description: ${description}

Provide:
1. A clear breakdown of 3-5 major milestones
2. For each milestone, 2-3 specific action items
3. Suggested timeline (if applicable)

Be practical and encouraging.`,

  // Habit formation
  habitAdvice: (habit: string) =>
    `Provide advice for building the habit of "${habit}".

Include:
1. Why this habit is beneficial
2. Practical tips to make it stick
3. Common pitfalls to avoid
4. A simple starting routine

Be motivating and practical.`,

  // Journal prompts
  journalPrompt: (mood?: string) => {
    const base = `Here are some reflective questions for your journal entry`;
    const moodPrompts: Record<string, string> = {
      happy: `${base} since you're feeling happy:
- What made you smile today?
- What are you grateful for?
- How can you spread this joy to others?`,
      
      sad: `${base} to help process your emotions:
- What's weighing on your mind?
- What small thing might help you feel better?
- Remember: it's okay to feel sad. What do you need right now?`,
      
      stressed: `${base} to decompress:
- What's causing your stress?
- What's one thing you can control right now?
- How can you take a small break?`,
      
      neutral: `${base}:
- What's on your mind?
- What's one thing you want to accomplish tomorrow?
- What are you learning lately?`,
    };
    
    return moodPrompts[mood?.toLowerCase() || "neutral"] || moodPrompts.neutral;
  },

  // Study explanation
  explainTopic: (topic: string) =>
    `Explain "${topic}" in a clear, easy-to-understand way.

Include:
- A brief overview (2-3 sentences)
- Key concepts (bullet points)
- A simple example or analogy
- If applicable, a common misconception to avoid`,

  // Brainstorming
  brainstorm: (topic: string, count: number = 5) =>
    `Brainstorm ${count} creative ideas or approaches for: ${topic}

List each idea with a brief explanation of why it's valuable.`,
};

// Helper to build conversation context
export function buildSystemMessage(systemType: keyof typeof SYSTEM_PROMPTS = "default"): { role: "model"; parts: string } {
  return {
    role: "model",
    parts: SYSTEM_PROMPTS[systemType],
  };
}
