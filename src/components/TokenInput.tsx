
import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface TokenInputProps {
  onSubmit: (peerId: string) => void;
}

export const TokenInput = ({ onSubmit }: TokenInputProps) => {
  const [peerId, setPeerId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (peerId.trim().length === 5) {
      onSubmit(peerId.trim().toUpperCase());
      setPeerId("");
    }
  };

  const handlePeerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 5) {
      setPeerId(value);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={peerId}
            onChange={handlePeerIdChange}
            placeholder="Enter 5-character token"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-success/50 transition-all uppercase"
            minLength={5}
            maxLength={5}
            pattern="[A-Z0-9]{5}"
            required
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
