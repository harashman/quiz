'use client';

import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, RotateCcw, Plus, FolderOpen, Trash2, BookOpen } from 'lucide-react';

export default function QuizApp() {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [view, setView] = useState('projects');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    try {
      const stored = localStorage.getItem('quizProjects');
      if (stored) {
        setProjects(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const saveProjects = (updatedProjects) => {
    try {
      localStorage.setItem('quizProjects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  };

  const deleteProject = (projectId) => {
    const updated = projects.filter(p => p.id !== projectId);
    saveProjects(updated);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const allQuestions = [];
    
    for (const file of files) {
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (data.multiple_choice && Array.isArray(data.multiple_choice)) {
          allQuestions.push(...data.multiple_choice);
        }
      } catch (error) {
        alert(`Errore nel file ${file.name}: ${error.message}`);
      }
    }

    if (allQuestions.length === 0) {
      alert('Nessuna domanda valida trovata nei file');
      return;
    }

    const projectName = prompt('Nome del progetto:', 'Nuovo Quiz');
    if (!projectName) return;

    const project = {
      id: Date.now().toString(),
      name: projectName,
      questions: allQuestions,
      createdAt: new Date().toISOString()
    };

    const updated = [...projects, project];
    saveProjects(updated);
  };

  const startSession = (project) => {
    const shuffled = [...project.questions].sort(() => Math.random() - 0.5);
    const sessionQuestions = shuffled.slice(0, Math.min(20, shuffled.length));
    
    setCurrentProject(project);
    setSession({
      questions: sessionQuestions,
      startedAt: new Date().toISOString()
    });
    setCurrentQuestionIndex(0);
    setAnswers({});
    setView('quiz');
  };

  const handleAnswer = (questionId, optionIndex, correctAnswer) => {
    const isCorrect = optionIndex === correctAnswer;
    setAnswers({
      ...answers,
      [questionId]: { selected: optionIndex, correct: isCorrect }
    });

    setTimeout(() => {
      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setView('recap');
      }
    }, 1200);
  };

  const resetSession = () => {
    setSession(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setView('projects');
    setCurrentProject(null);
  };

  // Projects view
  if (view === 'projects') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-1 sm:mb-2">I Miei Quiz</h1>
            <p className="text-sm sm:text-base text-slate-600">Gestisci i tuoi progetti di studio</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <label className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 sm:p-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center group min-h-[160px]">
              <Plus className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 group-hover:text-indigo-500 mb-2 sm:mb-3" />
              <span className="text-sm sm:text-base text-slate-600 group-hover:text-indigo-600 font-medium">Nuovo Progetto</span>
              <input type="file" accept=".json" multiple onChange={handleFileUpload} className="hidden" />
            </label>

            {projects.map(project => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-all min-h-[160px] flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-500" />
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 line-clamp-2">{project.name}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4">{project.questions.length} domande</p>
                <button
                  onClick={() => startSession(project)}
                  className="mt-auto w-full py-2.5 sm:py-2 bg-indigo-600 text-white text-sm sm:text-base rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Inizia Sessione
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quiz view
  if (view === 'quiz' && session) {
    const question = session.questions[currentQuestionIndex];
    const answer = answers[question.id];
    const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm font-medium text-slate-600">
                Domanda {currentQuestionIndex + 1} di {session.questions.length}
              </span>
              <button
                onClick={resetSession}
                className="text-xs sm:text-sm text-slate-500 hover:text-slate-700 px-2 py-1"
              >
                Esci
              </button>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 mb-6 sm:mb-8 leading-relaxed">{question.q}</h2>

            <div className="space-y-2.5 sm:space-y-3">
              {question.o && question.o.map((option, idx) => {
                const isSelected = answer?.selected === idx;
                const isCorrect = idx === question.a;
                const showFeedback = answer !== undefined;

                let className = "relative p-3.5 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-300 ";
                
                if (!showFeedback) {
                  className += "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 active:scale-98";
                } else if (isCorrect) {
                  className += "border-green-200 bg-green-50 animate-bounce-subtle";
                } else if (isSelected) {
                  className += "border-red-200 bg-red-50 animate-shake-subtle";
                } else {
                  className += "border-slate-200 opacity-50";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !showFeedback && handleAnswer(question.id, idx, question.a)}
                    disabled={showFeedback}
                    className={className}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm sm:text-base text-slate-700 text-left flex-1 leading-relaxed">{option}</span>
                      {showFeedback && isCorrect && (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                      )}
                      {showFeedback && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Recap view
  if (view === 'recap' && session) {
    const correctCount = Object.values(answers).filter(a => a.correct).length;
    const totalCount = session.questions.length;
    const percentage = ((correctCount / totalCount) * 100).toFixed(1);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 sm:mb-6">Riepilogo Sessione</h1>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-indigo-700">{correctCount}</div>
                <div className="text-xs sm:text-sm text-indigo-600 mt-1">Corrette</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-700">{totalCount - correctCount}</div>
                <div className="text-xs sm:text-sm text-red-600 mt-1">Sbagliate</div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-700">{percentage}%</div>
                <div className="text-xs sm:text-sm text-slate-600 mt-1">Punteggio</div>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
              {session.questions.map((question, idx) => {
                const answer = answers[question.id];
                const isCorrect = answer?.correct;

                return (
                  <div
                    key={question.id}
                    className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${
                      isCorrect 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                        isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-slate-800 mb-2 leading-relaxed">{question.q}</p>
                        <div className="text-xs sm:text-sm space-y-1">
                          <p className="text-slate-600">
                            <span className="font-medium">Tua risposta:</span> {question.o[answer?.selected]}
                          </p>
                          {!isCorrect && (
                            <p className="text-green-700">
                              <span className="font-medium">Risposta corretta:</span> {question.o[question.a]}
                            </p>
                          )}
                        </div>
                      </div>
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => startSession(currentProject)}
                className="flex-1 py-3 sm:py-3 bg-indigo-600 text-white rounded-lg sm:rounded-xl hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                Nuova Sessione
              </button>
              <button
                onClick={resetSession}
                className="flex-1 py-3 sm:py-3 bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl hover:bg-slate-300 transition-colors font-medium text-sm sm:text-base"
              >
                Torna ai Progetti
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}