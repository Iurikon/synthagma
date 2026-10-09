export type MessageTrigger =
  | "lesson_start"
  | "note_correct"
  | "note_wrong"
  | "lesson_complete"
  | "lesson_perfect"
  | "streak_milestone"
  | "idle_encouragement"
  | "first_lesson"
  | "comeback"
  | "general_tip";

export interface MascotMessage {
  text: string;
  emoji?: string;
duration?: number;
}

const messages: Record<MessageTrigger, MascotMessage[]> = {
  lesson_start: [
    { text: "Let's make some music! 🎵", emoji: "🎹" },
    { text: "You've got this! I believe in you!", emoji: "💪" },
    { text: "Ready to rock? Let's go!", emoji: "🎸" },
    { text: "Time to shine on those keys!", emoji: "✨" },
    { text: "I love watching you play!", emoji: "💜" },
  ],
  note_correct: [
    { text: "Perfect note! 🎯", emoji: "✅", duration: 1500 },
    { text: "Nailed it!", emoji: "🎯", duration: 1500 },
    { text: "Beautiful!", emoji: "👏", duration: 1500 },
    { text: "That's the one!", emoji: "⭐", duration: 1500 },
    { text: "You're a natural!", emoji: "🌟", duration: 1500 },
    { text: "Sounding great!", emoji: "🎶", duration: 1500 },
  ],
  note_wrong: [
    { text: "Almost! Try again.", emoji: "🤏", duration: 2000 },
    { text: "Close! Listen carefully.", emoji: "👂", duration: 2000 },
    { text: "Don't give up! You'll get it.", emoji: "💜", duration: 2000 },
    { text: "Keep trying — practice makes perfect!", emoji: "🔄", duration: 2500 },
  ],
  lesson_complete: [
    { text: "Amazing work! You crushed it!", emoji: "🎉" },
    { text: "Lesson complete! You're getting better every day!", emoji: "📈" },
    { text: "Way to go, maestro!", emoji: "🎼" },
    { text: "Another one done! So proud of you!", emoji: "🥳" },
  ],
  lesson_perfect: [
    { text: "PERFECT SCORE! You're incredible!", emoji: "🏆", duration: 4000 },
    { text: "Flawless! Zero mistakes! Legendary!", emoji: "👑", duration: 4000 },
    { text: "Not a single wrong note! Wow!", emoji: "💎", duration: 4000 },
  ],
  streak_milestone: [
    { text: "🔥 {streak} day streak! You're on fire!", emoji: "🔥" },
    { text: "Day {streak} of practice! Consistency is key!", emoji: "🗓️" },
    { text: "Your {streak}-day streak is impressive!", emoji: "⚡" },
  ],
  idle_encouragement: [
    { text: "Come play a tune! I miss the music.", emoji: "🎵" },
    { text: "Your piano is waiting for you!", emoji: "🎹" },
    { text: "Just 5 minutes of practice makes a difference!", emoji: "⏱️" },
  ],
  first_lesson: [
    { text: "Hi! I'm YoMama the Learning Llama! Let's learn piano together!", emoji: "🦙", duration: 5000 },
    { text: "Welcome to Synthagma! Ready for your first note?", emoji: "🎹", duration: 4000 },
  ],
  comeback: [
    { text: "Welcome back! Ready to keep learning?", emoji: "👋" },
    { text: "Missed you! Let's pick up where we left off.", emoji: "💜" },
  ],
  general_tip: [
    { text: "Tip: Keep your fingers curved and relaxed!", emoji: "✋" },
    { text: "Tip: Practice slowly at first, then build speed.", emoji: "🐢" },
    { text: "Tip: Try to play without looking at your hands!", emoji: "🙈" },
    { text: "Tip: Consistent daily practice beats cramming!", emoji: "📅" },
    { text: "Tip: Listen to the note before you play it.", emoji: "👂" },
  ],
};

export function getRandomMessage(
  trigger: MessageTrigger,
  vars?: Record<string, string>,
): MascotMessage {
  const pool = messages[trigger];
  if (!pool || pool.length === 0) {
    return { text: "You're doing great! 💜", emoji: "🦙" };
  }
  const msg = pool[Math.floor(Math.random() * pool.length)];
  let text = msg.text;
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      text = text.replace(`{${key}}`, value);
    }
  }
  return { ...msg, text };
}

export default messages;
