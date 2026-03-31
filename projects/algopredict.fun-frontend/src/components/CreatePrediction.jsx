import { useState } from "react";
import { APP_ADMIN, Caller, TXN_URL, algorandClient } from "../config";
import { toast } from "react-toastify";
import { getNextPredictionIndex } from "../utils";
import * as algosdk from "algosdk";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Image as ImageIcon, Tag } from "lucide-react";


export const CreatePrediction = ({ activeAccount, transactionSigner }) => {
  const [submitting, setSubmitting] = useState("");
  const [formData, setFormData] = useState({
    predictionTitle: "",
    predictionOption1: "",
    predictionOption2: "",
    predictionStartTime: "",
    predictionEndTime: "",
    predictionCategory: "movies",
    imageUrl: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      console.log("Form submitted:", formData);

      if (formData.predictionStartTime === "" || formData.predictionEndTime === "") {
        toast.error("Please select prediction start and end time");
        return;
      }

      if (new Date(formData.predictionStartTime).getTime() > new Date(formData.predictionEndTime).getTime()) {
        toast.error("Prediction start time cannot be greater than prediction end time");
        return;
      }

      if (formData.predictionTitle.length < 1) {
        toast.error("Please enter prediction title");
        return;
      }

      if (formData.predictionOption1.length < 1) {
        toast.error("Please enter prediction option 1");
        return;
      }

      if (formData.predictionOption2.length < 1) {
        toast.error("Please enter prediction option 2");
        return;
      }

      if (formData.imageUrl.length < 1) {
        toast.error("Please enter image URL");
        return;
      }

      if (activeAccount) {
        if (activeAccount.address === APP_ADMIN) {
          console.log("✓ Admin check passed. Connected as:", activeAccount.address);
          console.log("✓ Expected admin:", APP_ADMIN);
          const predictionStartTime = Math.floor(new Date(formData.predictionStartTime).getTime() / 1000);
          const predictionEndTime = Math.floor(new Date(formData.predictionEndTime).getTime() / 1000);

          const currentTime = Math.floor(Date.now() / 1000);

          if (predictionStartTime >= predictionEndTime) {
            toast.error("Start time must be before end time");
            return;
          }

          const timeDiff = predictionEndTime - predictionStartTime;
          if (timeDiff < 60) {
            toast.error("Prediction duration must be at least 1 minute");
            return;
          }

          if (predictionStartTime < currentTime) {
            const proceed = window.confirm("Warning: Start time is in the past. The prediction will start immediately. Continue?");
            if (!proceed) return;
          }

          console.log("Current time:", currentTime);
          console.log("Start timestamp:", predictionStartTime, "End timestamp:", predictionEndTime, "Diff:", timeDiff);
          console.log("Start < End?", predictionStartTime < predictionEndTime);
          toast.info("Creating prediction...");

          const nextPredictionIndex = await getNextPredictionIndex(Caller);
          console.log("Next prediction index:", nextPredictionIndex);
          setSubmitting("Sign Transaction...");
          toast.info("Sign Transaction...");
          const encoder = new TextEncoder();
          const atc = await Caller.compose()
            .addPrediction(
              {
                question: formData.predictionTitle,
                option1Name: formData.predictionOption1,
                option2Name: formData.predictionOption2,
                startsAt: predictionStartTime,
                endsAt: predictionEndTime,
                category: formData.predictionCategory,
                image: formData.imageUrl,
              },
              { sender: { addr: activeAccount.address, signer: transactionSigner }, boxes: [{ appIndex: 0, name: algosdk.bigIntToBytes(nextPredictionIndex, 8) }], note: encoder.encode(`create-${formData.predictionCategory}`) }
            )
            .atc();

          await atc.gatherSignatures();
          setSubmitting("Submiting Transaction...");

          const newPredictionCreation = await atc.execute(algorandClient.client.algod, 3);
          console.log(newPredictionCreation);
          toast.success("Prediction created successfully", { onClick: () => window.open(`${TXN_URL}${newPredictionCreation.txIDs[0]}`) });
          setSubmitting("");
          navigate("/");

        } else {
          setSubmitting("");
          toast.error("You are not authorized to create a prediction");
        }
      } else {
        setSubmitting("");
        toast.error("Please connect your wallet to create a prediction");
      }
    } catch (error) {
      console.error(error);
      setSubmitting("");

      if (error.message && error.message.includes("assert failed")) {
        toast.error("Transaction failed: Contract assertion error. Please check start/end times are valid.");
      } else if (error.message && error.message.includes("logic eval error")) {
        toast.error("Smart contract error: " + error.message);
      } else if (error.message) {
        toast.error("Error: " + error.message);
      } else {
        toast.error("An error occurred while creating prediction");
      }
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Create Prediction</h2>
            <p className="text-gray-400">Set up a new prediction market</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="predictionTitle" className="block text-sm font-medium text-gray-300 mb-2">
                Prediction Question
              </label>
              <input
                type="text"
                id="predictionTitle"
                value={formData.predictionTitle}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#1a1a20] border border-gray-700 rounded-lg focus:outline-none focus:border-gray-600 text-white"
                placeholder="What will happen?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="predictionOption1" className="block text-sm font-medium text-gray-300 mb-2">
                  Option 1
                </label>
                <input
                  type="text"
                  id="predictionOption1"
                  value={formData.predictionOption1}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#1a1a20] border border-gray-700 rounded-lg focus:outline-none focus:border-gray-600 text-white"
                  placeholder="First option"
                />
              </div>

              <div>
                <label htmlFor="predictionOption2" className="block text-sm font-medium text-gray-300 mb-2">
                  Option 2
                </label>
                <input
                  type="text"
                  id="predictionOption2"
                  value={formData.predictionOption2}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#1a1a20] border border-gray-700 rounded-lg focus:outline-none focus:border-gray-600 text-white"
                  placeholder="Second option"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="predictionStartTime" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="predictionStartTime"
                  value={formData.predictionStartTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#1a1a20] border border-gray-700 rounded-lg focus:outline-none focus:border-gray-600 text-white"
                />
              </div>

              <div>
                <label htmlFor="predictionEndTime" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="predictionEndTime"
                  value={formData.predictionEndTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#1a1a20] border border-gray-700 rounded-lg focus:outline-none focus:border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="predictionCategory" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <select
                id="predictionCategory"
                value={formData.predictionCategory}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#1a1a20] border border-gray-700 rounded-lg focus:outline-none focus:border-gray-600 text-white"
              >
                <option value="movies">Movies</option>
                <option value="politics">Politics</option>
                <option value="airdrops">Airdrops</option>
              </select>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Thumbnail Image URL
              </label>
              <input
                type="text"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#1a1a20] border border-gray-700 rounded-lg focus:outline-none focus:border-gray-600 text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <button
              type="submit"
              disabled={submitting !== ""}
              className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting === "" ? "Create Prediction" : submitting}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
