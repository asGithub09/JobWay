"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Globe2,
  Languages,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { Container } from "@/components/shared/container";

type Language = {
  id: string;
  name: string;
  nativeName: string;
  shortName: string;
};

const LANGUAGES: Language[] = [
  {
    id: "english",
    name: "English",
    nativeName: "English",
    shortName: "EN",
  },
  {
    id: "hindi",
    name: "Hindi",
    nativeName: "हिन्दी",
    shortName: "हि",
  },
  {
    id: "bengali",
    name: "Bengali",
    nativeName: "বাংলা",
    shortName: "বা",
  },
  {
    id: "marathi",
    name: "Marathi",
    nativeName: "मराठी",
    shortName: "म",
  },
  {
    id: "tamil",
    name: "Tamil",
    nativeName: "தமிழ்",
    shortName: "த",
  },
  {
    id: "telugu",
    name: "Telugu",
    nativeName: "తెలుగు",
    shortName: "తె",
  },
  {
    id: "gujarati",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    shortName: "ગુ",
  },
  {
    id: "kannada",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    shortName: "ಕ",
  },
  {
    id: "malayalam",
    name: "Malayalam",
    nativeName: "മലയാളം",
    shortName: "മ",
  },
  {
    id: "punjabi",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    shortName: "ਪੰ",
  },
  {
    id: "odia",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    shortName: "ଓ",
  },
  {
    id: "assamese",
    name: "Assamese",
    nativeName: "অসমীয়া",
    shortName: "অ",
  },
  {
    id: "urdu",
    name: "Urdu",
    nativeName: "اردو",
    shortName: "ار",
  },
];

const LANGUAGE_CONTENT: Record<
  string,
  {
    headline: string;
    description: string;
  }
> = {
  english: {
    headline: "Learn in the language you're comfortable with",
    description:
      "Choose your preferred language and make your preparation easier to understand, follow and revise.",
  },

  hindi: {
    headline: "अपनी पसंदीदा भाषा में तैयारी करें",
    description:
      "हिंदी में courses, practice और study resources के साथ अपनी परीक्षा की तैयारी को आसान बनाएं।",
  },

  bengali: {
    headline: "আপনার পছন্দের ভাষায় প্রস্তুতি নিন",
    description:
      "বাংলায় শেখা, অনুশীলন এবং স্টাডি রিসোর্সের মাধ্যমে আপনার পরীক্ষার প্রস্তুতি আরও সহজ করুন।",
  },

  marathi: {
    headline: "तुमच्या सोयीच्या भाषेत शिका",
    description:
      "मराठीत अभ्यासक्रम, सराव आणि अभ्यास साहित्याच्या मदतीने तुमची परीक्षेची तयारी अधिक सोपी करा.",
  },

  tamil: {
    headline: "உங்களுக்கு வசதியான மொழியில் கற்றுக்கொள்ளுங்கள்",
    description:
      "தமிழில் கற்றல், பயிற்சி மற்றும் படிப்பு வளங்களுடன் உங்கள் தேர்வுத் தயாரிப்பை எளிதாக்குங்கள்.",
  },

  telugu: {
    headline: "మీకు అనుకూలమైన భాషలో నేర్చుకోండి",
    description:
      "తెలుగులో కోర్సులు, ప్రాక్టీస్ మరియు స్టడీ మెటీరియల్‌తో మీ పరీక్షా సిద్ధతను సులభతరం చేసుకోండి.",
  },

  gujarati: {
    headline: "તમને અનુકૂળ ભાષામાં શીખો",
    description:
      "ગુજરાતીમાં અભ્યાસક્રમો, પ્રેક્ટિસ અને સ્ટડી રિસોર્સ સાથે તમારી પરીક્ષાની તૈયારી સરળ બનાવો.",
  },

  kannada: {
    headline: "ನಿಮಗೆ ಅನುಕೂಲವಾದ ಭಾಷೆಯಲ್ಲಿ ಕಲಿಯಿರಿ",
    description:
      "ಕನ್ನಡದಲ್ಲಿ ಕೋರ್ಸ್‌ಗಳು, ಅಭ್ಯಾಸ ಮತ್ತು ಅಧ್ಯಯನ ಸಾಮಗ್ರಿಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಪರೀಕ್ಷಾ ತಯಾರಿಯನ್ನು ಸುಲಭಗೊಳಿಸಿ.",
  },

  malayalam: {
    headline: "നിങ്ങൾക്ക് സൗകര്യപ്രദമായ ഭാഷയിൽ പഠിക്കൂ",
    description:
      "മലയാളത്തിലുള്ള കോഴ്സുകൾ, പരിശീലനം, പഠന സാമഗ്രികൾ എന്നിവ ഉപയോഗിച്ച് നിങ്ങളുടെ പരീക്ഷാ തയ്യാറെടുപ്പ് എളുപ്പമാക്കൂ.",
  },

  punjabi: {
    headline: "ਆਪਣੀ ਪਸੰਦ ਦੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਿੱਖੋ",
    description:
      "ਪੰਜਾਬੀ ਵਿੱਚ ਕੋਰਸਾਂ, ਅਭਿਆਸ ਅਤੇ ਅਧਿਐਨ ਸਮੱਗਰੀ ਨਾਲ ਆਪਣੀ ਪ੍ਰੀਖਿਆ ਦੀ ਤਿਆਰੀ ਆਸਾਨ ਬਣਾਓ।",
  },

  odia: {
    headline: "ଆପଣଙ୍କ ପସନ୍ଦର ଭାଷାରେ ଶିଖନ୍ତୁ",
    description:
      "ଓଡ଼ିଆରେ ପାଠ୍ୟକ୍ରମ, ଅଭ୍ୟାସ ଏବଂ ଅଧ୍ୟୟନ ସାମଗ୍ରୀ ସହିତ ଆପଣଙ୍କ ପରୀକ୍ଷା ପ୍ରସ୍ତୁତିକୁ ସହଜ କରନ୍ତୁ।",
  },

  assamese: {
    headline: "আপোনাৰ সুবিধাজনক ভাষাত শিকক",
    description:
      "অসমীয়াত পাঠ্যক্ৰম, অনুশীলন আৰু অধ্যয়ন সামগ্ৰীৰ সৈতে আপোনাৰ পৰীক্ষাৰ প্ৰস্তুতি সহজ কৰক।",
  },

  urdu: {
    headline: "اپنی پسندیدہ زبان میں سیکھیں",
    description:
      "اردو میں کورسز، پریکٹس اور اسٹڈی میٹریل کے ساتھ اپنی امتحانی تیاری کو آسان بنائیں۔",
  },
};

const LEARNING_FEATURES = [
  "Courses",
  "Test Series",
  "Study Material",
];

export function VernacularBanner() {
  const [activeLanguage, setActiveLanguage] = useState("english");

  const selectedLanguage =
    LANGUAGES.find((language) => language.id === activeLanguage) ??
    LANGUAGES[0];

  const content =
    LANGUAGE_CONTENT[activeLanguage] ?? LANGUAGE_CONTENT.english;

  return (
    <section
      aria-labelledby="vernacular-heading"
      className="bg-white py-14 sm:py-16 lg:py-[72px]"
    >
      <Container size="wide">
        <div className="relative overflow-hidden rounded-[24px] bg-slate-950 shadow-[0_20px_55px_rgba(15,23,42,0.12)]">
          {/* Decorative background */}
          <div
            className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-red-600/20 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-red-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
            aria-hidden="true"
          />

          <div className="relative grid lg:grid-cols-[0.9fr_1.1fr]">
            {/* Content */}
            <div className="flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-11 lg:px-14 lg:py-14">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-red-300">
                <Languages className="h-3.5 w-3.5" aria-hidden="true" />
                Learn your way
              </div>

              <h2
                id="vernacular-heading"
                className="mt-5 max-w-xl text-3xl font-black leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[2.65rem]"
              >
                {content.headline}
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                {content.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {LEARNING_FEATURES.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300"
                  >
                    <Check
                      className="h-4 w-4 text-red-400"
                      aria-hidden="true"
                    />
                    {item}
                  </div>
                ))}
              </div>

              <Link
                href={`/courses?language=${activeLanguage}`}
                className="mt-8 inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-[#E13032] px-5 text-xs font-black text-white shadow-[0_10px_25px_rgba(225,48,50,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                Explore {selectedLanguage.name} learning
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Language selector */}
            <div className="relative border-t border-white/10 px-5 py-8 sm:px-8 sm:py-10 lg:border-l lg:border-t-0 lg:px-10 lg:py-12">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-300">
                    Select language
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    Choose your preferred language
                  </p>
                </div>

                <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-red-300 sm:flex">
                  <Globe2 className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>

              <div
                role="tablist"
                aria-label="Learning languages"
                className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3"
              >
                {LANGUAGES.map((language) => {
                  const isActive = language.id === activeLanguage;

                  return (
                    <button
                      key={language.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Select ${language.name}`}
                      onClick={() => setActiveLanguage(language.id)}
                      className={`group relative flex min-h-[68px] items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 ${
                        isActive
                          ? "border-red-400/60 bg-[#E13032] shadow-[0_10px_25px_rgba(225,48,50,0.22)]"
                          : "border-white/10 bg-white/[0.04] hover:border-red-400/30 hover:bg-white/[0.08]"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-white/10 text-slate-300 group-hover:text-white"
                        }`}
                      >
                        {language.shortName}
                      </span>

                      <span className="min-w-0">
                        <span
                          className={`block truncate text-xs font-black ${
                            isActive ? "text-white" : "text-slate-200"
                          }`}
                        >
                          {language.nativeName}
                        </span>

                        <span
                          className={`mt-0.5 block truncate text-[9px] font-semibold ${
                            isActive ? "text-white/70" : "text-slate-500"
                          }`}
                        >
                          {language.name}
                        </span>
                      </span>

                      {isActive ? (
                        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#E13032]">
                          <Check
                            className="h-2.5 w-2.5"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Selected language */}
              <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Sparkles
                    className="h-4 w-4 shrink-0 text-red-300"
                    aria-hidden="true"
                  />

                  <span className="text-xs font-bold text-slate-300">
                    Selected:
                  </span>

                  <span className="truncate text-xs font-black text-white">
                    {selectedLanguage.nativeName}
                  </span>
                </div>

                <ChevronRight
                  className="h-4 w-4 shrink-0 text-slate-500"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}