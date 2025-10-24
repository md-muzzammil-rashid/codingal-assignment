import { useState, useEffect } from "react"
import { analyzeCode, getCodeQualityScore, getCodeSuggestions } from "../lib/code-analysis-engine"
import {Code2, CircleAlert, Lightbulb, Check} from "lucide-react"
interface CodePanelProps {
  code: string
  onChangeCorrectness: (score: number) => void
  onChangeHint: (hintsUsed: number) => void
}
export default function CodeAnalysisPanel({ code, onChangeCorrectness, onChangeHint }:CodePanelProps) {
  const issues = analyzeCode(code)
  const qualityScore = getCodeQualityScore(code)
  const suggestions = getCodeSuggestions(code)

  const allHints = [
    ...issues.map((issue) => ({
      type: "issue",
      severity: issue.severity,
      message: issue.message,
      line: issue.line,
      column: issue.column,
      rule: issue.rule,
    })),
    ...suggestions.map((suggestion) => ({
      type: "tip",
      message: suggestion,
    })),
  ]

  const errorCount = issues.filter((i) => i.severity === "error").length
  const warningCount = issues.filter((i) => i.severity === "warning").length
  const infoCount = issues.filter((i) => i.severity === "info").length

  const [viewedHintIndices, setViewedHintIndices] = useState(new Set())
  const [totalHintsUsed, setTotalHintsUsed] = useState(0)
  const [codeVersion, setCodeVersion] = useState(code) // Track code changes

  const handleHintClick = () => {
    const nextUnviewedIndex = allHints.findIndex((_, idx) => !viewedHintIndices.has(idx))

    if (nextUnviewedIndex !== -1) {
      const newViewed = new Set(viewedHintIndices)
      newViewed.add(nextUnviewedIndex)
      setViewedHintIndices(newViewed)
      setTotalHintsUsed(totalHintsUsed + 1)
      onChangeHint(totalHintsUsed + 1)
    }
  }

  useEffect(() => {
    if (code !== codeVersion) {
      setViewedHintIndices(new Set())
      setCodeVersion(code)
    }
  }, [code, codeVersion])

  const getIssueIcon = (rule:string) => {
    if (rule === "error")
      return (
        <CircleAlert color='red'/>
      )
    if (rule === "warning")
      return (
        <CircleAlert color='yellow'/>
      )
    return (
      <CircleAlert color='blue'/>
    )
  }

  const getQualityLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-blue-600" }
    if (score >= 60) return { label: "Good", color: "text-yellow-600" }
    if (score >= 40) return { label: "Fair", color: "text-orange-600" }
    return { label: "Needs Work", color: "text-red-600" }
  }

  const qualityLevel = getQualityLevel(qualityScore)
  const isAllHintsViewed = viewedHintIndices.size === allHints.length && allHints.length > 0


  useEffect(() => {    onChangeCorrectness(qualityScore)
  }, [qualityScore])
  if (code.trim() === "") return null



  return (
    <div className="space-y-4">
      <div className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Code2 color="blue" />
            <span className="text-base font-semibold text-gray-900">Code Analysis</span>
          </div>

          <div className="text-right">
            <div className={`text-2xl font-bold ${qualityLevel.color}`}>{qualityScore}</div>
            <div className="text-xs text-gray-500">{qualityLevel.label}</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 pb-2">Real-time feedback</p>

        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-red-100 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-red-600">{errorCount}</div>
            <div className="text-xs text-gray-500">Errors</div>
          </div>
          <div className="bg-yellow-100 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-yellow-600">{warningCount}</div>
            <div className="text-xs text-gray-500">Warnings</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-blue-600">{infoCount}</div>
            <div className="text-xs text-gray-500">Info</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
          <button
            onClick={handleHintClick}
            disabled={isAllHintsViewed}
            className={`px-3 py-1.5 text-white text-xs font-medium rounded transition-colors ${
              isAllHintsViewed ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            💡 Hint
          </button>
          <div className="text-xs text-gray-600">
            <span className="font-semibold">{totalHintsUsed}</span>
            <span className="text-gray-500"> hints used (use hint to get issues)</span>
          </div>
          {allHints.length > 0 && (
            <div className="text-xs text-gray-500 ml-auto">
              {viewedHintIndices.size} / {allHints.length}
            </div>
          )}
        </div>

        {allHints.length > 0 && viewedHintIndices.size > 0 && (
          <div className="mb-4 space-y-2">
            <h4 className="font-semibold text-xs text-gray-900">Available Hints:</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Array.from(viewedHintIndices).map((idx) => {
                // @ts-ignore
                const hint = allHints[idx]
                
                return (
                  // @ts-ignore
                  <div key={idx} className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-2">
                      {hint.type === "issue" ? (
                        <>
                          {getIssueIcon(hint.severity)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 mb-1">
                              {hint.severity === "error"
                                ? "Error"
                                : hint.severity === "warning"
                                  ? "Warning"
                                  : "Info"}
                            </p>
                            {hint.line && <p className="text-xs text-gray-600 mb-1">Line {hint.line}:{hint.column}</p>}
                            <p className="text-xs text-gray-700">{hint.message}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Lightbulb color="orange" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-900 mb-1">Tip</p>
                            <p className="text-xs text-gray-700">{hint.message}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {issues.length === 0 && suggestions.length === 0 && (
          <div className="text-center flex justify-center items-center flex-col py-3">
            <Check color="green" />
            <p className="text-xs text-gray-500">Great code!</p>
          </div>
        )}
      </div>
    </div>
  )
}
