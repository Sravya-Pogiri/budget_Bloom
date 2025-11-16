import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { User, Bell, Shield, HelpCircle, Settings, ChevronRight, LogOut, CreditCard, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { loadTransactions, TransactionRecord } from "../services/dataContext";

type SettingItem = {
  icon?: React.ComponentType<any>;
  label: string;
  hasArrow?: boolean;
  hasToggle?: boolean;
  enabled?: boolean;
};
export function ProfileScreen() {
  const [showAddCard, setShowAddCard] = useState(false);
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [cardData, setCardData] = useState({
    holderName: "",
    cardNumber: "",
    expireDate: "",
    cvv: "",
    rememberCard: false,
  });
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const savedCards = [
    { lastFour: "1234", type: "VISA", holder: "John Doe", expire: "12/25" },
  ];

  useEffect(() => {
    const loadCSV = async () => {
      try {
        setLoadingTx(true);
        const rows = await loadTransactions();
        const sorted = [...rows].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sorted);
      } catch {
        setTransactions([]);
      } finally {
        setLoadingTx(false);
      }
    };
    loadCSV();
    const openDialog = () => setShowCardDialog(true);
    window.addEventListener("profile-open-card-dialog", openDialog);
    return () => {
      window.removeEventListener("profile-open-card-dialog", openDialog);
    };
  }, []);

  const settingsSections: {
  title: string;
  items: SettingItem[];
}[] = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Edit Profile", hasArrow: true },
      { icon: Shield, label: "Privacy & Security", hasArrow: true },
      { icon: Bell, label: "Notifications", hasToggle: true, enabled: true },
    ] as SettingItem[],
  },
  {
    title: "Preferences",
    items: [
      { icon: Settings, label: "Budget Settings", hasArrow: true },
      { label: "Smart Alerts", hasToggle: true, enabled: true },
      { label: "Daily Reminders", hasToggle: true, enabled: false },
    ] as SettingItem[],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help Center", hasArrow: true },
      { label: "Contact Support", hasArrow: true },
      { label: "Send Feedback", hasArrow: true },
    ] as SettingItem[],
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

      {/* Payment Methods */}
      <div className="mb-4">
        <h3 className="text-sm text-gray-600 mb-2 px-1">Payment Methods</h3>
        
        {/* Saved Cards */}
        {savedCards.map((card, index) => (
          <Card key={index} className="mb-3 p-4 bg-white cursor-pointer" onClick={() => setShowCardDialog(true)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">{card.type} •••• {card.lastFour}</p>
                  <p className="text-xs text-gray-500">{card.holder}</p>
                  <p className="text-xs text-gray-500">Expires {card.expire}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        ))}

        {/* Add New Card Button */}
        {!showAddCard && (
          <Button
            onClick={() => setShowAddCard(true)}
            className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 h-12 gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Card
          </Button>
        )}

        {/* Add New Card Form */}
        {showAddCard && (
          <Card className="p-5 bg-white border-2 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Add New Card</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddCard(false)}
                className="text-gray-500 h-8"
              >
                Cancel
              </Button>
            </div>

            {/* Card Preview */}
            <div className="mb-6 relative">
              <div className="w-full h-48 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-5 text-white shadow-lg">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-10 bg-yellow-400/20 rounded flex items-center justify-center">
                    <div className="w-8 h-6 bg-yellow-400/40 rounded-sm" />
                  </div>
                  <p className="text-xs">VISA</p>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-blue-200 mb-1">Card Number</p>
                  <p className="tracking-wider">
                    {cardData.cardNumber || "0000 0000 0000 0000"}
                  </p>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-blue-200 mb-1">Card Holder</p>
                    <p className="text-sm">{cardData.holderName || "Full name"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 mb-1">Expires</p>
                    <p className="text-sm">{cardData.expireDate || "MM/YY"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="holderName" className="text-gray-700">Card holder name</Label>
                <Input
                  id="holderName"
                  placeholder="Full name"
                  value={cardData.holderName}
                  onChange={(e) => setCardData({ ...cardData, holderName: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cardNumber" className="text-gray-700">Card number</Label>
                <Input
                  id="cardNumber"
                  placeholder="0000-0000-0000-0000"
                  maxLength={19}
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expireDate" className="text-gray-700">Expire date</Label>
                  <Input
                    id="expireDate"
                    placeholder="MM/DD/YYYY"
                    value={cardData.expireDate}
                    onChange={(e) => setCardData({ ...cardData, expireDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv" className="text-gray-700">CVV/CVC</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    maxLength={4}
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={cardData.rememberCard}
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                setCardData({ ...cardData, rememberCard: checked === true })
                }   

                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Remember my card
                </label>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
                Add card
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Card details + recent transactions */}
      <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
        <DialogContent className="bg-white w-full max-w-[420px] max-h-[85dvh] flex flex-col min-h-0">
          <DialogHeader className="sticky top-0 bg-white z-10">
            <DialogTitle>Card Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 flex-1 overflow-hidden min-h-0">
            <div className="p-4 rounded-lg border bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">VISA •••• 1234</p>
                    <p className="text-xs text-gray-500">John Doe</p>
                    <p className="text-xs text-gray-500">Expires 12/25</p>
                  </div>
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white h-9" onClick={() => setShowCardDialog(false)}>
                  Remove card
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <h4 className="text-sm text-gray-700 mb-2">Recent Transactions</h4>
              <div className="max-h-[350px] overflow-y-auto">
                {loadingTx ? (
                  <div className="p-4 text-sm text-gray-500">Loading...</div>
                ) : transactions.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No transactions found.</div>
                ) : (
                  transactions.slice(0, 100).map((t) => {
                    const dateStr = (() => {
                      const parts = String(t.date).split("-");
                      if (parts.length === 3) {
                        const y = Number(parts[0]);
                        const m = Number(parts[1]) - 1;
                        const d = Number(parts[2]);
                        const local = new Date(y, m, d);
                        return local.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                      }
                      return String(t.date);
                    })();
                    return (
                      <div
                        key={t.transaction_id}
                        className="rounded-lg border p-4 mb-2 bg-white shadow-sm"
                      >
                        <p className="text-sm text-gray-900">
                          {t.merchant} • {t.category} • {t.location}
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          ${t.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">{dateStr} • {t.payment_method}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white pt-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11" onClick={() => setShowCardDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
