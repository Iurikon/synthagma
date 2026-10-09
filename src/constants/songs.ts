export interface Song {
  id: string;
  title: string;
  composer: string;
  difficulty: 'Beginner' | 'Easy' | 'Intermediate';
  xp: number;
  description: string;
  notes: string[]; // e.g. ['C4', 'D4', 'E4', ...]
  requiredLessons: string[]; // lesson IDs needed to unlock
}

export const songs: Song[] = [
  {
    id: '1',
    title: 'Ode to Joy',
    composer: 'Ludwig van Beethoven',
    difficulty: 'Beginner',
    xp: 100,
    description: 'Beethoven\'s triumphant melody from his 9th Symphony. Uses only 5 notes.',
    notes: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4',
            'E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'D4', 'C4', 'C4'],
    requiredLessons: ['5'],
  },
  {
    id: '2',
    title: 'Twinkle Twinkle Little Star',
    composer: 'Traditional',
    difficulty: 'Beginner',
    xp: 120,
    description: 'The classic nursery rhyme. Great practice for stepwise motion.',
    notes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4',
            'G4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'G4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4',
            'C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4'],
    requiredLessons: ['8'],
  },
  {
    id: '3',
    title: 'Mary Had a Little Lamb',
    composer: 'Traditional',
    difficulty: 'Beginner',
    xp: 150,
    description: 'A beloved children\'s song that introduces F♯.',
    notes: ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', 'D4', 'D4', 'D4', 'E4', 'G4', 'G4',
            'E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', 'E4', 'D4', 'D4', 'E4', 'D4', 'C4'],
    requiredLessons: ['10'],
  },
  {
    id: '4',
    title: 'Hot Cross Buns',
    composer: 'Traditional',
    difficulty: 'Beginner',
    xp: 80,
    description: 'The simplest song on piano — only 3 notes!',
    notes: ['E4', 'D4', 'C4', 'E4', 'D4', 'C4', 'C4', 'C4', 'C4', 'C4', 'D4', 'D4', 'D4', 'D4', 'E4', 'D4', 'C4'],
    requiredLessons: ['2'],
  },
  {
    id: '5',
    title: 'Jingle Bells',
    composer: 'James Lord Pierpont',
    difficulty: 'Easy',
    xp: 180,
    description: 'The holiday classic! Uses notes from E to G with some fun rhythmic patterns.',
    notes: ['E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'G4', 'C4', 'D4', 'E4',
            'F4', 'F4', 'F4', 'F4', 'F4', 'E4', 'E4', 'E4', 'E4', 'D4', 'D4', 'E4', 'D4', 'G4',
            'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'G4', 'C4', 'D4', 'E4',
            'F4', 'F4', 'F4', 'F4', 'F4', 'E4', 'E4', 'E4', 'G4', 'G4', 'F4', 'D4', 'C4'],
    requiredLessons: ['7'],
  },
  {
    id: '6',
    title: 'Happy Birthday',
    composer: 'Traditional',
    difficulty: 'Easy',
    xp: 200,
    description: 'Everyone\'s favorite celebration song. A great test of your note-reading skills.',
    notes: ['D4', 'D4', 'E4', 'D4', 'G4', 'F4', 'D4', 'D4', 'E4', 'D4', 'A4', 'G4',
            'D4', 'D4', 'D5', 'B4', 'G4', 'F4', 'E4', 'C5', 'C5', 'B4', 'G4', 'A4', 'G4'],
    requiredLessons: ['8'],
  },
];
