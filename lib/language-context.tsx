import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Language = "en" | "ms";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = "@gigbook_language";

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    loadLanguage();
  }, []);

  useEffect(() => {
    loadTranslations(language);
  }, [language]);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved === "en" || saved === "ms") {
        setLanguageState(saved);
      }
    } catch (error) {
      console.error("Failed to load language:", error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  };

  const loadTranslations = async (lang: Language) => {
    try {
      const data = lang === "en" 
        ? require("../locales/en.json")
        : require("../locales/ms.json");
      setTranslations(data);
    } catch (error) {
      console.error("Failed to load translations:", error);
    }
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === "string" ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
