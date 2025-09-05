"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Database,
  Brain,
  
  Github,
  ExternalLink,
  Music,

  Target,
  Award,
  Code,
  Server,
  Globe,
} from "lucide-react"

const genres = [
  { name: "Classical", accuracy: 95, color: "bg-blue-500" },
  { name: "Jazz", accuracy: 90, color: "bg-purple-500" },
  { name: "Metal", accuracy: 90, color: "bg-red-500" },
  { name: "Blues", accuracy: 85, color: "bg-indigo-500" },
  { name: "Pop", accuracy: 80, color: "bg-pink-500" },
  { name: "Rock", accuracy: 75, color: "bg-orange-500" },
  { name: "Country", accuracy: 70, color: "bg-yellow-500" },
  { name: "Reggae", accuracy: 55, color: "bg-green-500" },
]

const features = [
  "MFCCs (Mel-frequency cepstral coefficients)",
  "Chroma features",
  "Spectral Contrast",
  "Tonnetz representation",
  "RMS Energy",
  "Zero-Crossing Rate",
  "Tempo extraction",
]

export default function ProjectInfo() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Removed modal wrapper and button, displaying content directly */}
      <div className="space-y-6">
        {/* Project Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Music Genre Detector
                </h2>
                <p className="text-right text-sm   bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent"> ~ By Aaliaa Wadkar</p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <Card className="glass dark:glass-dark border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Project Overview
            </CardTitle>
            <CardDescription>
              An end-to-end Music Genre Classification System that predicts genres from audio files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                <div className="text-2xl font-bold text-blue-600">10</div>
                <div className="text-xs text-muted-foreground">Genres</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <div className="text-2xl font-bold text-purple-600">80%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-pink-500/10 to-red-500/10">
                <div className="text-2xl font-bold text-pink-600">SVM</div>
                <div className="text-xs text-muted-foreground">Best Model</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-teal-500/10">
                <div className="text-2xl font-bold text-green-600">Live</div>
                <div className="text-xs text-muted-foreground">Deployed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dataset & Features */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass dark:glass-dark border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                
                  Dataset & Features
                
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() =>
                    window.open(
                      "https://www.kaggle.com/datasets/andradaolteanu/gtzan-dataset-music-genre-classification?select=Data",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                <Badge variant="secondary" className="mb-2">
                  GTZAN Dataset
                </Badge>
                </span>
                <p className="text-sm text-muted-foreground">1000 audio tracks across 10 genres, 30 seconds each</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Extracted Features:</h4>
                <div className="space-y-1">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass dark:glass-dark border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Model Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {genres.map((genre) => (
                  <div key={genre.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{genre.name}</span>
                      <span className="font-medium">{genre.accuracy}%</span>
                    </div>
                    <Progress value={genre.accuracy} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Information */}
        <Card className="glass dark:glass-dark border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-green-500" />
              API Information
            </CardTitle>
            <CardDescription>RESTful API for music genre classification with multipart file upload</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-sm">Base URL</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs break-all">
                  https://music-genre-detection-api-yv06.onrender.com
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-sm">Endpoint</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      POST
                    </Badge>
                    <code>/predict</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Request Format</h4>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="text-xs text-muted-foreground">Content-Type: multipart/form-data</div>
                <div className="text-xs">
                  <span className="text-blue-600">file</span>: Audio file (.mp3, .wav, .m4a)
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Response Format</h4>
              <pre className="bg-muted/50 rounded-lg p-3 font-mono text-xs overflow-x-auto whitespace-pre">
      {`{
        "predicted_genre": "jazz",
        "confidence": 97.84,
        "all_probabilities": {
        "blues": 0.003187843913445846,
        "classical": 0.0002721166382115396,
        "country": 0.0009048546547070001,
        "disco": 0.001964744238376213,
        "hiphop": 0.0003845549953317146,
        "jazz": 0.9783513192004596,
        "metal": 0.0019130558225284562,
        "pop": 0.000281538108717745,
        "reggae": 0.002955505595429195,
        "rock": 0.009784466832792552
        }
      }`}
              </pre>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-teal-500/10">
                <div className="text-lg font-bold text-green-600">REST</div>
                <div className="text-xs text-muted-foreground">API Type</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                <div className="text-lg font-bold text-blue-600">JSON</div>
                <div className="text-xs text-muted-foreground">Response</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <div className="text-lg font-bold text-purple-600">30s</div>
                <div className="text-xs text-muted-foreground">Optimal Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Learnings */}
        <Card className="glass dark:glass-dark border-white/10 relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Key Learnings
            </CardTitle>
            <CardDescription>Highlights of important insights gained during this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 relative overflow-hidden">
          <div>
            <h4 className="font-medium text-sm bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Feature Consistency</h4>
            <p className="text-xs text-muted-foreground">
              Extracted MFCCs, chroma, contrast, tonnetz etc., and kept training + inference feature order identical to avoid mismatch bugs.
            </p>
          </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-teal-500/10 relative overflow-hidden">
          <div>
            <h4 className="font-medium text-sm bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Modeling & Analysis</h4>
            <p className="text-xs text-muted-foreground">
              Tried RF / KNN / LogReg / SVM; SVM (RBF) gave the best result (~80%). Used confusion matrices to find which genres need more data.
            </p>
          </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-teal-500/10 to-green-500/10 relative overflow-hidden">
          <div>
            <h4 className="font-medium text-sm bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">Production Readiness</h4>
            <p className="text-xs text-muted-foreground">
              Saved scaler + model, added probability/confidence output, pinned dependencies and tested the FastAPI locally before deploying to Render.
            </p>
          </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <a href="https://github.com/aaliawadkar1211/music-genre-detection-api" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4 mr-2" />
              View Source Code
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 border-purple-500/30 hover:border-purple-500/50 bg-transparent"
          >
            <a href="https://music-genre-detection-api-yv06.onrender.com/docs" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              API Documentation
            </a>
          </Button>
        </div>
      </div>
    </>
  )
}
