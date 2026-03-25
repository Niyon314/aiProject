import { useState, useEffect } from 'react';
import { movieApi, type Movie, type CreateMovieRequest, type RateMovieRequest } from '../api/movieApi';
import TabBar from '../components/TabBar';
import Header from '../components/Header';

export default function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [filter, setFilter] = useState<'all' | 'watched' | 'unwatched'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');

  // 表单状态
  const [formData, setFormData] = useState<CreateMovieRequest>({
    title: '',
    poster: '',
    type: 'movie',
  });

  // 评分表单
  const [ratingForm, setRatingForm] = useState<RateMovieRequest>({
    rating: 0,
    review: '',
  });

  useEffect(() => {
    loadMovies();
  }, [filter, typeFilter]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const watched = filter === 'all' ? 'all' : filter === 'watched';
      const type = typeFilter === 'all' ? undefined : typeFilter;
      const response = await movieApi.getAll({ watched, type, pageSize: 50 });
      setMovies(response.items);
    } catch (error) {
      console.error('加载观影列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMovie = async () => {
    if (!formData.title.trim()) {
      alert('请填写电影名称');
      return;
    }

    try {
      await movieApi.create(formData);
      setShowAddModal(false);
      setFormData({
        title: '',
        poster: '',
        type: 'movie',
      });
      loadMovies();
    } catch (error) {
      console.error('创建观影记录失败:', error);
      alert('创建失败，请重试');
    }
  };

  const handleMarkWatched = async (movie: Movie) => {
    if (!confirm(`确定要标记"${movie.title}"为已看过吗？🎬`)) {
      return;
    }

    try {
      await movieApi.markWatched(movie.id);
      loadMovies();
    } catch (error) {
      console.error('标记失败:', error);
      alert('操作失败，请重试');
    }
  };

  const handleRate = async () => {
    if (!selectedMovie) return;

    try {
      await movieApi.rate(selectedMovie.id, ratingForm);
      setShowRateModal(false);
      setRatingForm({ rating: 0, review: '' });
      setSelectedMovie(null);
      loadMovies();
    } catch (error) {
      console.error('评分失败:', error);
      alert('评分失败，请重试');
    }
  };

  const handleDelete = async (movie: Movie) => {
    if (!confirm(`确定要删除"${movie.title}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      await movieApi.delete(movie.id);
      loadMovies();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  const getRatingColor = (rating: number) => {
    return movieApi.getRatingColor(rating);
  };

  const watchedCount = movies.filter(m => m.watched).length;
  const totalProgress = movies.length > 0 
    ? ((watchedCount / movies.length) * 100).toFixed(0) 
    : '0';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-heart-beat mb-4">🎬</div>
          <p className="text-white text-lg font-heading">加载中，马上就好~</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header title="观影清单" showNotification />
      
      <div className="px-4 py-6 space-y-6">
        {/* 总览卡片 */}
        <div className="bg-white/20 backdrop-blur-sm rounded-md p-4 text-white">
          <h2 className="text-lg font-heading font-semibold mb-3">🎬 观影统计</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{movies.length}</div>
              <div className="text-xs opacity-80">总记录</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{watchedCount}</div>
              <div className="text-xs opacity-80">已观看</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalProgress}%</div>
              <div className="text-xs opacity-80">观看率</div>
            </div>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-400 to-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* 筛选器 */}
        <div className="space-y-2">
          <div className="flex gap-2">
            {(['all', 'unwatched', 'watched'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {f === 'all' ? '全部' : f === 'unwatched' ? '待观看' : '已观看'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['all', 'movie', 'tv'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                  typeFilter === t
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {t === 'all' ? '全部' : t === 'movie' ? '🎬 电影' : '📺 剧集'}
              </button>
            ))}
          </div>
        </div>

        {/* 待观看列表 */}
        {filter !== 'watched' && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-heading font-semibold">
                ⏳ 待观看
              </h3>
            </div>

            {movies.filter(m => !m.watched).length === 0 ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-md p-6 text-center text-white">
                <p className="text-4xl mb-2">🎬</p>
                <p className="text-sm">还没有待观看的电影/剧集</p>
                <p className="text-xs opacity-80">点击上方 + 添加第一个</p>
              </div>
            ) : (
              <div className="space-y-4">
                {movies.filter(m => !m.watched).map(movie => (
                  <div 
                    key={movie.id} 
                    className="bg-white/90 backdrop-blur-sm rounded-md p-4 animate-fade-in"
                  >
                    <div className="flex items-start gap-3">
                      {movie.poster && (
                        <img 
                          src={movie.poster} 
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-gray-800 font-heading font-semibold text-lg">
                              {movie.title}
                            </h4>
                            <div className="text-xs text-gray-500 mt-1">
                              {movieApi.getTypeIcon(movie.type)} {movie.type === 'movie' ? '电影' : '剧集'}
                            </div>
                          </div>
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                            待观看
                          </span>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleMarkWatched(movie)}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 rounded-full text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all active:scale-95"
                          >
                            ✅ 看过
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMovie(movie);
                              setRatingForm({ rating: movie.rating, review: movie.review });
                              setShowRateModal(true);
                            }}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 rounded-full text-sm font-medium hover:from-pink-600 hover:to-pink-700 transition-all active:scale-95"
                          >
                            ⭐ 评分
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 已观看列表 */}
        {(filter === 'all' || filter === 'watched') && (
          <>
            <div className="flex items-center justify-between mt-6">
              <h3 className="text-white text-lg font-heading font-semibold">
                ✅ 已观看
              </h3>
            </div>

            {movies.filter(m => m.watched).length === 0 ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-md p-6 text-center text-white">
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-sm">还没有已观看的电影/剧集</p>
                <p className="text-xs opacity-80">快去观看并标记吧</p>
              </div>
            ) : (
              <div className="space-y-4">
                {movies.filter(m => m.watched).map(movie => (
                  <div 
                    key={movie.id} 
                    className="bg-white/90 backdrop-blur-sm rounded-md p-4 animate-fade-in"
                  >
                    <div className="flex items-start gap-3">
                      {movie.poster && (
                        <img 
                          src={movie.poster} 
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-gray-800 font-heading font-semibold text-lg">
                              {movie.title}
                            </h4>
                            <div className="text-xs text-gray-500 mt-1">
                              {movieApi.getTypeIcon(movie.type)} {movie.type === 'movie' ? '电影' : '剧集'}
                            </div>
                          </div>
                          <div className="text-right">
                            {movie.rating > 0 && (
                              <div 
                                className="text-lg font-bold mb-1"
                                style={{ color: getRatingColor(movie.rating) }}
                              >
                                {movie.rating}/10
                              </div>
                            )}
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                              ✅ 已看
                            </span>
                          </div>
                        </div>

                        {/* 影评 */}
                        {movie.review && (
                          <div className="text-sm text-gray-600 bg-gray-50 rounded-md p-2 mb-2">
                            📝 {movie.review}
                          </div>
                        )}

                        {/* 观看时间 */}
                        {movie.watchedAt && (
                          <div className="text-xs text-gray-500 mb-2">
                            📅 {movieApi.formatDate(movie.watchedAt)}
                          </div>
                        )}

                        {/* 操作按钮 */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedMovie(movie);
                              setRatingForm({ rating: movie.rating, review: movie.review });
                              setShowRateModal(true);
                            }}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 rounded-full text-sm font-medium hover:from-pink-600 hover:to-pink-700 transition-all active:scale-95"
                          >
                            ✏️ 编辑评分
                          </button>
                          <button
                            onClick={() => handleDelete(movie)}
                            className="px-4 bg-gray-200 text-gray-600 py-2 rounded-full text-sm font-medium hover:bg-gray-300 transition-all active:scale-95"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 添加按钮 */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-[100px] right-4 w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white text-3xl hover:from-purple-600 hover:to-purple-700 transition-all active:scale-90 animate-float"
      >
        ➕
      </button>

      <TabBar activeTab="movies" />

      {/* 添加观影记录弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999] animate-fade-in">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-heading font-bold text-gray-800">🎬 添加观影记录</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名称 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：肖申克的救赎"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  海报 URL (可选)
                </label>
                <input
                  type="url"
                  value={formData.poster}
                  onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                  placeholder="https://example.com/poster.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  类型
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, type: 'movie' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.type === 'movie'
                        ? 'bg-purple-100 text-purple-600 border-2 border-purple-500'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                    }`}
                  >
                    🎬 电影
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, type: 'tv' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.type === 'tv'
                        ? 'bg-purple-100 text-purple-600 border-2 border-purple-500'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                    }`}
                  >
                    📺 剧集
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreateMovie}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-full font-semibold hover:from-purple-600 hover:to-purple-700 transition-all active:scale-95"
              >
                ✨ 添加记录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 评分弹窗 */}
      {showRateModal && selectedMovie && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999] animate-fade-in">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-heading font-bold text-gray-800">⭐ 评分与影评</h3>
              <button
                onClick={() => {
                  setShowRateModal(false);
                  setSelectedMovie(null);
                  setRatingForm({ rating: 0, review: '' });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-1">{selectedMovie.title}</h4>
              <div className="text-xs text-gray-600">
                {movieApi.getTypeIcon(selectedMovie.type)} {movieApi.getTypeLabel(selectedMovie.type)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评分 (0-10 分)
              </label>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={ratingForm.rating}
                  onChange={(e) => setRatingForm({ ...ratingForm, rating: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <span 
                  className="text-2xl font-bold w-12 text-center"
                  style={{ color: getRatingColor(ratingForm.rating) }}
                >
                  {ratingForm.rating}
                </span>
              </div>
              <div className="text-center text-sm text-gray-600 mb-4">
                {movieApi.getRatingText(ratingForm.rating)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                影评 (可选)
              </label>
              <textarea
                value={ratingForm.review}
                onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
                placeholder="写下你的观后感..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
                maxLength={2000}
              />
            </div>

            <button
              onClick={handleRate}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-full font-semibold mt-6 hover:from-purple-600 hover:to-purple-700 transition-all active:scale-95"
            >
              💫 保存评分
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
