"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useClerk, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";


export default function LandingPage() {

  const { openSignUp } = useClerk();

  const handleSignup = (role: "business" | "courier") => {
    localStorage.setItem("onboardingRole", `onboarding-${role}`);
    openSignUp({
      redirectUrl: "/waitlist",
    });
  };

  return (

    <main className="min-h-screen bg-white text-black font-sans">
      {/* Hero Section */}
      <section className="px-6 md:px-12 py-16 text-center md:text-right bg-yellow-100">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-yellow-900">
          דליל אקספרס – הפלטפורמה החכמה לעסקים ושליחים
        </h1>
        <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto md:mx-0">
          פתרון אחד פשוט, יעיל ומותאם אישית לעולם המשלוחים והניהול. התחברו לעסק שלכם או לפורטל השליחים, והתחילו לנהל חכם.
        </p>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <h2 className="text-3xl font-bold text-center text-black mb-10">כל הכלים במקום אחד</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-yellow-100 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2 text-yellow-700">ניהול משלוחים</h3>
            <p className="text-gray-700">מערכת מעקב מתקדמת, עדכונים בלייב ודוחות מותאמים.</p>
          </div>
          <div className="p-6 bg-yellow-100 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2 text-yellow-700">שליחים בשליטה</h3>
            <p className="text-gray-700">ניהול משימות, בדיקת מיקומים וסטטיסטיקות לכל שליח.</p>
          </div>
          <div className="p-6 bg-yellow-100 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2 text-yellow-700">לקוחות מרוצים</h3>
            <p className="text-gray-700">הודעות בזמן אמת, היסטוריה מלאה ותמיכה מהירה.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-16 px-6 md:px-12 text-center md:text-right">
        <h2 className="text-3xl font-bold mb-4">הצטרפו למהפכת המשלוחים</h2>
        <p className="mb-6 text-lg max-w-2xl mx-auto md:mx-0">
          דליל אקספרס משנה את כללי המשחק עבור עסקים ושליחים. עם פלטפורמה אחודה, כל מה שאתם צריכים – במקום אחד.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">

          <div
            onClick={() => handleSignup("business")}
            className="bg-yellow-400 text-black hover:bg-yellow-500 w-full sm:w-auto px-6 py-2 rounded-lg text-center font-medium cursor-pointer"
          >
            פתח עסק
          </div>

          {/* Courier Signup */}
          <div
            onClick={() => handleSignup("courier")}
            className="border bg-white border-black text-black hover:text-yellow-600 w-full sm:w-auto px-6 py-2 rounded-lg text-center font-medium cursor-pointer"
          >
            הרשם לשליח
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-600 text-sm border-t mt-6 bg-white">
        &copy; {new Date().getFullYear()} Daleel Express – כל הזכויות שמורות.
      </footer>
    </main>
  );
}
