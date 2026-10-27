import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Save, 
  LogOut, 
  LogIn, 
  GraduationCap, 
  Target, 
  Info, 
  Lock, 
  Smartphone, 
  KeyRound,
  FileCheck,
  Eye,
  Check,
  RefreshCw,
  Award,
  Zap,
  Globe
} from 'lucide-react';
import { UserProfile } from '../types';
import { signInWithGoogle, logOut, updateStudentProfile, auth } from '../services/firebase';
import { logger } from '../services/logger';

interface StudentProfileSectionProps {
  user: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
  onRequireAuth: () => void;
  activeClass: string;
  onClassChange: (newClass: string) => void;
}

export const StudentProfileSection: React.FC<StudentProfileSectionProps> = ({
  user,
  onProfileUpdated,
  onRequireAuth,
  activeClass,
  onClassChange,
}) => {
  // Form State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [classPreference, setClassPreference] = useState(user?.classPreference || activeClass || 'Dropper');
  const [targetExam, setTargetExam] = useState(user?.targetExam || 'NEET');
  const [age, setAge] = useState(user?.age ? String(user.age) : '18');
  const [sex, setSex] = useState(user?.sex || 'Prefer not to say');
  const [studyLanguage, setStudyLanguage] = useState<'Hinglish' | 'English' | 'Hindi'>('Hinglish');

  // Phone Verification Simulation / Auth State
  const [isPhoneVerified, setIsPhoneVerified] = useState(Boolean(user?.mobileNumber && user.mobileNumber.length >= 10));
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSentNotice, setOtpSentNotice] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Synchronize when prop changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setMobileNumber(user.mobileNumber || '');
      setClassPreference(user.classPreference || activeClass || 'Dropper');
      setTargetExam(user.targetExam || 'NEET');
      if (user.age) setAge(String(user.age));
      if (user.sex) setSex(user.sex);
      setIsPhoneVerified(Boolean(user.mobileNumber && user.mobileNumber.length >= 10));
    }
  }, [user, activeClass]);

  // Google Login / Connect
  const handleGoogleConnect = async () => {
    try {
      setGoogleLoading(true);
      setSaveError(null);
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        setDisplayName(fbUser.displayName || displayName);
        setEmail(fbUser.email || email);
      }
    } catch (err: any) {
      logger.error('Profile', 'Google Connect failed', err);
      setSaveError(err.message || 'Google authentication was not completed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Phone OTP Simulation
  const handleSendOtp = () => {
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpError(null);
    setShowOtpInput(true);
    setOtpSentNotice(true);
    // Prefill demo OTP so user can test seamlessly
    setOtpCode('270226');
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim() === '270226' || otpCode.trim().length === 6) {
      setIsPhoneVerified(true);
      setShowOtpInput(false);
      setOtpSentNotice(false);
      setOtpError(null);
    } else {
      setOtpError('Invalid OTP code. Please enter the 6-digit verification code.');
    }
  };

  // Save / Update Profile
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!auth.currentUser && !user) {
      setSaveError('Please authenticate with Google or sign in to save your personal profile.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      const userId = auth.currentUser?.uid || user?.id || `local_user_${Date.now()}`;
      
      const updated = await updateStudentProfile(userId, {
        displayName: displayName.trim() || 'Student Scholar',
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        classPreference,
        className: classPreference,
        targetExam,
        age: Number(age) || 18,
        sex,
        acceptedTerms: true,
      });

      onProfileUpdated(updated);
      onClassChange(classPreference);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      logger.error('Profile', 'Failed to save student profile', err);
      setSaveError(err.message || 'Could not save profile. Changes kept in local session.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 text-slate-100">
      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0c142e] via-[#090e24] to-[#060817] border border-amber-400/20 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Student Academic ID &amp; Credentials</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Student Profile &amp; Data Hub
            </h1>
            
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Manage your academic goals, authenticate your Gmail and phone number, and personalize test papers for NEET, JEE, or CBSE.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {user ? (
              <button
                type="button"
                onClick={async () => {
                  await logOut();
                  window.location.reload();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleConnect}
                disabled={googleLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{googleLoading ? 'Connecting...' : 'Sign In with Google'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Profile successfully updated! Your academic class, verified credentials, and exam targets are synchronized.</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Form & Credentials (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* 1. Account Authentication Status */}
            <div className="rounded-2xl bg-[#070a14] border border-white/[0.08] p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>1. Verified Account Authentication</span>
              </h2>

              {/* Gmail Authentication Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Google / Gmail Account</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {email || 'No Google account linked'}
                    </span>
                  </div>
                </div>

                {email ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleConnect}
                    disabled={googleLoading}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer"
                  >
                    {googleLoading ? 'Connecting...' : 'Link Gmail'}
                  </button>
                )}
              </div>

              {/* Phone Number Authentication Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Mobile Phone Verification</span>
                      <span className="text-[11px] text-slate-400">
                        For scorecard alerts &amp; account recovery
                      </span>
                    </div>
                  </div>

                  {isPhoneVerified ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Phone Verified</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-amber-400 font-medium">Pending Verification</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">+91</span>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => {
                        setMobileNumber(e.target.value);
                        setIsPhoneVerified(false);
                      }}
                      placeholder="10-digit mobile number"
                      maxLength={12}
                      className="w-full pl-11 pr-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  {!isPhoneVerified && !showOtpInput && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Send OTP
                    </button>
                  )}
                </div>

                {otpError && (
                  <p className="text-[11px] text-rose-400 font-medium">{otpError}</p>
                )}

                {showOtpInput && (
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs text-indigo-300">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Enter 6-digit SMS verification code</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">(Demo Code: 270226)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="270226"
                        maxLength={6}
                        className="w-36 px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-400 text-center font-mono text-xs tracking-widest text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                      >
                        Verify &amp; Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowOtpInput(false)}
                        className="text-xs text-slate-400 hover:text-white px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Academic & Personal Profile */}
            <div className="rounded-2xl bg-[#070a14] border border-white/[0.08] p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>2. Academic Target &amp; Preferences</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-slate-300">Display / Student Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Arjun Sharma"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                {/* Target Class */}
                <div className="space-y-1.5">
                  <label className="text-amber-400 font-bold">Target Class (Featured First)</label>
                  <select
                    value={classPreference}
                    onChange={(e) => setClassPreference(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-amber-400/40 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                  >
                    <option value="Dropper">Dropper (NEET / JEE Repeaters)</option>
                    <option value="Class 12">Class 12 (Board &amp; Entrance)</option>
                    <option value="Class 11">Class 11 (Foundation &amp; Target)</option>
                    <option value="Class 10">Class 10 (Secondary Board)</option>
                    <option value="Class 9">Class 9 (Foundational)</option>
                  </select>
                </div>

                {/* Target Examination */}
                <div className="space-y-1.5">
                  <label className="text-slate-300">Target Examination</label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                  >
                    <option value="NEET">NEET-UG (Medical Entrance)</option>
                    <option value="JEE_MAIN">JEE Main (Engineering)</option>
                    <option value="JEE_ADV">JEE Advanced (IIT)</option>
                    <option value="CBSE_BOARDS">CBSE Board Examinations</option>
                  </select>
                </div>

                {/* Preferred Language */}
                <div className="space-y-1.5">
                  <label className="text-slate-300">Explanation Language</label>
                  <select
                    value={studyLanguage}
                    onChange={(e: any) => setStudyLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                  >
                    <option value="Hinglish">Hinglish (Hindi + English Mix)</option>
                    <option value="English">Pure English</option>
                    <option value="Hindi">Shuddh Hindi (हिंदी)</option>
                  </select>
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-slate-300">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min={12}
                    max={30}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-slate-300">Gender</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Profile...' : 'Save & Update Profile'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Data Transparency, Privacy Disclosure & Mission (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-[#070b1e] border border-amber-400/20 p-6 space-y-5 text-left shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <FileCheck className="w-4 h-4" />
              <span>Data Transparency Disclosure</span>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">
                Which data is taken from your account?
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Google Identity (Email &amp; Name):</strong> Required solely to maintain your persistent account and allow safe sign-in.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Mobile Phone Number:</strong> Used exclusively for exam notifications, verification, and critical account recovery.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Academic Goals &amp; Class:</strong> Target grade (Dropper, 12, 11, etc.) and examination pattern (NEET / JEE / CBSE) to calibrate test difficulty.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Test Scorecards &amp; Notes:</strong> Past year paper scores, weak area logs, and custom notebook designs for your personal study dashboard.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/10">
              <h3 className="text-sm font-bold text-white">
                Why is this data collected?
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                  <span><strong>100% Free Educational Mission:</strong> Buzzing Brain is an open platform committed to free quality education for every student.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Zero Commercial Sale / Marketing:</strong> We strictly NEVER sell, lease, or distribute your email or phone number to commercial coaching centers, advertisers, or third-party marketers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Cross-Device Learning Sync:</strong> Enables you to start a mock test or handwritten note on your phone and resume seamlessly on a laptop or tablet.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                  <span><strong>No Forced Login:</strong> All 200+ chapters, NCERT digital books, and practical labs remain 100% readable without logging in!</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All user data is encrypted in transit and stored in Firebase Firestore following strict security rules.</span>
            </div>
          </div>

          {/* Quick Learning Stats */}
          {user && (
            <div className="rounded-2xl bg-[#070a14] border border-white/[0.08] p-5 space-y-3 text-left">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Your Academic Footprint
              </span>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-lg font-black text-amber-400 block">{user.xp || 250}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Scholar XP</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-lg font-black text-emerald-400 block">{user.streakDays || 1} Days</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Study Streak</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
