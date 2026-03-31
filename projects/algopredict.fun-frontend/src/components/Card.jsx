import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Trophy, Clock, ArrowRight } from 'lucide-react';
import algosdk from 'algosdk';
import { formatAmount } from '../utils';

const Card = (props) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [predictionStatus, setPredictionStatus] = useState("");
  const [status, setStatus] = useState("upcoming");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const startTime = new Date(Number(props.prediction.startsAt) * 1000).getTime();
      const endTime = new Date(Number(props.prediction.endsAt) * 1000).getTime();

      let timeDiff;
      let text;
      if (now < startTime) {
        timeDiff = startTime - now;
        text = "Starts in ";
        setPredictionStatus("View");
        setStatus("upcoming");
      } else if (now < endTime) {
        timeDiff = endTime - now;
        text = "Ends in ";
        setPredictionStatus("Bet Now");
        setStatus("live");
      } else {
        timeDiff = 0;
        text = "Ended";
        setPredictionStatus("Results");
        setStatus("ended");
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeLeft(
        timeDiff == 0
          ? text
          : `${text}${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [props.prediction.startsAt, props.prediction.endsAt]);

  const statusColors = {
    upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    live: 'bg-green-500/20 text-green-400 border-green-500/30',
    ended: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div
      className="group cursor-pointer bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-all overflow-hidden"
      onClick={() => navigate(`/prediction/${props.index}`)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={props.prediction.image}
          alt={props.prediction.question}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/50 to-transparent" />

        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {props.user && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Your Bet
            </span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        <h3 className="text-base font-semibold text-white line-clamp-2 min-h-[3rem]">
          {props.prediction.question}
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs">Players</span>
            </div>
            <p className="text-sm font-semibold text-white">{Number(props.prediction.noOfUsers)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="text-xs">Your Bet</span>
            </div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold text-white">
                {props.user ? algosdk.microalgosToAlgos(Number(props.user.amount)).toFixed(2) : "0"}
              </p>
              {props.user && (
                <svg xmlns="http://www.w3.org/2000/svg" height="10px" fill="#fff" viewBox="0 0 113 113.4">
                  <polygon points="19.6 113.4 36 85 52.4 56.7 68.7 28.3 71.4 23.8 72.6 28.3 77.6 47 72 56.7 55.6 85 39.3 113.4 58.9 113.4 75.3 85 83.8 70.3 87.8 85 95.4 113.4 113 113.4 105.4 85 97.8 56.7 95.8 49.4 108 28.3 90.2 28.3 89.6 26.2 83.4 3 82.6 0 65.5 0 65.1 0.6 49.1 28.3 32.7 56.7 16.4 85 0 113.4 19.6 113.4" />
                </svg>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-xs">Pool</span>
            </div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold text-white">
                {formatAmount(
                  algosdk.microalgosToAlgos(
                    Number(props.prediction.option1SharesBhougth) +
                    Number(props.prediction.option2SharesBhougth)
                  )
                )}
              </p>
              <svg xmlns="http://www.w3.org/2000/svg" height="10px" fill="#fff" viewBox="0 0 113 113.4">
                <polygon points="19.6 113.4 36 85 52.4 56.7 68.7 28.3 71.4 23.8 72.6 28.3 77.6 47 72 56.7 55.6 85 39.3 113.4 58.9 113.4 75.3 85 83.8 70.3 87.8 85 95.4 113.4 113 113.4 105.4 85 97.8 56.7 95.8 49.4 108 28.3 90.2 28.3 89.6 26.2 83.4 3 82.6 0 65.5 0 65.1 0.6 49.1 28.3 32.7 56.7 16.4 85 0 113.4 19.6 113.4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs">{timeLeft}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === 'live'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}>
            {predictionStatus}
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
