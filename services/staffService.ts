import type { Trainer } from '../types';

const STAFF_STORAGE_KEY = 'maadfitbook-staff';

const INITIAL_TRAINERS: Trainer[] = [
  {
    id: 'staff-01', // Match the ID from authService for linking
    name: 'Alex Ray',
    specialty: 'Certified Strength & Performance Coach',
    imageUrl: 'https://picsum.photos/seed/alex/300/300',
    bio: 'Alex is a certified strength and conditioning specialist with a passion for helping clients achieve their peak performance. His philosophy is built on functional movements and progressive overload.',
    experience: '10+ Years',
    rate: 65.00,
    socials: {
        twitter: 'https://twitter.com/mmadfitbooki',
        instagram: 'https://instagram.com/mmadfitbooki',
        linkedin: 'https://linkedin.com/company/mmadfitbooki'
    }
  },
  {
    id: '2',
    name: 'Jordan Lee',
    specialty: 'Yoga Alliance (E-RYT 500) Instructor',
    imageUrl: 'https://picsum.photos/seed/jordan/300/300',
    bio: 'An experienced 500-hour registered yoga teacher, Jordan specializes in Vinyasa flow and restorative yoga, focusing on mind-body connection and breathwork.',
    experience: '8 Years',
    rate: 55.00,
  },
  {
    id: '3',
    name: 'Casey Smith',
    specialty: 'Mobility & Injury Prevention',
    imageUrl: 'https://picsum.photos/seed/casey/300/300',
    bio: 'Casey focuses on improving everyday movement patterns and preventing injury through targeted mobility work and functional strength training. Great for all fitness levels.',
    experience: '6 Years',
    rate: 50.00,
    socials: {
        instagram: 'https://instagram.com/mmadfitbooki',
    }
  },
  {
    id: '4',
    name: 'Morgan Cross',
    specialty: 'Certified Nutritionist & Pilates Master',
    imageUrl: 'https://picsum.photos/seed/morgan/300/300',
    bio: 'As a certified nutritionist and Master Pilates instructor, Morgan offers a holistic approach to wellness, combining mindful movement with personalized dietary guidance.',
    experience: '12 Years',
    rate: 70.00,
  },
   {
    id: '5',
    name: 'Sam Rivera',
    specialty: 'Certified HIIT & CrossFit L2 Coach',
    imageUrl: 'https://picsum.photos/seed/sam/300/300',
    bio: 'Certified CrossFit Level 2 Trainer, Sam excels in high-intensity interval training, building powerful and resilient athletes through functional fitness.',
    experience: '7 Years',
    rate: 60.00,
  },
  {
    id: '6',
    name: 'Taylor Green',
    specialty: 'Senior Fitness Specialist',
    imageUrl: 'https://picsum.photos/seed/taylor/300/300',
    bio: 'Taylor is dedicated to improving the quality of life for older adults through tailored fitness programs focusing on balance, strength, and mobility.',
    experience: '15 Years',
    rate: 50.00,
  },
  {
    id: '7',
    name: 'Jamie Chen',
    specialty: 'Prenatal & Postnatal Fitness',
    imageUrl: 'https://picsum.photos/seed/jamie/300/300',
    bio: 'As a certified pre/postnatal coach, Jamie provides safe and effective training for mothers, supporting them through every stage of their pregnancy journey.',
    experience: '5 Years',
    rate: 65.00,
  },
  {
    id: '8',
    name: 'Riley Quinn',
    specialty: 'Athletic Performance & Agility',
    imageUrl: 'https://picsum.photos/seed/riley/300/300',
    bio: 'Specializing in sports-specific training, Riley helps athletes enhance their speed, agility, and power to gain a competitive edge.',
    experience: '9 Years',
    rate: 75.00,
  },
  {
    id: '9',
    name: 'Chris Drew',
    specialty: 'Weight Management & Behavioral Coach',
    imageUrl: 'https://picsum.photos/seed/drew/300/300',
    bio: 'Chris helps clients build sustainable healthy habits by focusing on the psychology of weight management, combined with effective, personalized workout plans.',
    experience: '10 Years',
    rate: 60.00,
  },
  {
    id: '10',
    name: 'Devon Miles',
    specialty: 'Boxing & Kickboxing Instructor',
    imageUrl: 'https://picsum.photos/seed/devon/300/300',
    bio: 'A former competitive fighter, Devon brings authentic technique and high-energy conditioning to every session. Learn proper form, build cardiovascular endurance, and relieve stress.',
    experience: '8 Years',
    rate: 70.00,
  },
  {
    id: '11',
    name: 'Kai Roberts',
    specialty: 'Mindfulness & Meditation Coach',
    imageUrl: 'https://picsum.photos/seed/kai/300/300',
    bio: 'Kai guides clients toward mental clarity and stress reduction through mindfulness practices and guided meditation, helping to complement any physical training regimen.',
    experience: '6 Years',
    rate: 45.00,
  },
  {
    id: '12',
    name: 'Jesse Hart',
    specialty: 'Dance Fitness & Zumba Instructor',
    imageUrl: 'https://picsum.photos/seed/jesse/300/300',
    bio: 'Jesse brings infectious energy to every class, making fitness feel like a party. Specializing in Zumba and other dance-based cardio, you\'ll burn calories while having a blast.',
    experience: '7 Years',
    rate: 50.00,
  },
  {
    id: '13',
    name: 'Pat Brooks',
    specialty: 'Aquatic Fitness Specialist',
    imageUrl: 'https://picsum.photos/seed/pat/300/300',
    bio: 'Pat provides low-impact, high-resistance workouts in the pool. Ideal for joint-friendly cardio, rehabilitation, and building strength in a supportive aquatic environment.',
    experience: '11 Years',
    rate: 55.00,
  }
];

const initializeTrainers = (): Trainer[] => {
  try {
    const storedTrainers = localStorage.getItem(STAFF_STORAGE_KEY);
    if (storedTrainers) {
      return JSON.parse(storedTrainers);
    }
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(INITIAL_TRAINERS));
    return INITIAL_TRAINERS;
  } catch (error) {
    console.error("Could not access staff from localStorage", error);
    return INITIAL_TRAINERS;
  }
};

export const getTrainers = (): Trainer[] => {
  return initializeTrainers();
};

export const saveTrainers = (trainers: Trainer[]): void => {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(trainers));
  } catch (error) {
    console.error("Could not save staff to localStorage", error);
  }
};

export const addTrainer = (trainerData: Omit<Trainer, 'id'>, id?: string): void => {
  const trainers = getTrainers();
  const newTrainer: Trainer = {
    ...trainerData,
    id: id || Date.now().toString(),
  };
  saveTrainers([...trainers, newTrainer]);
};

export const updateTrainer = (updatedTrainer: Trainer): void => {
  const trainers = getTrainers();
  const updatedTrainers = trainers.map(trainer =>
    trainer.id === updatedTrainer.id ? updatedTrainer : trainer
  );
  saveTrainers(updatedTrainers);
};

export const deleteTrainer = (trainerId: string): void => {
  const trainers = getTrainers();
  const updatedTrainers = trainers.filter(trainer => trainer.id !== trainerId);
  saveTrainers(updatedTrainers);
};