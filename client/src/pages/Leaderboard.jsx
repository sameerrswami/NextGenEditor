import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Trophy, Star, Award, User, TrendingUp, Crown, Medal } from 'lucide-react';

const RANK_STYLES = {
  1: { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: <Crown size={18} className="text-amber-400" /> },
  2: { bg: 'from-slate-400/20 to-slate-500/10', border: 'border-slate-400/30', text: 'text-slate-300', icon: <Medal size={18} className="text-slate-300" /> },
  3: { bg: 'from-orange-600/20 to-orange-700/10', border: 'border-orange-600/30', text: 'text-orange-400', icon: <Medal size={18} className="text-orange-400" /> },
};

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard')
      .then(res => setBoard(res.data))
      .catch(err => console.error('Failed to fetch leaderboard', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-76px)]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
    </div>
  );

  const top3 = board.slice(0, 3);
  const rest  = board.slice(3);

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#020617] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 rounded-2xl mb-4 border border-amber-500/20">
            <Trophy size={32} className="text-amber-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Global Leaderboard</h1>
          <p className="text-slate-400 text-sm">Top developers ranked by coins earned</p>
        </div>

        {/* Top 3 Podium */}
        {top3.length > 0 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="flex-1 max-w-[180px] text-center">
                <div className="bg-gradient-to-b from-slate-400/10 to-transparent border border-slate-400/20 rounded-t-2xl pt-6 pb-4 px-4">
                  <div className="w-14 h-14 rounded-full bg-slate-400/20 border-2 border-slate-400/30 flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    {top3[1].avatar
                      ? <img src={top3[1].avatar} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                      : <User size={20} className="text-slate-300" />}
                  </div>
                  <Medal size={16} className="text-slate-300 mx-auto mb-1" />
                  <p className="font-bold text-white text-sm truncate">{top3[1].username}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-amber-400">{top3[1].coins}</span>
                  </div>
                </div>
                <div className="h-8 bg-slate-400/10 border-x border-b border-slate-400/20 rounded-b-xl flex items-center justify-center">
                  <span className="text-slate-300 font-black text-sm">#2</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div className="flex-1 max-w-[200px] text-center">
                <div className="bg-gradient-to-b from-amber-500/15 to-transparent border border-amber-500/30 rounded-t-2xl pt-8 pb-4 px-4">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    {top3[0].avatar
                      ? <img src={top3[0].avatar} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                      : <User size={24} className="text-amber-400" />}
                  </div>
                  <Crown size={18} className="text-amber-400 mx-auto mb-1" />
                  <p className="font-bold text-white truncate">{top3[0].username}</p>
                  {top3[0].isPremium && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">Premium</span>
                  )}
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-black text-amber-400">{top3[0].coins}</span>
                  </div>
                </div>
                <div className="h-10 bg-amber-500/10 border-x border-b border-amber-500/20 rounded-b-xl flex items-center justify-center">
                  <span className="text-amber-400 font-black">#1</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="flex-1 max-w-[180px] text-center">
                <div className="bg-gradient-to-b from-orange-600/10 to-transparent border border-orange-600/20 rounded-t-2xl pt-4 pb-4 px-4">
                  <div className="w-14 h-14 rounded-full bg-orange-600/20 border-2 border-orange-600/30 flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    {top3[2].avatar
                      ? <img src={top3[2].avatar} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                      : <User size={20} className="text-orange-400" />}
                  </div>
                  <Medal size={16} className="text-orange-400 mx-auto mb-1" />
                  <p className="font-bold text-white text-sm truncate">{top3[2].username}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-amber-400">{top3[2].coins}</span>
                  </div>
                </div>
                <div className="h-6 bg-orange-600/10 border-x border-b border-orange-600/20 rounded-b-xl flex items-center justify-center">
                  <span className="text-orange-400 font-black text-sm">#3</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rest of the leaderboard */}
        <div className="space-y-2">
          {rest.map((entry) => (
            <div
              key={entry.username}
              className="flex items-center gap-4 p-4 bg-white/3 border border-white/5 rounded-2xl hover:bg-white/6 hover:border-white/10 transition-all"
            >
              <span className="w-8 text-center font-black text-slate-500">#{entry.rank}</span>
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {entry.avatar
                  ? <img src={entry.avatar} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                  : <User size={16} className="text-indigo-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white truncate">{entry.username}</span>
                  {entry.isPremium && <Award size={14} className="text-amber-400 flex-shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 truncate">{entry.bio}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-lg text-amber-400">
                  <Star size={14} className="fill-amber-400" />
                  <span className="font-bold">{entry.coins}</span>
                </div>
                {entry.badges && entry.badges.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 rounded-lg text-rose-400" title={entry.badges.join(', ')}>
                    <Award size={14} />
                    <span className="font-bold text-xs">{entry.badges.length}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {board.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
              <p>No users yet. Be the first to earn coins!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
