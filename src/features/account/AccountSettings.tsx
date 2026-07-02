import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "@/shared/hooks/use-toast";
import { supabase } from "@/shared/api/supabase/client";
import { User, Mail, Calendar, Lock, Shield, AlertCircle, CheckCircle2, Key, Link as LinkIcon } from "lucide-react";

type Tab = "profile" | "security" | "connections";

const AccountSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your password has been updated successfully",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendPasswordResetEmail = async () => {
    if (!user?.email) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: "Check your email for a password reset link",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-24">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center gap-4 animate-fade-in">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <p className="text-red-500 font-medium">You must be logged in to view account settings.</p>
        </div>
      </div>
    );
  }

  const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Unknown';

  const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Unknown';

  return (
    <div className="min-h-screen bg-background flex flex-col pt-24 pb-12 animate-fade-in relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="space-y-2 mb-10">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground font-medium text-base">
            Manage your account information and security preferences
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Sidebar Navigation */}
          <aside className="md:w-64 shrink-0">
            <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar snap-x">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold whitespace-nowrap snap-start ${
                  activeTab === "profile"
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(145,70,255,0.2)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                <User className="w-4 h-4" />
                Profile Details
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold whitespace-nowrap snap-start ${
                  activeTab === "security"
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                <Key className="w-4 h-4" />
                Security
              </button>
              <button
                onClick={() => setActiveTab("connections")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold whitespace-nowrap snap-start ${
                  activeTab === "connections"
                    ? "bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.2)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                Connections
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-black/20 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] min-h-[500px]">
            
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-inner">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Profile Details</h2>
                    <p className="text-sm text-muted-foreground mt-1">Your personal information and account timeline.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                      <Mail className="w-4 h-4 text-gray-400" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="w-full h-12 rounded-xl border border-white/5 bg-white/5 pl-4 text-gray-400 focus:outline-none cursor-not-allowed shadow-inner"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                      <Shield className="w-4 h-4 text-gray-400" />
                      User ID
                    </label>
                    <input
                      type="text"
                      value={user.id}
                      disabled
                      className="w-full h-12 rounded-xl border border-white/5 bg-white/5 pl-4 text-gray-400 focus:outline-none cursor-not-allowed shadow-inner font-mono text-sm truncate"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Account Created
                    </label>
                    <input
                      type="text"
                      value={createdAt}
                      disabled
                      className="w-full h-12 rounded-xl border border-white/5 bg-white/5 pl-4 text-gray-400 focus:outline-none cursor-not-allowed shadow-inner"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Last Sign In
                    </label>
                    <input
                      type="text"
                      value={lastSignIn}
                      disabled
                      className="w-full h-12 rounded-xl border border-white/5 bg-white/5 pl-4 text-gray-400 focus:outline-none cursor-not-allowed shadow-inner"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-inner">
                    <Lock className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Security Settings</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your password and authentication methods.</p>
                  </div>
                </div>

                {!isChangingPassword ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                      <div>
                        <p className="text-base font-semibold text-white">Password</p>
                        <p className="text-sm text-muted-foreground mt-1">Ensure your account is using a long, random password to stay secure.</p>
                      </div>
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className="px-6 py-2.5 bg-white text-black rounded-xl font-bold hover:bg-gray-200 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] shrink-0"
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                      <div>
                        <p className="text-base font-semibold text-white">Password Reset Link</p>
                        <p className="text-sm text-muted-foreground mt-1">Send a reset link directly to your email address.</p>
                      </div>
                      <button
                        onClick={handleSendPasswordResetEmail}
                        disabled={isUpdating}
                        className="px-6 py-2.5 bg-transparent border border-white/20 text-white rounded-xl font-bold hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] active:scale-95 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isUpdating ? "Sending..." : "Send Link"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-6 animate-fade-in max-w-xl">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-300 font-medium">Please choose a strong password. It must be at least 6 characters long.</p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-200">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 pl-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-200">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 pl-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isUpdating ? "Updating..." : "Save Password"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                        disabled={isUpdating}
                        className="flex-1 h-12 bg-transparent border border-white/20 text-white rounded-xl font-bold hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === "connections" && (
              <div className="animate-fade-in space-y-8">
                 <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center border border-green-500/30 shadow-inner">
                      <Shield className="w-7 h-7 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">Linked Accounts</h2>
                      <p className="text-sm text-muted-foreground mt-1">Manage your connected authentication providers.</p>
                    </div>
                  </div>

                {user.app_metadata?.provider ? (
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-lg shrink-0">
                       {user.app_metadata.provider === 'github' ? (
                         <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                       ) : user.app_metadata.provider === 'google' ? (
                         <svg className="w-7 h-7 text-white" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                       ) : (
                          <Mail className="w-7 h-7 text-white" />
                       )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-lg font-bold text-white capitalize flex items-center justify-center sm:justify-start gap-2">
                        {user.app_metadata.provider} Account
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your account is securely connected via {user.app_metadata.provider}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 border border-white/10 border-dashed rounded-2xl bg-white/5">
                    <LinkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-bold text-white">No External Accounts</p>
                    <p className="text-sm text-muted-foreground mt-1">You signed up using an email and password.</p>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
