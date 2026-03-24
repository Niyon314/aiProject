import { useState, useEffect } from 'react';
import { useTheme, PRESET_THEMES, ROUNDED_OPTIONS, ANIMATION_OPTIONS } from '../context/ThemeContext';
import Header from '../components/Header';

export default function ThemeSettings() {
  const { config, setTheme, setRounded, setAnimation, resetToDefault, isLoading } = useTheme();
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customColor, setCustomColor] = useState(config.customPrimary || '#FF6B81');

  useEffect(() => {
    if (config.customPrimary) {
      setCustomColor(config.customPrimary);
    }
  }, [config.customPrimary]);

  const handleCustomColorSave = async () => {
    // 这里可以调用 setCustomPrimary，但当前接口未实现
    // await setCustomPrimary(customColor);
    setShowCustomColor(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-heart-beat mb-4">🎨</div>
          <p className="text-white text-lg font-heading">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header
        title="主题设置"
        onBack={() => window.history.back()}
      />

      <div className="px-4 py-6 space-y-6">
        {/* 预设主题 */}
        <section>
          <h2 className="text-white text-lg font-heading font-semibold mb-4">
            🎨 预设主题
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {PRESET_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={`
                  relative p-4 rounded-lg shadow-md transition-all duration-200
                  ${config.theme === theme.id 
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-105' 
                    : 'hover:scale-102'}
                `}
                style={{
                  background: theme.colors.background,
                }}
              >
                <div className="text-3xl mb-2">{theme.emoji}</div>
                <div className="text-sm font-semibold text-gray-800">
                  {theme.name}
                </div>
                {config.theme === theme.id && (
                  <div className="absolute top-2 right-2 text-xl">✓</div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* 圆角大小 */}
        <section>
          <h2 className="text-white text-lg font-heading font-semibold mb-4">
            🔲 圆角大小
          </h2>
          <div className="bg-white rounded-md p-4 shadow-md">
            <div className="flex justify-between items-center gap-2">
              {ROUNDED_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setRounded(option.id)}
                  className={`
                    flex-1 py-3 px-2 rounded-md text-sm font-semibold
                    transition-all duration-200
                    ${config.rounded === option.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  {option.name}
                </button>
              ))}
            </div>
            {/* 预览 */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500 mb-2">预览效果</p>
              <div
                className="h-12 bg-primary text-white flex items-center justify-center font-semibold"
                style={{
                  borderRadius: `${ROUNDED_OPTIONS.find(r => r.id === config.rounded)?.value || 12}px`,
                }}
              >
                圆角预览
              </div>
            </div>
          </div>
        </section>

        {/* 动画强度 */}
        <section>
          <h2 className="text-white text-lg font-heading font-semibold mb-4">
            ✨ 动画强度
          </h2>
          <div className="bg-white rounded-md p-4 shadow-md">
            <div className="space-y-2">
              {ANIMATION_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setAnimation(option.id)}
                  className={`
                    w-full py-3 px-4 rounded-md text-sm font-semibold
                    transition-all duration-200 flex items-center justify-between
                    ${config.animation === option.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  <span>{option.name}</span>
                  <span className="text-xs opacity-70">{option.duration}ms</span>
                </button>
              ))}
            </div>
            {/* 动画演示 */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md flex justify-center">
              <div
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl"
                style={{
                  animation: config.animation !== 'none' ? 'heart-beat 1s ease-in-out infinite' : 'none',
                }}
              >
                💕
              </div>
            </div>
          </div>
        </section>

        {/* 自定义颜色 */}
        <section>
          <h2 className="text-white text-lg font-heading font-semibold mb-4">
            🎯 自定义颜色
          </h2>
          <div className="bg-white rounded-md p-4 shadow-md">
            {!showCustomColor ? (
              <button
                onClick={() => setShowCustomColor(true)}
                className="w-full py-3 px-4 rounded-md bg-gray-100 text-gray-700 font-semibold
                         hover:bg-gray-200 transition-all duration-200"
              >
                + 选择自定义主色
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-16 h-16 rounded-md cursor-pointer border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-md font-mono"
                      placeholder="#FF6B81"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCustomColorSave}
                    className="flex-1 py-2 px-4 rounded-md bg-primary text-white font-semibold
                             hover:opacity-90 transition-all duration-200"
                  >
                    应用
                  </button>
                  <button
                    onClick={() => setShowCustomColor(false)}
                    className="flex-1 py-2 px-4 rounded-md bg-gray-200 text-gray-700 font-semibold
                             hover:bg-gray-300 transition-all duration-200"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 重置按钮 */}
        <section>
          <button
            onClick={resetToDefault}
            className="w-full py-4 px-6 rounded-md bg-red-100 text-red-600 font-semibold
                     hover:bg-red-200 transition-all duration-200"
          >
            🔄 恢复默认设置
          </button>
        </section>

        {/* 提示信息 */}
        <div className="text-center text-white/80 text-sm">
          <p>设置会自动保存并立即生效</p>
        </div>
      </div>
    </div>
  );
}
