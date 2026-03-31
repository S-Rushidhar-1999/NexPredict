import { useEffect, useState } from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import Card from './Card';
import { Caller } from '../config';
import { getPrediction, getNextPredictionIndex, getUserPrediction } from '../utils';

const Homebody = ({ activeAccount }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      const nextPredictionIndex = await getNextPredictionIndex(Caller);

      const predictions = await Promise.all(
        Array.from({ length: nextPredictionIndex }).map(async (_, i) => {
          const p = await getPrediction(Caller, nextPredictionIndex - 1 - i);
          if (!p) return null;
          return { prediction: p, index: nextPredictionIndex - 1 - i };
        })
      );

      const predictionsWithUser = await Promise.all(
        predictions.map(async (prediction) => {
          if (!activeAccount) return prediction;
          const user = await getUserPrediction(Caller, activeAccount.address, prediction.index);
          return user ? { ...prediction, user } : prediction;
        })
      );

      setPredictions(predictionsWithUser);
      setLoading(false);
    };

    fetchPredictions();
  }, [activeAccount]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPredictions(predictions);
    } else if (selectedCategory === 'my_bets') {
      setFilteredPredictions(predictions.filter(p => p.user));
    } else {
      setFilteredPredictions(predictions.filter(p => p.prediction.category === selectedCategory));
    }
  }, [selectedCategory, predictions]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'politics', label: 'Politics' },
    { id: 'movies', label: 'Movies' },
    { id: 'airdrops', label: 'Airdrops' },
    { id: 'my_bets', label: 'My Bets' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 rounded-full bg-gray-800 text-sm font-medium mb-4">
              Powered by Algorand
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight">
              Predict the Future,<br />
              <span className="text-gray-400">Win Rewards</span>
            </h1>

            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Decentralized prediction markets on Algorand. Make predictions, place bets, and earn rewards.
            </p>

            <button
              onClick={() => document.getElementById("bets_section")?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition-colors"
            >
              Explore Markets
              <ChevronDown className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto pt-12">
              <div>
                <p className="text-3xl font-bold">{predictions.length}</p>
                <p className="text-sm text-gray-500">Markets</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {predictions.reduce((acc, p) => acc + Number(p.prediction.noOfUsers), 0)}
                </p>
                <p className="text-sm text-gray-500">Players</p>
              </div>
              <div>
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm text-gray-500">Live</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section id="bets_section" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-7 h-7" />
              <h2 className="text-3xl font-bold">Live Markets</h2>
            </div>
            <p className="text-gray-400">Choose your market and start predicting</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.id
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-3 border-gray-700 border-t-white rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Loading markets...</p>
            </div>
          ) : filteredPredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPredictions.map(({ prediction, user, index }) => (
                <Card key={index} index={index} prediction={prediction} user={user} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No markets found</h3>
              <p className="text-gray-400 text-sm">
                {selectedCategory === 'my_bets'
                  ? "You haven't placed any bets yet"
                  : "No predictions available in this category"}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Homebody;
