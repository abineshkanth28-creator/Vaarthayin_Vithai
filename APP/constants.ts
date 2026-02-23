
import { Message } from './types';

export const TAMIL_STRINGS = {
  appTitle: "வார்த்தையின் விதை",
  home: "முகப்பு",
  messages: "செய்திகள்",
  nowPlaying: "தற்போது ஒலிப்பது",
  play: "இயக்கு",
  pause: "நிறுத்து",
  speed: "வேகம்",
  dailyVerse: "இன்றைய இறைவசனம்",
  loading: "ஏற்றப்படுகிறது...",
  noMessages: "செய்திகள் எதுவும் இல்லை",
  back: "பின்செல்",
  forward: "முன்னோக்கி",
  backward: "பின்னோக்கி",
  share: "பகிர்",
  next: "அடுத்தது",
  previous: "முந்தையது",
  searchPlaceholder: "தேடுங்கள் (தலைப்பு, தேதி...)",
  menu: {
    home: "முகப்பு",
    about: "எங்களைப் பற்றி",
    contact: "தொடர்புக்கு",
    prayer: "ஜெப விண்ணப்பம்",
    website: "இணையதளம்"
  },
  admin: "நிர்வாகம்",
  login: "உள்நுழை",
  logout: "வெளியேறு",
  password: "கடவுச்சொல்",
  save: "சேமி",
  delete: "நீக்கு",
  edit: "திருத்து",
  new: "புதிய",
  title: "தலைப்பு",
  subtitle: "உப தலைப்பு",
  date: "தேதி",
  duration: "கால அளவு",
  audioLink: "ஆடியோ லிங்க்",
  thumbnailLink: "தம்ப்நெயில் லிங்க்",
  linkCopied: "லிங்க் நகலெடுக்கப்பட்டது!",
  results: "முடிவுகள்",
  noMessageSelected: "தேர்ந்தெடுக்கப்பட்ட செய்தி இல்லை",
  subtitles: "உப தலைப்புகள்",
  enterPassword: "தொடர கடவுச்சொல்லை உள்ளிடவும்",
  verifying: "சரிபார்க்கப்படுகிறது...",
  invalidPassword: "தவறான கடவுச்சொல்",
  loginFailed: "உள்நுழைவதில் பிழை",
  errorSaving: "சேமிப்பதில் பிழை",
  errorOccurred: "பிழை ஏற்பட்டது",
  confirmDelete: "நிச்சயமாக நீக்க வேண்டுமா?",
  errorDeleting: "நீக்குவதில் பிழை",
  addMessage: "செய்தியைச் சேர்",
  editMessage: "செய்தியைத் திருத்து",
  jesusLovesYou: "நீங்கள் ஆசீர்வதிக்கப்பட்டவர்கள்",
  changeLanguage: "மொழியை மாற்றவும்"
};

export const ENGLISH_STRINGS = {
  appTitle: "Vaarthayin vithai",
  home: "Home",
  messages: "Messages",
  nowPlaying: "Now Playing",
  play: "Play",
  pause: "Pause",
  speed: "Speed",
  dailyVerse: "Daily Verse",
  loading: "Loading...",
  noMessages: "No messages found",
  back: "Back",
  forward: "Forward",
  backward: "Backward",
  share: "Share",
  next: "Next",
  previous: "Previous",
  searchPlaceholder: "Search (title, date...)",
  menu: {
    home: "Home",
    about: "About Us",
    contact: "Contact",
    prayer: "Prayer Request",
    website: "Website"
  },
  admin: "Admin",
  login: "Login",
  logout: "Logout",
  password: "Password",
  save: "Save",
  delete: "Delete",
  edit: "Edit",
  new: "New",
  title: "Title",
  subtitle: "Subtitle",
  date: "Date",
  duration: "Duration",
  audioLink: "Audio Link",
  thumbnailLink: "Thumbnail Link",
  linkCopied: "Link copied!",
  results: "results",
  noMessageSelected: "No message selected",
  subtitles: "Subtitles",
  enterPassword: "Enter password to continue",
  verifying: "Verifying...",
  invalidPassword: "Invalid password",
  loginFailed: "Login failed",
  errorSaving: "Error saving",
  errorOccurred: "An error occurred",
  confirmDelete: "Are you sure you want to delete?",
  errorDeleting: "Error deleting",
  addMessage: "Add Message",
  editMessage: "Edit Message",
  jesusLovesYou: "You are Blessed",
  changeLanguage: "Change Language"
};

export const STRINGS = {
  ta: TAMIL_STRINGS,
  en: ENGLISH_STRINGS
};

// Example Google Drive Direct Link Format:
// https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
export const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    title: "ஞாயிறு ஆராதனை - விசுவாசத்தின் மேன்மை",
    date: "2024-05-12",
    duration: "45:20",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Mock Audio
    thumbnail: "https://picsum.photos/seed/church1/400/400",
    subMessages: [
      {
        id: "1-1",
        title: "பகுதி 1: விசுவாசம் என்றால் என்ன?",
        date: "2024-05-12",
        duration: "22:10",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        thumbnail: "https://picsum.photos/seed/part1/400/400",
      },
      {
        id: "1-2",
        title: "பகுதி 2: விசுவாசத்தின் கிரியைகள்",
        date: "2024-05-12",
        duration: "23:10",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        thumbnail: "https://picsum.photos/seed/part2/400/400",
      }
    ]
  },
  {
    id: "2",
    title: "குடும்பக் கூட்டம் - அன்பின் முக்கியத்துவம்",
    date: "2024-05-10",
    duration: "38:15",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    thumbnail: "https://picsum.photos/seed/church2/400/400",
  },
  {
    id: "3",
    title: "வேதாகம படிப்பு - பவுலின் கடிதங்கள்",
    subtitle: "ரோமர் நிருபம் ஆழமான ஆய்வு",
    date: "2024-05-08",
    duration: "52:40",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    thumbnail: "https://picsum.photos/seed/church3/400/400",
    subMessages: [
      {
        id: "3-1",
        title: "அதிகாரம் 1: அறிமுகம்",
        date: "2024-05-08",
        duration: "26:20",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        thumbnail: "https://picsum.photos/seed/romans1/400/400",
      }
    ]
  }
];
