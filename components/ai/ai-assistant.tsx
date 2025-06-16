"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, FileText, GitCommit, Lightbulb, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIAssistantProps {
  projectId: string
  context?: "docs" | "commits" | "tasks" | "general"
}

export function AIAssistant({ projectId, context = "general" }: AIAssistantProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const { toast } = useToast()

  const contextSuggestions = {
    docs: [
      "Generate API documentation for this project",
      "Create a getting started guide",
      "Write deployment instructions",
      "Generate troubleshooting guide",
    ],
    commits: [
      "Analyze recent commit patterns",
      "Suggest code review improvements",
      "Generate release notes",
      "Identify potential issues",
    ],
    tasks: [
      "Break down this epic into smaller tasks",
      "Suggest task priorities",
      "Generate acceptance criteria",
      "Estimate task complexity",
    ],
    general: ["Analyze project health", "Suggest improvements", "Generate project summary", "Identify bottlenecks"],
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      // Simulate AI generation (replace with actual AI API call)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockSuggestions = [
        "Based on your project structure, consider implementing automated testing",
        "Your commit history shows good practices, but consider more descriptive commit messages",
        "Documentation could be improved with more code examples",
        "Consider adding error handling to your main components",
      ]

      setSuggestions(mockSuggestions)

      toast({
        title: "AI Analysis Complete",
        description: "Generated suggestions based on your project data.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getContextIcon = () => {
    switch (context) {
      case "docs":
        return FileText
      case "commits":
        return GitCommit
      case "tasks":
        return Lightbulb
      default:
        return Sparkles
    }
  }

  const ContextIcon = getContextIcon()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ContextIcon className="h-5 w-5 text-primary" />
          <CardTitle>AI Assistant</CardTitle>
          <Badge variant="secondary">Beta</Badge>
        </div>
        <CardDescription>Get AI-powered insights and suggestions for your project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Ask AI to analyze your project, generate documentation, or provide suggestions..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>

        {/* Quick suggestions */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {contextSuggestions[context].map((suggestion, index) => (
              <Button key={index} variant="outline" size="sm" onClick={() => setPrompt(suggestion)} className="text-xs">
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">AI Suggestions:</p>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
