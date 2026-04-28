import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Calendar, Settings, Shield, Award, Terminal, Heart, Eye, Users, CheckCircle, Star, Loader2, Camera, Edit2, X, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { user: currentUser, refreshUser } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [buyingPremium, setBuyingPremium] = useState(false);
  const [message, setMessage] = useState('');
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    avatar: ''
  });
  const [saving, setSaving] = useState(false);

  const isOwnProfile = !username || username === currentUser?.username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const endpoint = isOwnProfile ? `${API_URL}/user/me` : `${API_URL}/user/profile/${username}`;
      const res = await axios.get(endpoint);
      setProfileUser(res.data);
      
      if (isOwnProfile) {
        setEditForm({
          username: res.data.username,
          bio: res.data.bio,
          avatar: res.data.avatar || ''
        });
      }

      if (!isOwnProfile && currentUser) {
        setIsFollowing(res.data.followers.includes(currentUser._id));
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await axios.post(`${API_URL}/user/follow/${profileUser._id}`);
      setIsFollowing(res.data.following);
      fetchProfile();
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleBuyPremium = async () => {
    if (profileUser.coins < 10000) {
      setMessage('Not enough coins! You need 10,000.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    setBuyingPremium(true);
    try {
      await axios.post(`${API_URL}/user/premium/buy`);
      setMessage('Welcome to Premium!');
      refreshUser();
      fetchProfile();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Purchase failed');
    } finally {
      setBuyingPremium(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${API_URL}/user/profile`, editForm);
      setProfileUser(res.data);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      refreshUser();
      if (editForm.username !== profileUser.username) {
        navigate(`/profile/${editForm.username}`);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 size={48} className="animate-spin text-indigo-500" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Developer Profile...</p>
    </div>
  );

  const stats = [
    { label: 'Followers', value: profileUser?.followers?.length || 0, icon: <Users size={20} className="text-indigo-400" /> },
    { label: 'Following', value: profileUser?.following?.length || 0, icon: <Heart size={20} className="text-pink-400" /> },
    { label: 'Coins', value: profileUser?.coins || 0, icon: <Star size={20} className="text-amber-400" /> },
    { label: 'Views', value: profileUser?.profileViews || 0, icon: <Eye size={20} className="text-cyan-400" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative">
      <div className="blob w-72 h-72 bg-indigo-600 top-20 -left-20"></div>
      <div className="blob w-96 h-96 bg-purple-600 bottom-20 -right-20"></div>

      <div className="flex flex-col md:flex-row gap-8 animate-fadeIn">
        {/* User Card */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden">
            {profileUser?.isPremium && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 animate-pulse"></div>
            )}
            
            <div className="relative group cursor-pointer" onClick={() => isEditing && fileInputRef.current.click()}>
              <div className={`absolute -inset-1 bg-gradient-to-r ${profileUser?.isPremium ? 'from-amber-400 to-rose-500' : 'from-indigo-500 to-purple-600'} rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000`}></div>
              <div className="relative w-32 h-32 rounded-full bg-slate-900 flex items-center justify-center border-2 border-white/10 overflow-hidden">
                {(isEditing ? editForm.avatar : profileUser?.avatar) ? (
                  <img 
                    src={isEditing ? editForm.avatar : profileUser?.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "";
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <User size={64} className={profileUser?.isPremium ? 'text-amber-400' : 'text-indigo-400'} />
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
            </div>
            
            <div className="mt-6 w-full">
              {isEditing ? (
                <input 
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center text-xl font-bold text-white w-full outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Username"
                />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-3xl font-bold text-white">{profileUser?.username}</h2>
                  {profileUser?.isPremium && <CheckCircle size={20} className="text-amber-400" />}
                </div>
              )}
              <p className="text-indigo-400 font-medium mt-2">{profileUser?.bio}</p>
            </div>
            
            <div className="mt-8 w-full flex flex-col gap-3">
              {isOwnProfile ? (
                isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={handleUpdateProfile} disabled={saving} className="btn-neon flex-1 flex items-center justify-center gap-2">
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="btn-neon w-full flex items-center justify-center gap-2">
                    <Edit2 size={18} /> Edit Profile
                  </button>
                )
              ) : (
                <button 
                  onClick={handleFollow}
                  className={`w-full py-2.5 rounded-xl font-bold transition-all ${
                    isFollowing 
                      ? 'bg-white/10 text-white border border-white/20' 
                      : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setMessage('Link copied to clipboard!');
                  setTimeout(() => setMessage(''), 3000);
                }}
                className="btn-outline w-full"
              >
                Share Portfolio
              </button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield size={20} className="text-indigo-400" />
              Developer Level
            </h3>
            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                style={{ width: `${Math.min((profileUser?.coins / 10000) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Progress</span>
              <span className="text-xs text-indigo-400 font-bold">{profileUser?.coins} / 10,000 Coins</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-2/3 flex flex-col gap-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="glass-card p-6 flex flex-col items-center justify-center gap-2 text-center">
                <div className="p-3 bg-white/5 rounded-2xl mb-2">
                  {stat.icon}
                </div>
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* About Section */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Terminal size={24} className="text-indigo-400" />
              Professional Bio
            </h3>
            
            {isEditing ? (
              <textarea 
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Tell us about your developer journey..."
              />
            ) : (
              <p className="text-slate-400 leading-relaxed italic text-lg">
                "{profileUser?.bio || 'No bio provided yet. Click Edit Profile to add one!'}"
              </p>
            )}

            <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-slate-500 text-[10px] flex items-center gap-2 uppercase tracking-widest font-black">
                  <Mail size={14} /> Registered Email
                </label>
                <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-slate-400 font-mono text-sm">
                  {isOwnProfile ? profileUser?.email : '••••••••@••••.com'}
                </div>
              </div>
            </div>

            {isOwnProfile && !profileUser?.isPremium && (
              <div className="mt-12 p-8 bg-gradient-to-br from-amber-500/10 to-rose-500/10 rounded-3xl border border-amber-500/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="font-bold text-2xl text-white flex items-center gap-2">
                      <Star className="text-amber-400" /> Unlock Premium
                    </h4>
                    <p className="text-slate-400 mt-1">Get the Golden Badge, AI Debugger, and Unlimited Storage.</p>
                  </div>
                  <div className="text-center">
                    <button 
                      onClick={handleBuyPremium}
                      disabled={buyingPremium}
                      className="px-8 py-3 bg-amber-400 text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-amber-400/20 disabled:opacity-50"
                    >
                      {buyingPremium ? <Loader2 className="animate-spin mx-auto" /> : '10,000 Coins'}
                    </button>
                    <p className="text-[10px] text-amber-500 mt-2 font-bold uppercase tracking-widest">Permanent Access</p>
                  </div>
                </div>
              </div>
            )}
            
            {message && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
                <span className="px-8 py-3 bg-indigo-500 text-white rounded-2xl font-bold shadow-2xl flex items-center gap-2 border border-white/20">
                  <CheckCircle size={20} /> {message}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
