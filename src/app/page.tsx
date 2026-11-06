"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type EmergencyCategory = "Medical" | "Security" | "Fire" | "Hostel" | "Counseling";
type UrgencyLevel = "Critical (Immediate)" | "High" | "Moderate";

type AssistanceRequest = {
  id: string;
  studentName: string;
  studentId: string;
  phone: string;
  category: EmergencyCategory;
  urgency: UrgencyLevel;
  location: string;
  description: string;
  timestamp: string;
  status: "Dispatched" | "Responding" | "Resolved";
};

type EmergencyContact = {
  id: string;
  title: string;
  category: EmergencyCategory;
  phone: string;
  extension: string;
  location: string;
  available: string;
  description: string;
  badgeColor: string;
};

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: "sec-1",
    title: "Campus Security Control Room",
    category: "Security",
    phone: "+91 98765 43210",
    extension: "101",
    location: "Main Gate, Security HQ",
    available: "24/7 Active",
    description: "Immediate patrol dispatch, campus perimeter safety, and gate control.",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "med-1",
    title: "Campus Health & Ambulance Desk",
    category: "Medical",
    phone: "+91 98765 43211",
    extension: "102",
    location: "Health Centre, Ground Floor",
    available: "24/7 Doctor on duty",
    description: "Emergency paramedics, rapid ambulance response, and first aid.",
    badgeColor: "bg-red-100 text-red-800 border-red-200",
  },
  {
    id: "fire-1",
    title: "Fire Safety & Disaster Response",
    category: "Fire",
    phone: "+91 98765 43212",
    extension: "103",
    location: "Facility Maintenance Block",
    available: "24/7 On call",
    description: "Fire alarm trigger, extinguisher teams, and emergency evacuation.",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
  },
  {
    id: "hostel-1",
    title: "Chief Hostel Warden Office",
    category: "Hostel",
    phone: "+91 98765 43213",
    extension: "104",
    location: "Hostel Affairs Complex",
    available: "6:00 AM - 11:00 PM",
    description: "Hostel security, room emergencies, medical leave, and maintenance issues.",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: "women-1",
    title: "Women's Safety & Anti-Harassment",
    category: "Security",
    phone: "+91 98765 43214",
    extension: "105",
    location: "Student Welfare Block, Room 204",
    available: "24/7 Confidential",
    description: "Dedicated rapid escort service, confidential grievance redressal.",
    badgeColor: "bg-pink-100 text-pink-800 border-pink-200",
  },
  {
    id: "counsel-1",
    title: "Student Counseling & Mental Health",
    category: "Counseling",
    phone: "+91 98765 43215",
    extension: "106",
    location: "Wellness Centre, Block C",
    available: "9:00 AM - 8:00 PM",
    description: "Crisis psychological support, anxiety de-escalation, and counseling.",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
];

const CAMPUS_LOCATIONS = [
  "Central Library & Reading Halls",
  "Academic Block A (Engineering)",
  "Academic Block B (Sciences)",
  "Girls Hostel Complex (Blocks 1-3)",
  "Boys Hostel Complex (Blocks A-D)",
  "Main Cafeteria & Food Court",
  "Sports Complex & Stadium",
  "Student Activity Centre (SAC)",
  "Main University Gate",
  "Hostel Mess & Common Rooms",
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"request" | "sos" | "directory" | "history">("request");

  // Form State
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<EmergencyCategory>("Medical");
  const [urgency, setUrgency] = useState<UrgencyLevel>("High");
  const [location, setLocation] = useState(CAMPUS_LOCATIONS[0]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "alert" } | null>(null);

  // Request History (persisted in localStorage)
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);

  // SOS State
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [sosLocation, setSosLocation] = useState(CAMPUS_LOCATIONS[0]);

  // Load past requests from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("safecampus_requests");
      if (saved) {
        setRequests(JSON.parse(saved));
      } else {
        // Initial sample data for demonstration
        const initialSample: AssistanceRequest[] = [
          {
            id: "REQ-8421",
            studentName: "Rahul Sharma",
            studentId: "CS2024-042",
            phone: "+91 98123 45678",
            category: "Medical",
            urgency: "High",
            location: "Academic Block A (Engineering)",
            description: "Student fainted on 2nd floor staircase, needs first-aid stretcher.",
            timestamp: "Today, 10:45 AM",
            status: "Responding",
          },
        ];
        setRequests(initialSample);
        localStorage.setItem("safecampus_requests", JSON.stringify(initialSample));
      }
    } catch {
      // LocalStorage fallback
    }
  }, []);

  // Web Audio SOS Siren simulator
  const playSiren = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch {
      // Audio not supported or blocked by user gesture policy
    }
  };

  // SOS Countdown handler
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sosCountdown !== null && sosCountdown > 0) {
      timer = setTimeout(() => {
        setSosCountdown(sosCountdown - 1);
        playSiren();
      }, 1000);
    } else if (sosCountdown === 0) {
      setSosCountdown(null);
      setSosActive(true);

      // Create an automatic emergency SOS request
      const sosRequest: AssistanceRequest = {
        id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: studentName.trim() || "Immediate SOS Signal",
        studentId: studentId.trim() || "SOS-DIRECT",
        phone: phone.trim() || "Emergency Channel",
        category: "Security",
        urgency: "Critical (Immediate)",
        location: sosLocation,
        description: "URGENT 1-TOUCH PANIC ALERT ACTIVATED BY STUDENT.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "Dispatched",
      };

      setRequests((prev) => {
        const updated = [sosRequest, ...prev];
        try {
          localStorage.setItem("safecampus_requests", JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    }
    return () => clearTimeout(timer);
  }, [sosCountdown, studentName, studentId, phone, sosLocation]);

  const handleStartSos = () => {
    setSosCountdown(3);
    playSiren();
  };

  const handleCancelSos = () => {
    setSosCountdown(null);
    setSosActive(false);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newRequest: AssistanceRequest = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: studentName.trim(),
        studentId: studentId.trim() || "Not Provided",
        phone: phone.trim() || "Not Provided",
        category,
        urgency,
        location,
        description: description.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "Dispatched",
      };

      const updated = [newRequest, ...requests];
      setRequests(updated);
      try {
        localStorage.setItem("safecampus_requests", JSON.stringify(updated));
      } catch {
        // ignore
      }

      setNotification({
        message: `Request #${newRequest.id} dispatched! Campus ${category} team has been notified for ${location}.`,
        type: "success",
      });

      // Reset form
      setStudentName("");
      setStudentId("");
      setPhone("");
      setDescription("");
      setIsSubmitting(false);

      // Auto clear notification after 6 seconds
      setTimeout(() => setNotification(null), 6000);
    }, 400);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
                Campus<span className="text-blue-700">Shield</span>
              </Link>
              <p className="text-xs text-slate-500">Official Student Emergency & Safety Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Emergency Services Live
            </span>
            <button
              onClick={() => setActiveTab("sos")}
              className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 focus:ring-2 focus:ring-red-400"
            >
              <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
              SOS PANIC
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
            <button
              onClick={() => setActiveTab("request")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === "request"
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Request Assistance
            </button>
            <button
              onClick={() => setActiveTab("sos")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === "sos"
                  ? "bg-red-50 text-red-700 font-semibold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              One-Touch SOS
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === "directory"
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Emergency Contacts ({EMERGENCY_CONTACTS.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === "history"
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Live Tracker ({requests.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Banner Alert if any */}
        {notification && (
          <div className="mb-6 flex items-start justify-between rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-blue-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-blue-900">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-bold text-blue-700 hover:text-blue-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: REQUEST ASSISTANCE */}
        {activeTab === "request" && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Form Column */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="border-b border-slate-100 pb-5">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Request Campus Assistance
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Submit your immediate safety, medical, or hostel concern. Patrol and duty wardens are dispatched in real-time.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="mt-6 space-y-5">
                  {/* Student Details Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Student Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Shivansh Srivastava"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Roll No. / Student ID
                      </label>
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g. 21BCS104"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Emergency Contact Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 00000"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Campus Location <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        {CAMPUS_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Category & Urgency */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Assistance Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as EmergencyCategory)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="Medical">Medical Assistance (Health Centre)</option>
                        <option value="Security">Campus Security Patrol</option>
                        <option value="Hostel">Hostel Emergency & Warden</option>
                        <option value="Fire">Fire Hazard / Electrical Issue</option>
                        <option value="Counseling">Mental Wellness & Counseling</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Urgency Level <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="Critical (Immediate)">Critical (Immediate Response &lt; 3 mins)</option>
                        <option value="High">High Urgency (&lt; 10 mins)</option>
                        <option value="Moderate">Moderate (Standard Support)</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Describe the Situation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Specify landmarks, number of persons affected, or specific aid needed..."
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        Dispatching Emergency Team...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Submit Assistance Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar Column: Quick SOS & Fast Numbers */}
            <div className="space-y-6">
              {/* Quick Panic Card */}
              <div className="rounded-2xl border border-red-200 bg-red-50/70 p-6 text-center shadow-sm">
                <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-red-800">
                  Immediate Danger?
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">One-Touch SOS Alert</h3>
                <p className="mt-1 text-xs text-slate-600">
                  Broadcasts your current campus location to security guards and nearby patrol units.
                </p>
                <button
                  onClick={() => setActiveTab("sos")}
                  className="mt-4 w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
                >
                  Go to Panic Button
                </button>
              </div>

              {/* Direct Hotlines Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900">24/7 Campus Hotlines</h3>
                <div className="mt-4 divide-y divide-slate-100 text-sm">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">Security Control</p>
                      <p className="text-xs text-slate-500">Ext 101</p>
                    </div>
                    <a
                      href="tel:+919876543210"
                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                    >
                      Call Now
                    </a>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">Ambulance Desk</p>
                      <p className="text-xs text-slate-500">Ext 102</p>
                    </div>
                    <a
                      href="tel:+919876543211"
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
                    >
                      Call Now
                    </a>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">Hostel Emergency</p>
                      <p className="text-xs text-slate-500">Ext 104</p>
                    </div>
                    <a
                      href="tel:+919876543213"
                      className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100"
                    >
                      Call Now
                    </a>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                <p className="font-semibold">Demo Notice:</p>
                <p className="mt-1 text-amber-800">
                  This educational prototype stores requests in local state. In real deployment, requests connect to the live backend server.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ONE TOUCH SOS BUTTON */}
        {activeTab === "sos" && (
          <div className="mx-auto max-w-2xl text-center">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <span className="inline-block rounded-full bg-red-100 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-red-800">
                Instant Panic Trigger
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                Campus One-Touch SOS
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Triggering SOS broadcasts a critical priority alert with siren tone and dispatches the nearest security vehicle to your selected sector.
              </p>

              {/* Sector Selection */}
              <div className="mt-6 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Your Current Sector:
                </label>
                <select
                  value={sosLocation}
                  onChange={(e) => setSosLocation(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-red-500 focus:outline-none"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Big Red Button or Active State */}
              <div className="my-10 flex flex-col items-center justify-center">
                {sosCountdown !== null ? (
                  <div className="flex flex-col items-center animate-pulse">
                    <div className="flex h-44 w-44 items-center justify-center rounded-full bg-red-600 text-6xl font-black text-white shadow-2xl ring-8 ring-red-200">
                      {sosCountdown}
                    </div>
                    <p className="mt-5 text-base font-bold text-red-600">
                      Broadcasting Alert in {sosCountdown} seconds...
                    </p>
                    <button
                      onClick={handleCancelSos}
                      className="mt-3 rounded-full border border-slate-300 bg-white px-6 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                    >
                      Cancel SOS
                    </button>
                  </div>
                ) : sosActive ? (
                  <div className="w-full rounded-2xl border-2 border-red-500 bg-red-50 p-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white animate-bounce">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-xl font-black text-red-700">SOS ACTIVE & TRANSMITTED</h3>
                    <p className="mt-2 text-sm text-red-900">
                      Campus Control Room received your alert at <strong>{sosLocation}</strong>. Security guards and medical teams are converging on this sector.
                    </p>
                    <div className="mt-5 flex justify-center gap-3">
                      <button
                        onClick={playSiren}
                        className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700"
                      >
                        Re-Sound Siren
                      </button>
                      <button
                        onClick={handleCancelSos}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                      >
                        Deactivate / Stand Down
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleStartSos}
                    className="group relative flex h-48 w-48 flex-col items-center justify-center rounded-full bg-gradient-to-tr from-red-700 to-red-500 text-white shadow-2xl transition hover:scale-105 active:scale-95 ring-8 ring-red-100"
                  >
                    <span className="text-3xl font-black tracking-widest">SOS</span>
                    <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-red-100">
                      Tap For Help
                    </span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Tip: Pressing SOS starts a 3-second safety timer so accidental taps can be canceled immediately.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: EMERGENCY DIRECTORY */}
        {activeTab === "directory" && (
          <div>
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Campus Emergency Contacts
                </h2>
                <p className="text-sm text-slate-600">
                  Direct official telephone lines, office locations, and operating hours across university wings.
                </p>
              </div>
              <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 self-start sm:self-auto">
                All numbers verified 2026
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {EMERGENCY_CONTACTS.map((contact) => (
                <div
                  key={contact.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${contact.badgeColor}`}>
                        {contact.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{contact.available}</span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-900">{contact.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-600">{contact.description}</p>

                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-xs text-slate-500">
                      <p>
                        <strong className="text-slate-700">Location:</strong> {contact.location}
                      </p>
                      <p>
                        <strong className="text-slate-700">Campus Ext:</strong> {contact.extension}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <a
                      href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {contact.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REQUEST TRACKER & HISTORY */}
        {activeTab === "history" && (
          <div>
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Live Emergency Request Tracker
                </h2>
                <p className="text-sm text-slate-600">
                  Track dispatch response times and status of all reported requests in this session.
                </p>
              </div>
              <button
                onClick={() => {
                  setRequests([]);
                  try {
                    localStorage.removeItem("safecampus_requests");
                  } catch {
                    // ignore
                  }
                }}
                className="text-xs font-bold text-slate-500 hover:text-red-600 self-start sm:self-auto"
              >
                Clear Past Log
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-base font-bold text-slate-800">No active requests logged</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Any assistance requests or SOS alerts submitted will appear here with live response tracking.
                </p>
                <button
                  onClick={() => setActiveTab("request")}
                  className="mt-4 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800"
                >
                  Submit a Request
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700">{req.id}</span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {req.category}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                            req.urgency.includes("Critical")
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {req.urgency}
                        </span>
                        <span className="text-xs text-slate-400">• {req.timestamp}</span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900">{req.description}</h4>

                      <p className="text-xs text-slate-500">
                        <strong>Location:</strong> {req.location} | <strong>Student:</strong> {req.studentName} ({req.phone})
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                        <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>© 2026 CampusShield Emergency Portal. Built with Next.js & React 19.</p>
        <p className="mt-1 text-slate-400">Emergency simulation platform for campus security, medical triage, and hostel assistance.</p>
      </footer>
    </main>
  );
}
