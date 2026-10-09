// Section definitions grouping lessons by topic
export interface Section {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Easy' | 'Intermediate';
  lessonIds: string[]; // IDs of lessons in this section
  order: number;
}

export const sections: Section[] = [
  {
    id: 'white-keys',
    title: 'White Keys',
    subtitle: 'Learn the 7 natural notes',
    difficulty: 'Beginner',
    lessonIds: ['1', '2', '3', '4'],
    order: 1,
  },
  {
    id: 'first-songs',
    title: 'First Songs',
    subtitle: 'Play your first melodies',
    difficulty: 'Beginner',
    lessonIds: ['5', '8'],
    order: 2,
  },
  {
    id: 'hands-sharps',
    title: 'Both Hands & Sharps',
    subtitle: 'Expand your technique',
    difficulty: 'Easy',
    lessonIds: ['6', '7', '9', '10'],
    order: 3,
  },
  {
    id: 'black-keys-flats',
    title: 'Black Keys: Flats',
    subtitle: 'The flat side of black keys',
    difficulty: 'Easy',
    lessonIds: ['11', '12', '13', '14'],
    order: 4,
  },
  {
    id: 'left-hand-independence',
    title: 'Left Hand Independence',
    subtitle: 'Bass lines & two-hand coordination',
    difficulty: 'Easy',
    lessonIds: ['15', '16', '17', '18'],
    order: 5,
  },
  {
    id: 'first-chords',
    title: 'Your First Chords',
    subtitle: 'Triads & harmony',
    difficulty: 'Easy',
    lessonIds: ['19', '20', '21', '22'],
    order: 6,
  },
];

// Quiz question types
export type QuestionType = 'multiple-choice' | 'note-identify' | 'concept';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options: string[]; // for multiple-choice
  correctIndex: number;
  timeLimit: number; // seconds
  explanation: string;
}

export interface SectionQuiz {
  sectionId: string;
  questions: QuizQuestion[];
}

export const sectionQuizzes: SectionQuiz[] = [
  {
    sectionId: 'white-keys',
    questions: [
      {
        id: 'w1',
        type: 'multiple-choice',
        question: 'Which key is Middle C?',
        options: ['The white key left of the two black keys near the center', 'The rightmost white key', 'Any black key', 'The white key right of the three black keys'],
        correctIndex: 0,
        timeLimit: 15,
        explanation: 'Middle C is the white key immediately to the left of the pair of two black keys near the middle of the piano.',
      },
      {
        id: 'w2',
        type: 'multiple-choice',
        question: 'What note comes after D in the musical alphabet?',
        options: ['F', 'E', 'C', 'G'],
        correctIndex: 1,
        timeLimit: 10,
        explanation: 'The musical alphabet goes A-B-C-D-E-F-G. After D comes E.',
      },
      {
        id: 'w3',
        type: 'multiple-choice',
        question: 'How many white keys are there in one octave?',
        options: ['5', '6', '7', '8'],
        correctIndex: 2,
        timeLimit: 10,
        explanation: 'There are 7 white keys in an octave: C, D, E, F, G, A, B.',
      },
      {
        id: 'w4',
        type: 'note-identify',
        question: 'Which note is this? (Look at the highlighted key)',
        options: ['C', 'D', 'E', 'F'],
        correctIndex: 2,
        timeLimit: 15,
        explanation: 'E is the third white key in the C major scale, to the right of the two black keys.',
      },
      {
        id: 'w5',
        type: 'multiple-choice',
        question: 'What do we call all the white keys from C to the next C?',
        options: ['A chord', 'A scale', 'A C major scale', 'An arpeggio'],
        correctIndex: 2,
        timeLimit: 15,
        explanation: 'The white keys from C to the next C form the C major scale — the foundation of Western music!',
      },
    ],
  },
  {
    sectionId: 'first-songs',
    questions: [
      {
        id: 's1',
        type: 'multiple-choice',
        question: 'Which composer wrote "Ode to Joy"?',
        options: ['Mozart', 'Bach', 'Beethoven', 'Chopin'],
        correctIndex: 2,
        timeLimit: 15,
        explanation: 'Ode to Joy is from Beethoven\'s 9th Symphony — one of the most famous melodies ever written.',
      },
      {
        id: 's2',
        type: 'multiple-choice',
        question: 'How many different notes does "Twinkle Twinkle Little Star" use in its main melody?',
        options: ['3', '6', '8', '10'],
        correctIndex: 1,
        timeLimit: 15,
        explanation: 'Twinkle Twinkle uses 6 notes: C, D, E, F, G, and A.',
      },
      {
        id: 's3',
        type: 'multiple-choice',
        question: 'What does it mean when notes in a melody move to adjacent keys?',
        options: ['Jumping motion', 'Stepwise motion', 'Random motion', 'Chordal motion'],
        correctIndex: 1,
        timeLimit: 20,
        explanation: 'When a melody moves between neighboring notes, it\'s called stepwise motion — the smoothest way to move.',
      },
      {
        id: 's4',
        type: 'concept',
        question: 'True or False: You need to know all 12 notes before playing your first song.',
        options: ['True', 'False'],
        correctIndex: 1,
        timeLimit: 10,
        explanation: 'You can play songs with just a few notes! Ode to Joy only uses 5 different notes.',
      },
      {
        id: 's5',
        type: 'multiple-choice',
        question: 'Which note pattern sounds "happy" and bright in Western music?',
        options: ['Minor scale', 'Chromatic scale', 'Major scale', 'Pentatonic scale'],
        correctIndex: 2,
        timeLimit: 20,
        explanation: 'The major scale (like C major) is generally perceived as happy and bright in Western music.',
      },
    ],
  },
  {
    sectionId: 'hands-sharps',
    questions: [
      {
        id: 'h1',
        type: 'multiple-choice',
        question: 'What is a sharp (♯) note?',
        options: ['A note played louder', 'A white key played twice', 'The black key to the right of a white key', 'A note held longer'],
        correctIndex: 2,
        timeLimit: 15,
        explanation: 'A sharp raises a note by one semitone — on piano, it\'s the black key immediately to the right.',
      },
      {
        id: 'h2',
        type: 'multiple-choice',
        question: 'C♯ and D♭ are the same key on the piano. What is this called?',
        options: ['Harmonic equivalent', 'Enharmonic equivalent', 'Melodic equivalent', 'Rhythmic equivalent'],
        correctIndex: 1,
        timeLimit: 20,
        explanation: 'When two different note names refer to the same key, they are enharmonic equivalents.',
      },
      {
        id: 'h3',
        type: 'multiple-choice',
        question: 'What should your left hand typically play?',
        options: ['Higher notes than the right hand', 'Lower notes than the right hand', 'The exact same notes', 'Only black keys'],
        correctIndex: 1,
        timeLimit: 10,
        explanation: 'The left hand usually plays lower (bass) notes while the right hand plays higher (treble) notes.',
      },
      {
        id: 'h4',
        type: 'multiple-choice',
        question: 'How many black keys are in one octave?',
        options: ['3', '4', '5', '7'],
        correctIndex: 2,
        timeLimit: 10,
        explanation: 'There are 5 black keys in an octave: C♯, D♯, F♯, G♯, and A♯.',
      },
      {
        id: 'h5',
        type: 'multiple-choice',
        question: 'What is the main benefit of practicing with both hands?',
        options: ['It looks more impressive', 'It builds coordination and independence', 'It makes the piano louder', 'It\'s required for all songs'],
        correctIndex: 1,
        timeLimit: 15,
        explanation: 'Playing with both hands builds coordination and independence — essential skills for more advanced pieces.',
      },
    ],
  },
  {
    sectionId: 'black-keys-flats',
    questions: [
      {
        id: 'f1',
        type: 'multiple-choice',
        question: 'What is a flat (♭) note?',
        options: ['A note played softer', 'The black key to the left of a white key', 'The same as a natural note', 'A white key played twice'],
        correctIndex: 1,
        timeLimit: 15,
        explanation: 'A flat lowers a note by one semitone — on piano, it\'s the black key immediately to the left of a white key.',
      },
      {
        id: 'f2',
        type: 'multiple-choice',
        question: 'Which black key is the same as D♭?',
        options: ['D♯', 'C♯', 'E♭', 'F♯'],
        correctIndex: 1,
        timeLimit: 15,
        explanation: 'D♭ and C♯ are enharmonic equivalents — they are the exact same black key with two different names.',
      },
      {
        id: 'f3',
        type: 'multiple-choice',
        question: 'How many black keys have flat names?',
        options: ['3', '4', '5', '7'],
        correctIndex: 2,
        timeLimit: 10,
        explanation: 'All 5 black keys have flat names: D♭, E♭, G♭, A♭, and B♭.',
      },
      {
        id: 'f4',
        type: 'multiple-choice',
        question: 'Which flat is in the two-black-key group?',
        options: ['G♭', 'A♭', 'E♭', 'B♭'],
        correctIndex: 2,
        timeLimit: 15,
        explanation: 'E♭ (and D♭) are in the two-black-key group. G♭, A♭, and B♭ are in the three-black-key group.',
      },
      {
        id: 'f5',
        type: 'multiple-choice',
        question: 'True or False: Every black key has both a sharp name and a flat name.',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 10,
        explanation: 'Every black key has two names — a sharp name (like C♯) and a flat name (like D♭). Which one you use depends on the musical context!',
      },
    ],
  },
  {
    sectionId: 'left-hand-independence',
    questions: [
      {
        id: 'l1',
        type: 'multiple-choice',
        question: 'Which hand typically plays the lower (bass) notes on a piano?',
        options: ['Right hand', 'Left hand', 'Either hand equally', 'Both hands together'],
        correctIndex: 1,
        timeLimit: 10,
        explanation: 'The left hand usually plays lower notes, providing the bass foundation while the right hand handles melodies.',
      },
      {
        id: 'l2',
        type: 'multiple-choice',
        question: 'What does "hand independence" mean on piano?',
        options: ['Playing with only one hand', 'Each hand playing a different part at the same time', 'Playing the exact same notes with both hands', 'Switching hands between songs'],
        correctIndex: 1,
        timeLimit: 15,
        explanation: 'Hand independence means each hand plays its own part — the left might play bass notes while the right plays the melody.',
      },
      {
        id: 'l3',
        type: 'multiple-choice',
        question: 'What is the distance between Middle C and the C below it called?',
        options: ['A scale', 'An octave', 'A chord', 'A semitone'],
        correctIndex: 1,
        timeLimit: 10,
        explanation: 'An octave is the distance between two notes with the same name — like C3 to C4. They sound similar, just higher or lower.',
      },
      {
        id: 'l4',
        type: 'multiple-choice',
        question: 'True or False: You can only play melodies with your right hand.',
        options: ['True', 'False'],
        correctIndex: 1,
        timeLimit: 10,
        explanation: 'Your left hand can play melodies too! Many pieces have left-hand melodies or both hands trading the tune back and forth.',
      },
      {
        id: 'l5',
        type: 'multiple-choice',
        question: 'Which note is a common bass note to pair with a C major melody?',
        options: ['F♯', 'B♭', 'C (the same note, one octave lower)', 'E♭'],
        correctIndex: 2,
        timeLimit: 15,
        explanation: 'C is the root note of C major — playing it in the bass while the right hand plays a C major melody creates a strong, grounded sound.',
      },
    ],
  },
  {
    sectionId: 'first-chords',
    questions: [
      {
        id: 'c1',
        type: 'multiple-choice',
        question: 'What is a chord?',
        options: ['A single note held for a long time', '3 or more notes played together', 'Playing very fast', 'The black keys only'],
        correctIndex: 1,
        timeLimit: 10,
        explanation: 'A chord is 3 or more notes played together. The simplest chord is a triad — three notes stacked in thirds.',
      },
      {
        id: 'c2',
        type: 'multiple-choice',
        question: 'Which three notes make a C major chord?',
        options: ['C, D, E', 'C, E, G', 'C, F, A', 'C, E, B'],
        correctIndex: 1,
        timeLimit: 15,
        explanation: 'C major is C-E-G — the 1st, 3rd, and 5th notes of the C major scale. Every major chord follows this pattern!',
      },
      {
        id: 'c3',
        type: 'multiple-choice',
        question: 'What are the three most important chords in C major?',
        options: ['C, D, E', 'C, F, G (I, IV, V)', 'A, B, C', 'F, G, A'],
        correctIndex: 1,
        timeLimit: 20,
        explanation: 'C, F, and G are the I, IV, and V chords — together they can accompany thousands of songs in the key of C major!',
      },
      {
        id: 'c4',
        type: 'multiple-choice',
        question: 'How many notes are in a basic triad?',
        options: ['2', '3', '4', '5'],
        correctIndex: 1,
        timeLimit: 10,
        explanation: 'A triad has exactly 3 notes. The word "tri" means three — just like triangle or tricycle!',
      },
      {
        id: 'c5',
        type: 'multiple-choice',
        question: 'What happens when you change from one chord to another in a song?',
        options: ['The song stops', 'The harmony changes, creating emotion and movement', 'Nothing — all chords sound the same', 'The key signature changes'],
        correctIndex: 1,
        timeLimit: 20,
        explanation: 'Chord changes create harmonic movement — the emotional journey of a song. Going from C to F feels different than C to G, and that tension and release is what makes music feel alive!',
      },
    ],
  },
];
