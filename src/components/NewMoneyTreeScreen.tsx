import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Sprout, TrendingUp, Target, Trophy, Users, MessageCircle, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from "sonner";
// Import the useRive hook (RiveState is implied by the hook's return)
import { useRive } from "@rive-app/react-canvas"; 

interface LeaderboardUser {
  username: string;
  level: number;
  treePercentage: number;
  rank: number;
  avatar: string;
}

export function NewMoneyTreeScreen() {
  const [friendUsername, setFriendUsername] = useState("");
  const [message, setMessage] = useState("");
  
  // State for controlling the Rive animation
  const [animationLevel, setAnimationLevel] = useState(0);

  // 1. Destructure ONLY RiveComponent and rive
  const { RiveComponent, rive } = useRive({
    src: "/TreeY.riv", // Path to your Rive file in the /public folder
    stateMachines: "State Machine 1", // From your .riv file
    artboard: "Artboard", // From your .riv file
    autoplay: true,
  });

  // 2. Correctly access inputs via the stateMachineInputs() method
  useEffect(() => {
    if (rive) {
      // Get the inputs for "State Machine 1"
      const inputs = rive.stateMachineInputs("State Machine 1");
      
      if (inputs) {
        // Find the "Numgrowing" input by its name
        const numGrowingInput = inputs.find(
          (input) => input.name === "Numgrowing"
        );
        
        // If found, set its value
        if (numGrowingInput) {
          numGrowingInput.value = animationLevel;
        }
      }
    }
  }, [rive, animationLevel]); // Rerun effect when rive or animationLevel changes

  const treeLevel = {
    level: 4,
    stage: "Young Sapling",
    progress: 65,
    totalSaved: 1240,
  };

  const milestones = [
    { amount: 500, reached: true },
    { amount: 1000, reached: true },
    { amount: 2000, reached: false },
    { amount: 5000, reached: false },
  ];

  const leaderboardData: LeaderboardUser[] = [
    { username: "You", level: 4, treePercentage: 65, rank: 1, avatar: "🌳" },
    { username: "Sarah_Chen", level: 5, treePercentage: 72, rank: 2, avatar: "🌲" },
    { username: "Mike_Budget", level: 3, treePercentage: 58, rank: 3, avatar: "🌱" },
    { username: "Emma_Saves", level: 4, treePercentage: 61, rank: 4, avatar: "🌳" },
    { username: "Alex_Money", level: 3, treePercentage: 45, rank: 5, avatar: "🌱" },
  ];

  const friends = [
    { name: "Sarah_Chen", status: "online", lastMessage: "Hey! Great savings today!" },
    { name: "Mike_Budget", status: "offline", lastMessage: "Let's compete this week!" },
  ];

  const handleAddFriend = () => {
    if (friendUsername.trim()) {
      toast.success(`Friend request sent to ${friendUsername}!`, {
        description: "They'll be notified shortly.",
      });
      setFriendUsername("");
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      toast.success("Message sent!", {
        description: "Your friend will receive your message.",
      });
      setMessage("");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="p-4 space-y-4">
        {/* Money Tree */}
        <Card className="p-6 bg-[#FEF3C7] border-0 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sprout className="w-6 h-6 text-[#FCD535]" />
              <h3 className="text-gray-900">Your Money Tree</h3>
            </div>
            <Badge className="bg-[#FCD535] text-gray-900">Level {treeLevel.level}</Badge>
          </div>

          <div className="text-center mb-6">
            {/* Rive animation */}
            <div className="w-full h-64 mx-auto mb-3">
              <RiveComponent />
            </div>

            <h3 className="text-gray-900 mb-1">{treeLevel.stage}</h3>
            <p className="text-sm text-gray-600">Keep saving to grow your tree!</p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress to Level 5</span>
              <span className="text-gray-900">{treeLevel.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-[#FCD535] h-3 rounded-full transition-all shadow-sm" 
                style={{ width: `${treeLevel.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-2xl text-gray-900">${treeLevel.totalSaved}</span>
              </div>
              <p className="text-xs text-gray-600">Total Saved</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-2xl text-gray-900">$2,000</span>
              </div>
              <p className="text-xs text-gray-600">Next Goal</p>
            </div>
          </div>
        </Card>

        {/* --- TEMPORARY INPUT FIELD --- */}
        <Card className="p-5 bg-white border-2 border-dashed border-blue-400 shadow-sm rounded-3xl">
          <h3 className="text-gray-900 mb-3">Dev Control: Animation Level</h3>
          <div className="space-y-2">
            <Label htmlFor="animLevel">Set Tree Level (Numgrowing)</Label>
            <Input
              id="animLevel"
              type="number"
              value={animationLevel}
              onChange={(e) => setAnimationLevel(Number(e.target.value))}
              className="w-full h-11 bg-gray-50 border-0 rounded-xl shadow-sm"
            />
            <p className="text-xs text-gray-500">
              Change this number to test the Rive animation states.
            </p>
          </div>
        </Card>
        {/* --- END TEMPORARY FIELD --- */}


        {/* Milestones */}
        <Card className="p-5 bg-white border-0 shadow-sm rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-gray-900">Savings Milestones</h3>
          </div>
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.amount}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  milestone.reached ? "bg-emerald-50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                      milestone.reached ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    {milestone.reached ? (
                      <span className="text-2xl">✓</span>
                    ) : (
                      <span className="text-2xl">🎯</span>
                    )}
                  </div>
                  <div>
                    <p className={milestone.reached ? "text-emerald-700" : "text-gray-600"}>
                      ${milestone.amount} Milestone
                    </p>
                    <p className="text-xs text-gray-500">
                      {milestone.reached ? "Completed!" : "Keep saving!"}
                    </p>
                  </div>
                </div>
                {milestone.reached && (
                  <Badge className="bg-emerald-500">✓</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="p-5 bg-white border-0 shadow-sm rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FCD535] flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 text-gray-900" />
            </div>
            <h3 className="text-gray-900">Leaderboard</h3>
          </div>
          <div className="space-y-2">
            {leaderboardData.map((user) => (
              <div
                key={user.username}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  user.username === "You" 
                    ? "bg-[#FEF3C7] shadow-sm" 
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`text-sm ${
                      user.rank === 1 ? "text-yellow-600" : 
                      user.rank === 2 ? "text-gray-500" : 
                      user.rank === 3 ? "text-amber-700" : "text-gray-600"
                    }`}>
                      #{user.rank}
                    </div>
                  </div>
                  <div className="text-3xl">{user.avatar}</div>
                  <div>
                    <p className={`text-gray-900 ${
                      user.username === "You" ? "font-semibold" : ""
                    }`}>
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      Level {user.level} • {user.treePercentage}% progress
                    </p>
                  </div>
                </div>
                {user.username === "You" && (
                  <Badge className="bg-blue-500">You</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Add Friends */}
        <Card className="p-5 bg-white border-0 shadow-sm rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-gray-900">Add Friends</h3>
          </div>
          <div className="space-y-3 mb-4">
            <Input
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
              placeholder="Enter username..."
              className="w-full h-11 bg-gray-50 border-0 rounded-xl shadow-sm"
            />
            <Button
              onClick={handleAddFriend}
              className="w-full bg-[#FCD535] hover:bg-yellow-400 text-gray-900 h-11 rounded-xl shadow-sm"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Send Friend Request
            </Button>
          </div>

          {/* Friends List */}
          {friends.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-600">Your Friends ({friends.length})</p>
              </div>
              {friends.map((friend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
                        {friend.name.charAt(0)}
                      </div>
                      <div 
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          friend.status === "online" ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-gray-900">{friend.name}</p>
                      <p className="text-xs text-gray-500">{friend.lastMessage}</p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[340px] rounded-3xl">
                      <DialogHeader>
                        <DialogTitle>Message {friend.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="w-full h-11 bg-gray-50 border-0 rounded-xl"
                        />
                        <Button
                          onClick={handleSendMessage}
                          className="w-full bg-[#FCD535] hover:bg-yellow-400 text-gray-900 h-11 rounded-xl"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* How to Grow */}
        <Card className="mb-20 p-6 bg-white border-0 shadow-sm rounded-3xl">
          <h3 className="text-gray-900 mb-4">How to Grow Your Tree</h3>
          <ul className="space-y-2 text-sm text-gray-800">
            <li className="flex items-start gap-2">
              <span>🌱</span>
              <span>Stay under budget to earn leaves and grow</span>
            </li>
            <li className="flex items-start gap-2">
              <span>💧</span>
              <span>Make smart financial decisions daily</span>
            </li>
            <li className="flex items-start gap-2">
              <span>☀️</span>
              <span>Complete savings milestones to level up</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🌳</span>
              <span>Watch your tree bloom into a mighty oak!</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}