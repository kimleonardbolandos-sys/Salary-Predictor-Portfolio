import React, { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  Code,
  TrendingUp,
  Award,
  Zap,
  BarChart3,
  RotateCcw,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Loader2,
} from "lucide-react";

const App = () => {
  // --- Tailwind Injector for CodeSandbox ---
  // This effect ensures styles load even if you didn't set up Tailwind manually
  useEffect(() => {
    const scriptId = "tailwind-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      script.id = scriptId;
      document.head.appendChild(script);
    }
  }, []);

  // Logic derived from the Python Data Analysis
  const BASE_SALARY = 65000;
  const EUR_TO_PHP = 64; // Approximate conversion rate

  const coefficients = {
    seniority: {
      Intern: 0,
      Junior: 15000,
      "Mid-Level": 35000,
      Senior: 65000,
      Lead: 90000,
      Director: 130000,
    },
    location: {
      "United States": 35000,
      "Europe (Western)": 5000,
      Asia: -10000,
      Remote: 10000,
    },
    industry: {
      Retail: 25000,
      Finance: 20000,
      Technology: 15000,
      Healthcare: 12000,
      Energy: 10000,
      Manufacturing: 5000,
      Education: -5000,
    },
    skills: {
      Scala: 15000,
      Spark: 10000,
      AWS: 8000,
      TensorFlow: 8000,
      PyTorch: 8000,
      SQL: 5000,
      Python: 3000,
      "Machine Learning": 7000,
      Kubernetes: 9000,
    },
  };

  const [formData, setFormData] = useState({
    seniority: "Mid-Level",
    location: "United States",
    industry: "Technology",
    skills: [],
  });

  const [prediction, setPrediction] = useState(0);
  const [breakdown, setBreakdown] = useState([]);
  const [animateTotal, setAnimateTotal] = useState(false);

  // AI State
  const [aiAdvice, setAiAdvice] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [adviceType, setAdviceType] = useState(null); // 'negotiation' | 'roadmap'

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  useEffect(() => {
    calculateSalary();
    // Trigger animation on change
    setAnimateTotal(true);
    const timer = setTimeout(() => setAnimateTotal(false), 300);
    // Reset AI advice when inputs change dramatically, or keep it?
    // Let's keep it but maybe user wants to regenerate.
    return () => clearTimeout(timer);
  }, [formData]);

  const calculateSalary = () => {
    let total = BASE_SALARY;
    const details = [];

    // Base
    details.push({
      label: "Base Salary",
      amount: BASE_SALARY,
      color: "bg-slate-200",
    });

    // Seniority
    const seniorityBonus = coefficients.seniority[formData.seniority] || 0;
    total += seniorityBonus;
    details.push({
      label: `Seniority: ${formData.seniority}`,
      amount: seniorityBonus,
      color: "bg-blue-200",
    });

    // Location
    const locationBonus = coefficients.location[formData.location] || 0;
    total += locationBonus;
    details.push({
      label: `Location: ${formData.location}`,
      amount: locationBonus,
      color: "bg-emerald-200",
    });

    // Industry
    const industryBonus = coefficients.industry[formData.industry] || 0;
    total += industryBonus;
    details.push({
      label: `Industry: ${formData.industry}`,
      amount: industryBonus,
      color: "bg-purple-200",
    });

    // Skills
    let skillBonusTotal = 0;
    formData.skills.forEach((skill) => {
      const bonus = coefficients.skills[skill] || 0;
      skillBonusTotal += bonus;
    });
    total += skillBonusTotal;
    if (skillBonusTotal > 0) {
      details.push({
        label: `Skills Bonus (${formData.skills.length})`,
        amount: skillBonusTotal,
        color: "bg-amber-200",
      });
    }

    setPrediction(total);
    setBreakdown(details);
  };

  const handleReset = () => {
    setFormData({
      seniority: "Mid-Level",
      location: "United States",
      industry: "Technology",
      skills: [],
    });
    setAiAdvice("");
    setAdviceType(null);
  };

  const fetchGeminiAdvice = async (type) => {
    setAiLoading(true);
    setAdviceType(type);
    setAiAdvice("");

    const apiKey = ""; // API key injected by environment

    let prompt = "";
    if (type === "negotiation") {
      prompt = `Act as an expert salary negotiation coach. I am a ${
        formData.seniority
      } level professional in the ${formData.industry} industry based in ${
        formData.location
      }. My estimated market salary is €${prediction.toLocaleString()}. My key skills are: ${
        formData.skills.length > 0
          ? formData.skills.join(", ")
          : "general data science skills"
      }. 
      
      Write a brief, professional, and persuasive 3-point script I can use in an interview or email to negotiate for a 10-15% higher salary. Focus on the value of my specific seniority and skills. Keep it concise.`;
    } else {
      prompt = `Act as a technical career mentor for a Data Scientist. I am currently at the ${
        formData.seniority
      } level in the ${formData.industry} industry. My current skills are: ${
        formData.skills.length > 0
          ? formData.skills.join(", ")
          : "basic proficiency"
      }.
      
      Identify 3 specific, high-impact technologies, concepts, or project types I should master next to significantly increase my salary and move to the next career level. Explain why for each. Keep it actionable and brief.`;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I couldn't generate advice at this moment. Please try again.";
      setAiAdvice(text);
    } catch (error) {
      console.error("AI Error:", error);
      setAiAdvice(
        "Sorry, I'm having trouble connecting to the career coach right now."
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8 font-sans text-slate-800 flex items-center justify-center">
      {/* Abstract Background Shapes */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10 grid lg:grid-cols-12 gap-6">
        {/* Main Card */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-center sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-lg shadow-lg shadow-indigo-200">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  DataWorth
                </h1>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Thinking Chem Salary Predictor
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
              title="Reset Form"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-8 space-y-8 flex-grow">
            {/* Grid for Selects */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-500" /> Seniority Level
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer hover:bg-white"
                    value={formData.seniority}
                    onChange={(e) =>
                      setFormData({ ...formData, seniority: e.target.value })
                    }
                  >
                    {Object.keys(coefficients.seniority).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" /> Location
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer hover:bg-white"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  >
                    {Object.keys(coefficients.location).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-500" /> Industry
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all cursor-pointer hover:bg-white"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                  >
                    {Object.keys(coefficients.industry).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-500" /> High-Impact Skills
                <span className="text-xs font-normal text-slate-400 ml-auto">
                  Select all that apply
                </span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {Object.keys(coefficients.skills).map((skill) => {
                  const isActive = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border transform active:scale-95 ${
                        isActive
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-600"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Results */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          {/* Main Result Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-1 shadow-2xl transform transition-transform hover:scale-[1.01]">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-white relative overflow-hidden">
              {/* Decorative circle */}
              <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

              <h2 className="text-indigo-100 font-medium mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Estimated Annual Salary
              </h2>

              <div
                className={`text-5xl md:text-6xl font-bold tracking-tight mt-4 mb-2 transition-transform duration-300 ${
                  animateTotal ? "scale-105" : "scale-100"
                }`}
              >
                €{prediction.toLocaleString()}
              </div>

              <div className="text-xl text-indigo-200 font-medium mb-4">
                ≈ ₱{(prediction * EUR_TO_PHP).toLocaleString()}
              </div>

              <div className="flex items-center gap-2 text-indigo-100 text-sm bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                <span>AI Confidence Score: 85%</span>
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
              Salary Composition
            </h3>

            <div className="space-y-3">
              {breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="group flex items-center justify-between text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ring-2 ring-white shadow-sm ${item.color}`}
                    ></span>
                    <span className="text-slate-600 font-medium">
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`font-semibold font-mono ${
                      item.amount < 0 ? "text-red-500" : "text-slate-800"
                    }`}
                  >
                    {item.amount >= 0 ? "+" : ""}€
                    {Math.abs(item.amount).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  Total Estimate
                </span>
                <div className="text-right">
                  <div className="font-bold text-indigo-600 text-lg">
                    €{prediction.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    ≈ ₱{(prediction * EUR_TO_PHP).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Career Coach Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 flex flex-col gap-4 flex-grow">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-100" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                AI Career Coach
              </h3>
            </div>

            {!adviceType ? (
              <div className="flex flex-col gap-3 py-2">
                <p className="text-sm text-slate-500 mb-1">
                  Get personalized advice powered by Gemini to boost your
                  career.
                </p>
                <button
                  onClick={() => fetchGeminiAdvice("negotiation")}
                  className="group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 hover:border-indigo-300 transition-all text-left"
                >
                  <span className="flex items-center gap-3 font-medium text-slate-700">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />✨
                    Negotiation Script
                  </span>
                  <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => fetchGeminiAdvice("roadmap")}
                  className="group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 hover:border-emerald-300 transition-all text-left"
                >
                  <span className="flex items-center gap-3 font-medium text-slate-700">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />✨ Career
                    Roadmap
                  </span>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {adviceType === "negotiation"
                      ? "Negotiation Strategy"
                      : "Growth Plan"}
                  </span>
                  <button
                    onClick={() => setAdviceType(null)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Back
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex-grow min-h-[160px] relative overflow-y-auto max-h-[300px]">
                  {aiLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      <span className="text-xs">Consulting Gemini...</span>
                    </div>
                  ) : (
                    <div className="prose prose-sm prose-slate max-w-none">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                        {aiAdvice}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
