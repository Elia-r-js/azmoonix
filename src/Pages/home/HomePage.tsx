
import { Link } from "react-router-dom";
import logoHome from "../../../public/assests/pic/logo2.png"

export default function ProfessorHome() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-blue-500 to-white flex flex-col items-center px-4">

      {/* Logo */}
      <div className="mt-20 flex h-40 w-80 items-center justify-center">
        <img
          src="../../../public/assests/pic/logo2.png"
          alt="azmoonx"
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Description */}
      <p className="mt-8 text-center text-lg text-slate-700 font-vazirMatn " >
      هدف ما فراهم کردن محیطی امن، مدرن و کاربرپسند برای یادگیری و ارزیابی بهتر است؛<br/> از اینکه آزمون‌ایکس را برای برگزاری آزمون‌های خود انتخاب کرده‌اید سپاسگزاریم.<br/> امیدواریم در کنار شما تجربه‌ای آسان، موفق و دلنشین بسازیم؛ به خانواده آزمون‌ایکس خوش آمدید!
      </p>

      {/* Buttons */}
      <div className="mt-32 flex flex-col sm:flex-row items-center gap-6">

        <Link
          to="/professor/exams/create"
          className="flex h-16 w-52 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg transition hover:bg-blue-700 hover:-translate-y-1"
        >
          ایجاد آزمون
        </Link>

        <Link
          to="/professor/exams"
          className="flex h-16 w-52 items-center justify-center rounded-xl border-2 border-blue-600 bg-white text-lg font-bold text-blue-700 shadow-lg transition hover:bg-blue-50 hover:-translate-y-1"
        >
          آزمون‌های من
        </Link>

      </div>
    </main>
  );
}
