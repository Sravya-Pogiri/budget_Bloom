import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { HomeScreen } from "./components/HomeScreen";
import { NewDashboardScreen } from "./components/NewDashboardScreen";
import { SavingsGoalsScreen } from "./components/SavingsGoalsScreen";
import { NewChatScreen } from "./components/NewChatScreen";
import { NewMoneyTreeScreen } from "./components/NewMoneyTreeScreen";
import { NewRewardsScreen } from "./components/NewRewardsScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { MessageCircle, LayoutDashboard, Target, Sprout, Gift, User } from "lucide-react";
import { TreeLogo } from "./components/TreeLogo";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [activeScreen, setActiveScreen] = useState<"dashboard" | "goals" | "chat" | "tree" | "rewards" | "profile">("dashboard");

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "goals", label: "Goals", icon: Target },
    { id: "chat", label: "AI Chat", icon: MessageCircle },
    { id: "tree", label: "Tree", icon: Sprout },
    { id: "rewards", label: "Rewards", icon: Gift },
    { id: "profile", label: "Profile", icon: User },
  ];

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleGetStarted = () => {
    setShowHome(false);
  };

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        {/* iPhone 16 Frame */}
        <div className="relative">
          {/* iPhone Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-3xl z-50"></div>
          
          {/* iPhone Screen */}
          <div className="w-[393px] h-[852px] bg-black rounded-[60px] p-[12px] shadow-2xl">
            <div className="w-full h-full bg-white rounded-[48px] overflow-hidden flex flex-col">
              {/* Status Bar */}
              <div className="h-[44px] bg-blue-500 flex items-center justify-between px-6 pt-2">
                <span className="text-sm text-white">9:41</span>
                <div className="flex items-center gap-1">
                  <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                    <path d="M0 1.5C0 0.671573 0.671573 0 1.5 0H3.5C4.32843 0 5 0.671573 5 1.5V10.5C5 11.3284 4.32843 12 3.5 12H1.5C0.671573 12 0 11.3284 0 10.5V1.5Z" fill="white"/>
                    <path d="M6 2.5C6 1.67157 6.67157 1 7.5 1H9.5C10.3284 1 11 1.67157 11 2.5V10.5C11 11.3284 10.3284 12 9.5 12H7.5C6.67157 12 6 11.3284 6 10.5V2.5Z" fill="white"/>
                    <path d="M12 4.5C12 3.67157 12.6716 3 13.5 3H15.5C16.3284 3 17 3.67157 17 4.5V10.5C17 11.3284 16.3284 12 15.5 12H13.5C12.6716 12 12 11.3284 12 10.5V4.5Z" fill="white"/>
                  </svg>
                  <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M15.5 0H14.5C13.6716 0 13 0.671573 13 1.5V10.5C13 11.3284 13.6716 12 14.5 12H15.5C16.3284 12 17 11.3284 17 10.5V1.5C17 0.671573 16.3284 0 15.5 0ZM0 3C0 1.89543 0.895431 1 2 1H11C12.1046 1 13 1.89543 13 3V9C13 10.1046 12.1046 11 11 11H2C0.89543 11 0 10.1046 0 9V3Z" fill="white" fillOpacity="0.35"/>
                    <path d="M2 2H11V10H2V2Z" fill="white"/>
                  </svg>
                </div>
              </div>

              {/* Login Screen */}
              <LoginScreen onLogin={handleLogin} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show home screen after login
  if (showHome) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        {/* iPhone 16 Frame */}
        <div className="relative">
          {/* iPhone Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-3xl z-50"></div>
          
          {/* iPhone Screen */}
          <div className="w-[393px] h-[852px] bg-black rounded-[60px] p-[12px] shadow-2xl">
            <div className="w-full h-full bg-white rounded-[48px] overflow-hidden flex flex-col">
              {/* Status Bar */}
              <div className="h-[44px] bg-blue-500 flex items-center justify-between px-6 pt-2">
                <span className="text-sm text-white">9:41</span>
                <div className="flex items-center gap-1">
                  <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                    <path d="M0 1.5C0 0.671573 0.671573 0 1.5 0H3.5C4.32843 0 5 0.671573 5 1.5V10.5C5 11.3284 4.32843 12 3.5 12H1.5C0.671573 12 0 11.3284 0 10.5V1.5Z" fill="white"/>
                    <path d="M6 2.5C6 1.67157 6.67157 1 7.5 1H9.5C10.3284 1 11 1.67157 11 2.5V10.5C11 11.3284 10.3284 12 9.5 12H7.5C6.67157 12 6 11.3284 6 10.5V2.5Z" fill="white"/>
                    <path d="M12 4.5C12 3.67157 12.6716 3 13.5 3H15.5C16.3284 3 17 3.67157 17 4.5V10.5C17 11.3284 16.3284 12 15.5 12H13.5C12.6716 12 12 11.3284 12 10.5V4.5Z" fill="white"/>
                  </svg>
                  <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M15.5 0H14.5C13.6716 0 13 0.671573 13 1.5V10.5C13 11.3284 13.6716 12 14.5 12H15.5C16.3284 12 17 11.3284 17 10.5V1.5C17 0.671573 16.3284 0 15.5 0ZM0 3C0 1.89543 0.895431 1 2 1H11C12.1046 1 13 1.89543 13 3V9C13 10.1046 12.1046 11 11 11H2C0.89543 11 0 10.1046 0 9V3Z" fill="white" fillOpacity="0.35"/>
                    <path d="M2 2H11V10H2V2Z" fill="white"/>
                  </svg>
                </div>
              </div>

              {/* Home Screen */}
              <HomeScreen onGetStarted={handleGetStarted} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main app with navigation
  return (
    <>
      <Toaster position="top-center" />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        {/* iPhone 16 Frame */}
        <div className="relative">
          {/* iPhone Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-3xl z-50"></div>
          
          {/* iPhone Screen */}
          <div className="w-[393px] h-[852px] bg-black rounded-[60px] p-[12px] shadow-2xl">
            <div className="w-full h-full bg-white rounded-[48px] overflow-hidden flex flex-col">
              {/* Status Bar */}
              <div className="h-[44px] bg-white flex items-center justify-between px-6 pt-2">
                <span className="text-sm">9:41</span>
                <div className="flex items-center gap-1">
                  <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                    <path d="M0 1.5C0 0.671573 0.671573 0 1.5 0H3.5C4.32843 0 5 0.671573 5 1.5V10.5C5 11.3284 4.32843 12 3.5 12H1.5C0.671573 12 0 11.3284 0 10.5V1.5Z" fill="black"/>
                    <path d="M6 2.5C6 1.67157 6.67157 1 7.5 1H9.5C10.3284 1 11 1.67157 11 2.5V10.5C11 11.3284 10.3284 12 9.5 12H7.5C6.67157 12 6 11.3284 6 10.5V2.5Z" fill="black"/>
                    <path d="M12 4.5C12 3.67157 12.6716 3 13.5 3H15.5C16.3284 3 17 3.67157 17 4.5V10.5C17 11.3284 16.3284 12 15.5 12H13.5C12.6716 12 12 11.3284 12 10.5V4.5Z" fill="black"/>
                  </svg>
                  <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M15.5 0H14.5C13.6716 0 13 0.671573 13 1.5V10.5C13 11.3284 13.6716 12 14.5 12H15.5C16.3284 12 17 11.3284 17 10.5V1.5C17 0.671573 16.3284 0 15.5 0ZM0 3C0 1.89543 0.895431 1 2 1H11C12.1046 1 13 1.89543 13 3V9C13 10.1046 12.1046 11 11 11H2C0.89543 11 0 10.1046 0 9V3Z" fill="black" fillOpacity="0.35"/>
                    <path d="M2 2H11V10H2V2Z" fill="black"/>
                  </svg>
                </div>
              </div>

              {/* App Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl text-gray-900">BudgetBloom</h1>
                    <p className="text-sm text-gray-500">
                      {activeScreen === "dashboard" && "Your Financial Overview"}
                      {activeScreen === "goals" && "Savings Goals"}
                      {activeScreen === "chat" && "AI Money Assistant"}
                      {activeScreen === "tree" && "Your Money Tree"}
                      {activeScreen === "rewards" && "Your Rewards"}
                      {activeScreen === "profile" && "Your Profile"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm">
                    <TreeLogo size={48} />
                  </div>
                </div>
              </div>

              {/* Screen Content */}
              {activeScreen === "dashboard" && <NewDashboardScreen />}
              {activeScreen === "goals" && <SavingsGoalsScreen />}
              {activeScreen === "chat" && <NewChatScreen />}
              {activeScreen === "tree" && <NewMoneyTreeScreen />}
              {activeScreen === "rewards" && <NewRewardsScreen />}
              {activeScreen === "profile" && <ProfileScreen />}

              {/* Bottom Navigation */}
              <div className="bg-white border-t border-gray-100 px-1 py-2 flex justify-around safe-area-bottom">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveScreen(item.id as any)}
                      className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all min-w-0 ${
                        isActive
                          ? "bg-[#FCD535] shadow-md"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-gray-900" : ""}`} />
                      <span className={`text-[10px] ${isActive ? "text-gray-900 font-medium" : ""}`}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}