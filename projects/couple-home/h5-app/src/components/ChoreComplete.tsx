import { useState } from 'react';

interface ChoreCompleteProps {
  choreId: string;
  choreName: string;
  points: number;
  onComplete?: (id: string, proofPhoto?: string, notes?: string) => void;
}

export default function ChoreComplete({
  choreId,
  choreName,
  points,
  onComplete,
}: ChoreCompleteProps) {
  const [showModal, setShowModal] = useState(false);
  const [proofPhoto, setProofPhoto] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete?.(choreId, proofPhoto || undefined, notes || undefined);
      setShowModal(false);
      setProofPhoto('');
      setNotes('');
    } catch (error) {
      console.error('Failed to complete chore:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex-1 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform active:scale-95 shadow-md hover:shadow-lg"
      >
        ✅ 完成打卡
      </button>

      {/* 打卡弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end sm:items-center justify-center animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 animate-slide-up">
            {/* 头部 */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-heading font-bold text-gray-800 mb-2">
                🎉 完成打卡
              </h3>
              <p className="text-sm text-gray-600">{choreName}</p>
              <p className="text-xs text-orange-500 font-semibold mt-1">
                ⭐ 完成可获得 {points} 积分
              </p>
            </div>

            {/* 拍照上传 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📷 拍照证明 <span className="text-gray-400 font-normal">(可选)</span>
              </label>
              {proofPhoto ? (
                <div className="relative">
                  <img
                    src={proofPhoto}
                    alt="Proof"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setProofPhoto('')}
                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-pink-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <span className="text-4xl mb-2 block">📸</span>
                  <span className="text-sm text-gray-500">点击拍照或上传照片</span>
                </label>
              )}
            </div>

            {/* 备注 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💬 备注 <span className="text-gray-400 font-normal">(可选)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="例如：今天洗了 10 个碗..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                rows={3}
              />
            </div>

            {/* 按钮 */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-full transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="flex-1 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> 提交中...
                  </span>
                ) : (
                  '✅ 完成打卡'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
