import { useState, useEffect, useRef } from "react";
import CodeAnalysisPanel from "./CodeAnalysisPanel";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAttempt } from "../api/services";
import { useParams } from "react-router-dom";
import { getCodeQualityScore } from "../lib/code-analysis-engine";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

export default function CodeEditor({ code, onChange }: CodeEditorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [timer, setTimer] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [correctness, setCorrectness] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const params = useParams();
  const queryClient = useQueryClient();
  const lessonId = params.id as string;

  const handleAttemptSubmitMutation = useMutation({
    // @ts-ignore
    mutationFn: (data) => submitAttempt(data),
    mutationKey: ["submitAttempt"],
    onSuccess: () => {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      queryClient.invalidateQueries({ queryKey: ["lessonDetail", lessonId] });
    },
  });

  const handleSubmit = () => {
    if (!correctness) setCorrectness(getCodeQualityScore(code));
    const data = {
      student: "1",
      lesson: lessonId,
      correctness: correctness / 100,
      hints_used: hintsUsed,
      duration_sec: timer,
      timestamp: new Date().toISOString(),
    };
    // @ts-ignore 
    handleAttemptSubmitMutation.mutate(data);
    setIsRunning(false);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      // @ts-ignore 
      clearInterval(timerRef.current);
    }
    return () => {
      // @ts-ignore 
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimer(0);
  };

  useEffect(() => {
    console.log(correctness, hintsUsed, timer);
  }, [correctness, hintsUsed, timer]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Code Editor</h3>

        <div className="flex items-center justify-between bg-muted p-3 rounded-lg border border-border">
          <span className="font-mono text-sm">{formatTime(timer)}</span>
          <div className="space-x-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-3 py-1 text-xs rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {isRunning ? "Pause" : "Resume"}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-xs px-3 py-1 bg-blue-500 text-white rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          Analyze
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-2">
          <div className="bg-muted rounded-lg overflow-hidden border border-border">
            <textarea
              value={code}
              onChange={(e) => {
                onChange(e.target.value);
                setIsRunning(true);
              }}
              className="w-full h-96 p-4 bg-muted text-foreground font-mono text-sm resize-none focus:outline-none"
              placeholder="// Write your code here"
            />
          </div>
        </div>


        {showSuggestions && (
          <div className="lg:col-span-1">
            {" "}
            <CodeAnalysisPanel
              onChangeCorrectness={setCorrectness}
              onChangeHint={setHintsUsed}
              code={code}
            />{" "}
          </div>
        )}
      </div>
      {showSuccessMessage && (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg">
          Your solution has been submitted successfully!
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSubmit}
          disabled={handleAttemptSubmitMutation.isPending || code.trim() === ""}
          className={`flex-1 px-4 py-3 rounded text-white font-semibold transition ${
            handleAttemptSubmitMutation.isPending
              ? "bg-green-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {handleAttemptSubmitMutation.isPending
            ? "Submitted!"
            : "Submit Solution"}
        </button>

        <button
          onClick={() => onChange("")}
          className="flex-1 px-4 py-3 rounded border border-gray-300 hover:bg-gray-100 font-semibold"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
