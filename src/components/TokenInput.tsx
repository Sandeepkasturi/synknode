
import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface TokenInputProps {
  onSubmit: (token: string) => void;
}

export const TokenInput = ({ onSubmit }: TokenInputProps) => {
  const [token, setToken] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onSubmit(token.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your access token"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-success/50 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-success text-white rounded-full hover:bg-success/90 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
