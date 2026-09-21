import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Trophy,
  Printer,
  Download,
  Sparkles,
  X,
  Crown,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { RoundHistoryItem, TeamConfig, TeamPlayState } from '../types';

interface TeamCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerTeamId: 'team1' | 'team2';
  team1Config: TeamConfig;
  team2Config: TeamConfig;
  team1State: TeamPlayState;
  team2State: TeamPlayState;
  history: RoundHistoryItem[];
  targetScore: number;
  onTriggerFirecrackers?: () => void;
}

export const TeamCertificateModal: React.FC<TeamCertificateModalProps> = ({
  isOpen,
  onClose,
  winnerTeamId,
  team1Config,
  team2Config,
  team1State,
  team2State,
  history,
  targetScore,
  onTriggerFirecrackers,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<'team1' | 'team2'>(winnerTeamId);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const currentTeam = selectedTeamId === 'team1' ? team1Config : team2Config;
  const currentPlayState = selectedTeamId === 'team1' ? team1State : team2State;
  const isWinner = selectedTeamId === winnerTeamId;

  // Format today's date in Gujarati and English
  const today = new Date();
  const formattedDateEn = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const certId = `GWD-${today.getFullYear()}-${selectedTeamId.toUpperCase()}-${Math.abs(
    currentTeam.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 1000) % 9000 + 1000
  )}`;

  // Handle standard browser print
  const handlePrint = () => {
    window.print();
  };

  // Generate and download high-resolution Certificate as PNG using HTML Canvas
  const handleDownloadImage = () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const width = 1280;
      const height = 900;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsDownloading(false);
        return;
      }

      // Background Gradient (Parchment Ivory / Warm Slate)
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#fdfbf7');
      bgGrad.addColorStop(0.5, '#f7f2e7');
      bgGrad.addColorStop(1, '#ece3d2');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ornate Outer Gold Border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 10;
      ctx.strokeRect(36, 36, width - 72, height - 72);

      // Inner Fine Border
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.strokeRect(52, 52, width - 104, height - 104);

      // Corner Accents
      const drawCorner = (x: number, y: number) => {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 3;
        ctx.stroke();
      };
      drawCorner(52, 52);
      drawCorner(width - 52, 52);
      drawCorner(52, height - 52);
      drawCorner(width - 52, height - 52);

      // Certificate Title
      ctx.textAlign = 'center';
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('ગુજરાતી શબ્દ સંઘર્ષ • GUJARATI WORD DUEL', width / 2, 115);

      ctx.fillStyle = '#1e293b';
      ctx.font = '900 48px "Playfair Display", Georgia, serif';
      ctx.fillText('ગૌરવ પ્રમાણપત્ર • CERTIFICATE OF EXCELLENCE', width / 2, 180);

      // Decorative divider
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 240, 210);
      ctx.lineTo(width / 2 + 240, 210);
      ctx.stroke();

      // "Presented to"
      ctx.fillStyle = '#475569';
      ctx.font = 'italic 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('આથી સન્માનપૂર્વક પ્રમાણિત કરવામાં આવે છે કે • Proudly Presented To', width / 2, 260);

      // Team Name
      ctx.fillStyle = currentTeam.primaryHex || (isWinner ? '#d97706' : '#0284c7');
      ctx.font = 'bold 64px "Playfair Display", Georgia, serif';
      ctx.fillText(currentTeam.name, width / 2, 350);

      // Team Status (Winner vs Runner-Up)
      ctx.fillStyle = isWinner ? '#047857' : '#0369a1';
      ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
      const statusText = isWinner
        ? '🏆 પ્રથમ સ્થાન વિજેતા • GRAND CHAMPION (WINNER)'
        : '🥈 ઉત્કૃષ્ટ પ્રદર્શન • OUTSTANDING RUNNER-UP';
      ctx.fillText(statusText, width / 2, 405);

      // Description
      ctx.fillStyle = '#334155';
      ctx.font = '18px "Plus Jakarta Sans", sans-serif';
      const descLine1 = isWinner
        ? 'ગુજરાતી ભાષા શબ્દ સ્પર્ધામાં શ્રેષ્ઠ શબ્દભંડોળ, ઝડપી જોડણી અને વિજેતા ટીમ સ્કોર મેળવી'
        : 'ગુજરાતી ભાષા શબ્દ સ્પર્ધામાં પ્રશંસનીય ભાગીદારી અને ઉત્કૃષ્ટ શબ્દભંડોળનું પ્રદર્શન કરી';
      const descLine2 = isWinner
        ? 'પ્રથમ સ્થાન હાંસલ કરવા બદલ આ ગૌરવશાળી પ્રમાણપત્ર એનાયત કરવામાં આવે છે.'
        : 'સન્માનજનક ઉપ-વિજેતા સ્થાન પ્રાપ્ત કરવા બદલ આ પ્રશંસા પત્ર એનાયત કરવામાં આવે છે.';
      ctx.fillText(descLine1, width / 2, 465);
      ctx.fillText(descLine2, width / 2, 495);

      // Match Stats Box
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(width / 2 - 340, 530, 680, 85);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(width / 2 - 340, 530, 680, 85);

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`મેચ સ્કોર: ${currentPlayState.score} / ${targetScore} Points`, width / 2 - 200, 565);
      ctx.fillText(`કુલ રાઉન્ડ: ${history.length} Rounds Played`, width / 2, 565);
      ctx.fillText(`વિન સ્ટ્રીક: ${currentPlayState.streak}x Streak`, width / 2 + 200, 565);

      ctx.fillStyle = '#92400e';
      ctx.font = '13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('શબ્દ જ્ઞાન અને ઝડપની કસોટીમાં સાબિત થયેલ વિશિષ્ટ સફળતા', width / 2, 595);

      // Date and Verification ID
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = '15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`તારીખ • Date: ${formattedDateEn}`, 90, 680);
      ctx.fillText(`પ્રમાણપત્ર ક્રમાંક • ID: ${certId}`, 90, 705);

      // Official Stamp Seal (Circular)
      const sealX = width / 2;
      const sealY = 720;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 48, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#b45309';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sealX, sealY, 42, 0, Math.PI * 2);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('★ ગુજરાતી ★', sealX, sealY - 14);
      ctx.font = 'bold 14px "Playfair Display", serif';
      ctx.fillText('સુવર્ણ મુદ્રા', sealX, sealY + 4);
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('OFFICIAL SEAL', sealX, sealY + 19);

      // Signatures
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;

      // Sig 1
      ctx.beginPath();
      ctx.moveTo(width - 320, 715);
      ctx.lineTo(width - 120, 715);
      ctx.stroke();
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('સ્પર્ધા નિયામક • Director', width - 220, 740);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Gujarati Word Duel Jury', width - 220, 760);

      // Trigger download
      const link = document.createElement('a');
      link.download = `${currentTeam.name.replace(/\s+/g, '_')}_Certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // Ignored
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-950/85 backdrop-blur-md">
        {/* Certificate Dialog Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[96vh]"
        >
          {/* Top Bar: Team Selection Tabs & Action Buttons */}
          <div className="bg-slate-950/95 border-b border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {/* Team Tabs */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedTeamId('team1')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedTeamId === 'team1'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {winnerTeamId === 'team1' ? (
                  <Crown className="w-4 h-4 text-amber-950 fill-amber-950" />
                ) : (
                  <Award className="w-4 h-4" />
                )}
                <span>{team1Config.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 uppercase">
                  {winnerTeamId === 'team1' ? 'Winner 🏆' : 'Runner-Up'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTeamId('team2')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedTeamId === 'team2'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {winnerTeamId === 'team2' ? (
                  <Crown className="w-4 h-4 text-amber-950 fill-amber-950" />
                ) : (
                  <Award className="w-4 h-4" />
                )}
                <span>{team2Config.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 uppercase">
                  {winnerTeamId === 'team2' ? 'Winner 🏆' : 'Runner-Up'}
                </span>
              </button>
            </div>

            {/* Actions: Firecrackers, Print, Download, Close */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end w-full sm:w-auto">
              {onTriggerFirecrackers && (
                <button
                  type="button"
                  onClick={onTriggerFirecrackers}
                  title="૧૦ સેકન્ડ ફાયરક્રેકર્સ ફોડો • Firecrackers (10s)"
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">ફાયરક્રેકર્સ</span>
                  <span>(10s) 🎆</span>
                </button>
              )}

              <button
                type="button"
                onClick={handlePrint}
                title="પ્રિન્ટ અથવા PDF તરીકે સાચવો • Print / Save as PDF"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={isDownloading}
                title="ઇમેજ (PNG) ડાઉનલોડ કરો • Download as Image"
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isDownloading ? 'Saving...' : 'Download PNG'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Certificate Display Area (Printable) */}
          <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-slate-950/60 flex items-center justify-center print:p-0 print:m-0 print:bg-white">
            <div
              ref={certificateRef}
              id="printable-team-certificate"
              className="w-full max-w-3xl bg-gradient-to-br from-[#fefbf6] via-[#faf5eb] to-[#f4ede0] text-slate-900 rounded-xl sm:rounded-2xl border-4 sm:border-8 border-amber-600 shadow-2xl p-4 sm:p-8 sm:py-10 relative overflow-hidden print:border-8 print:border-amber-600 print:shadow-none print:w-full print:max-w-none"
            >
              {/* Inner Double Ornate Border */}
              <div className="absolute inset-2 sm:inset-3 border-2 border-amber-500/60 rounded-lg pointer-events-none" />
              <div className="absolute inset-3 sm:inset-4 border border-dashed border-amber-700/40 rounded-md pointer-events-none" />

              {/* Corner Embellishments */}
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-amber-700" />
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 border-amber-700" />
              <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 border-amber-700" />
              <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-amber-700" />

              {/* Subtle Watermark in background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
                <Trophy className="w-80 h-80 text-amber-900" />
              </div>

              {/* Certificate Content Header */}
              <div className="text-center relative z-10">
                <div className="flex items-center justify-center gap-2 mb-1 text-amber-700 font-bold text-xs sm:text-sm tracking-wider uppercase">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>ગુજરાતી શબ્દ સંઘર્ષ • Gujarati Word Duel</span>
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>

                <h1 className="font-display font-black text-2xl sm:text-4xl text-slate-900 tracking-tight mt-1 mb-2">
                  ગૌરવ પ્રમાણપત્ર
                </h1>
                <p className="text-xs sm:text-sm font-semibold tracking-widest text-amber-800 uppercase">
                  Certificate of Excellence & Achievement
                </p>

                <div className="w-24 sm:w-36 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto my-3" />

                <p className="text-xs sm:text-sm italic text-slate-600 font-medium">
                  આથી સન્માનપૂર્વક પ્રમાણિત કરવામાં આવે છે કે • This is proudly presented to
                </p>

                {/* Team Recipient Name */}
                <div className="my-3 sm:my-5">
                  <h2
                    className="font-display font-black text-3xl sm:text-5xl tracking-wide drop-shadow-sm truncate max-w-xl mx-auto"
                    style={{ color: currentTeam.primaryHex || '#d97706' }}
                  >
                    {currentTeam.name}
                  </h2>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-2 bg-amber-500/15 border border-amber-600/30 text-amber-900 font-bold text-xs sm:text-sm">
                    {isWinner ? (
                      <>
                        <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                        <span>પ્રથમ સ્થાન વિજેતા • 1st Place Grand Champions</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 text-amber-700" />
                        <span>ઉત્કૃષ્ટ પ્રદર્શન • Outstanding Runner-Up Honors</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Citation Paragraph */}
                <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed mb-4 px-2">
                  {isWinner
                    ? 'ગુજરાતી ભાષા શબ્દ સંઘર્ષ સ્પર્ધામાં તેજસ્વી શબ્દભંડોળ, ઉત્કૃષ્ટ ટીમ વર્ક અને ઝડપી જોડણીના ઉત્કૃષ્ટ પ્રદર્શન દ્વારા વિજય પ્રાપ્ત કરવા બદલ આ ગૌરવશાળી પ્રમાણપત્ર એનાયત કરવામાં આવે છે.'
                    : 'ગુજરાતી ભાષા શબ્દ સંઘર્ષ સ્પર્ધામાં પ્રશંસનીય ભાગીદારી, સુંદર ટીમ ભાવના અને તેજસ્વી શબ્દ જ્ઞાનનું ઉત્કૃષ્ટ પ્રદર્શન કરવા બદલ આ પ્રશંસા પત્ર એનાયત કરવામાં આવે છે.'}
                </p>

                {/* Match Performance Badges */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto bg-amber-500/10 border border-amber-600/30 rounded-xl p-2.5 sm:p-3 mb-5 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">
                      સ્કોર • Score
                    </span>
                    <span className="font-display font-black text-base sm:text-xl text-amber-900">
                      {currentPlayState.score} / {targetScore}
                    </span>
                  </div>

                  <div className="flex flex-col items-center border-x border-amber-600/20">
                    <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">
                      રાઉન્ડ્સ • Rounds
                    </span>
                    <span className="font-display font-black text-base sm:text-xl text-amber-900">
                      {history.length}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">
                      સ્ટ્રીક • Streak
                    </span>
                    <span className="font-display font-black text-base sm:text-xl text-amber-900 flex items-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      {currentPlayState.streak}x
                    </span>
                  </div>
                </div>

                {/* Footer: Date, Official Seal, and Signatures */}
                <div className="flex items-center justify-between pt-2 border-t border-amber-700/20 text-left text-xs sm:text-sm">
                  {/* Left: Date & ID */}
                  <div className="flex flex-col gap-0.5 text-slate-600 text-[11px] sm:text-xs">
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      <span>તારીખ: {formattedDateEn}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>{certId}</span>
                    </div>
                  </div>

                  {/* Center: Golden Ornate Seal */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 border-2 border-amber-700 flex flex-col items-center justify-center text-slate-950 shadow-md shadow-amber-600/30 text-center leading-none">
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter">
                        ગુજરાતી
                      </span>
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 my-0.5 stroke-[2.2]" />
                      <span className="text-[7px] sm:text-[8px] font-extrabold uppercase">
                        સુવર્ણ મુદ્રા
                      </span>
                    </div>
                  </div>

                  {/* Right: Signature */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 sm:w-32 border-b border-slate-700 mb-1" />
                    <span className="font-bold text-slate-800 text-[11px] sm:text-xs">
                      સ્પર્ધા સંયોજક
                    </span>
                    <span className="text-[10px] text-slate-500 italic">
                      Word Duel Jury
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
