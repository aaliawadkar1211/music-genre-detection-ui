"use client"

import { useState } from "react"
import GenreClient from "@/components/genre-client"
import ProjectInfo from "@/components/project-info"
import { Button } from "@/components/ui/button"
import { Music, Info } from "lucide-react"

export default function Page() {
  const [activeTab, setActiveTab] = useState<"classifier" | "about">("classifier")

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl sm:blur-3xl animate-float" />
        <div
          className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-2xl sm:blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <div className="relative z-10">
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 lg:py-20">
          <header className="text-center mb-8 sm:mb-12 lg:mb-16">

            <h1 className="text-pretty text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6">
              Music Genre Classifier
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0 mb-6 sm:mb-8">
              Upload your audio or record live to discover the genre with our advanced AI model. Experience real-time
              audio visualization and instant predictions.
            </p>

            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="glass dark:glass-dark rounded-full p-1 border border-white/10">
                <div className="flex gap-1">
                  <Button
                    onClick={() => setActiveTab("classifier")}
                    variant={activeTab === "classifier" ? "default" : "ghost"}
                    size="lg"
                    className={`rounded-full px-4 sm:px-6 transition-all duration-300 ${
                      activeTab === "classifier"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <Music className="w-4 h-4 mr-2" />
                    Classifier
                  </Button>
                  <Button
                    onClick={() => setActiveTab("about")}
                    variant={activeTab === "about" ? "default" : "ghost"}
                    size="lg"
                    className={`rounded-full px-4 sm:px-6 transition-all duration-300 ${
                      activeTab === "about"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    About
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div className="glass dark:glass-dark rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 xl:p-12 shadow-xl sm:shadow-2xl animate-glow">
            {activeTab === "classifier" ? <GenreClient /> : <ProjectInfo />}
          </div>
        </section>
      </div>
    </main>
  )
}
