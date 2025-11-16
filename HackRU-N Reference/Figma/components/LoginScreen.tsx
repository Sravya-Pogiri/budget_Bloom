import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { TreeLogo } from "./TreeLogo";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-28 h-28 mx-auto mb-6 rounded-[32px] flex items-center justify-center shadow-lg">
            <TreeLogo size={112} />
          </div>
          <h1 className="text-4xl text-gray-900 mb-2">BudgetBloom</h1>
          <p className="text-gray-500">Grow your savings, bloom your future</p>
        </div>

        {/* Login Card */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Email</label>
            <Input
              type="email"
              placeholder="you@university.edu"
              className="w-full h-12 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="w-full h-12 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>
          <Button
            onClick={onLogin}
            className="w-full bg-[#FCD535] hover:bg-yellow-400 text-gray-900 h-12 rounded-xl shadow-lg"
          >
            Sign In
          </Button>
        </div>

        <div className="text-center mb-6">
          <button className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <button className="text-blue-600 font-semibold hover:underline">Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
}