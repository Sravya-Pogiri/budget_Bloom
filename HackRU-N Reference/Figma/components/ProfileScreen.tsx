import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { User, Bell, Shield, HelpCircle, Settings, ChevronRight, LogOut } from "lucide-react";

export function ProfileScreen() {
  const settingsSections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Edit Profile", hasArrow: true },
        { icon: Shield, label: "Privacy & Security", hasArrow: true },
        { icon: Bell, label: "Notifications", hasToggle: true, enabled: true },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: Settings, label: "Budget Settings", hasArrow: true },
        { label: "Smart Alerts", hasToggle: true, enabled: true },
        { label: "Daily Reminders", hasToggle: true, enabled: false },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", hasArrow: true },
        { label: "Contact Support", hasArrow: true },
        { label: "Send Feedback", hasArrow: true },
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white">
      {/* Profile Header */}
      <Card className="mb-4 p-6 bg-blue-500 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-20 h-20 border-4 border-white/30">
            <AvatarFallback className="bg-white/20 text-white text-2xl">JD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="mb-1">John Doe</h2>
            <p className="text-blue-100 text-sm">Student ID: 12345678</p>
            <p className="text-blue-100 text-sm">john.doe@university.edu</p>
          </div>
        </div>
        <Button className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30">
          Edit Profile
        </Button>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="p-4 text-center bg-white">
          <p className="text-2xl text-emerald-600 mb-1">$1,240</p>
          <p className="text-xs text-gray-600">Total Saved</p>
        </Card>
        <Card className="p-4 text-center bg-white">
          <p className="text-2xl text-blue-600 mb-1">28</p>
          <p className="text-xs text-gray-600">Day Streak</p>
        </Card>
        <Card className="p-4 text-center bg-white">
          <p className="text-2xl text-[#FCD535] mb-1">Level 4</p>
          <p className="text-xs text-gray-600">Money Tree</p>
        </Card>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-4">
          <h3 className="text-sm text-gray-600 mb-2 px-1">{section.title}</h3>
          <Card className="bg-white">
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              return (
                <div
                  key={itemIndex}
                  className={`flex items-center justify-between p-4 ${
                    itemIndex !== section.items.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-5 h-5 text-gray-600" />}
                    <span>{item.label}</span>
                  </div>
                  {item.hasArrow && <ChevronRight className="w-5 h-5 text-gray-400" />}
                  {item.hasToggle && <Switch checked={item.enabled} />}
                </div>
              );
            })}
          </Card>
        </div>
      ))}

      {/* App Info */}
      <Card className="mb-4 p-4 bg-white">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Version</span>
            <span className="text-sm text-gray-500">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Terms of Service</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Privacy Policy</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </Card>

      {/* Logout */}
      <Button className="w-full mb-20 bg-red-500 hover:bg-red-600 text-white h-12 gap-2">
        <LogOut className="w-5 h-5" />
        Log Out
      </Button>
    </div>
  );
}