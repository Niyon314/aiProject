import { useState } from 'react';

interface ChoreClaimProps {
  choreId: string;
  onClaim?: (id: string) => void;
}

export default function ChoreClaim({ choreId, onClaim }: ChoreClaimProps) {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await onClaim?.(choreId);
    } catch (error) {
      console.error('Failed to claim chore:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <button
      onClick={handleClaim}
      disabled={isClaiming}
      className="flex-1 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
    >
      {isClaiming ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin">⏳</span> 认领中...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          🙋 我来认领
        </span>
      )}
    </button>
  );
}
