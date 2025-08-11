import React, { useState, useEffect } from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { BookOpen, Users, Award, Globe, Play, CheckCircle2, ArrowRight, Star, Trophy } from 'lucide-react';
import './App.css';

function App() {
  const [languages, setLanguages] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [currentSection, setCurrentSection] = useState('overview');
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [userProgress, setUserProgress] = useState({});

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/languages`);
      const data = await response.json();
      setLanguages(data.languages);
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const fetchExercises = async (languageId, section = 'vocabulary', level = 'basic') => {
    try {
      const response = await fetch(`${backendUrl}/api/languages/${languageId}/exercises?section=${section}&level=${level}`);
      const data = await response.json();
      setExercises(data.exercises);
      setCurrentExercise(0);
      setScore(0);
      setShowResult(false);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleLanguageSelect = (languageId) => {
    setSelectedLanguage(languageId);
    setCurrentSection('overview');
  };

  const handleSectionSelect = (section) => {
    setCurrentSection(section);
    if (section === 'exercises' && selectedLanguage) {
      fetchExercises(selectedLanguage);
    }
  };

  const handleAnswerSubmit = () => {
    if (!userAnswer) return;

    const isCorrect = userAnswer === exercises[currentExercise].correct_answer;
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowResult(true);

    setTimeout(() => {
      if (currentExercise + 1 < exercises.length) {
        setCurrentExercise(currentExercise + 1);
        setUserAnswer('');
        setShowResult(false);
      } else {
        alert(`Parabéns! Você completou os exercícios com ${score + (isCorrect ? 1 : 0)}/${exercises.length} acertos!`);
        setCurrentSection('overview');
      }
    }, 2000);
  };

  const renderLanguageGrid = () => {
    const languageKeys = Object.keys(languages);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative container mx-auto px-6 text-center">
            <div className="mb-8">
              <img 
                src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwzfHxsYW5ndWFnZSUyMGxlYXJuaW5nfGVufDB8fHx8MTc1NDg3NTc3OHww&ixlib=rb-4.1.0&q=85"
                alt="Love to Learn"
                className="w-32 h-32 object-cover rounded-full mx-auto mb-6 border-4 border-white/20"
              />
            </div>
            <h1 className="text-5xl font-bold mb-6">Brasil Poliglotas</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Domine 6 idiomas e torne-se fluente do zero com nossa plataforma completa de aprendizado
            </p>
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="text-center">
                <Globe className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">6 Idiomas</p>
              </div>
              <div className="text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Lições Estruturadas</p>
              </div>
              <div className="text-center">
                <Award className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Certificados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Languages Section */}
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Escolha seu Idioma
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {languageKeys.map((langKey) => {
              const lang = languages[langKey];
              return (
                <Card 
                  key={langKey} 
                  className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 hover:border-blue-300 bg-white/80 backdrop-blur-sm"
                  onClick={() => handleLanguageSelect(langKey)}
                >
                  <div className="p-8 text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {lang.flag}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">{lang.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">Básico ao Avançado</span>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Alfabeto + Vocabulário + Exercícios
                      </Badge>
                    </div>
                    <Button className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300">
                      Começar Agora
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Features Section */}
          <div className="mt-20 bg-gray-50 rounded-3xl p-12">
            <h3 className="text-2xl font-bold text-center mb-12 text-gray-800">
              Por que Brasil Poliglotas?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1589395937658-0557e7d89fad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHw0fHxsYW5ndWFnZSUyMGxlYXJuaW5nfGVufDB8fHx8MTc1NDg3NTc3OHww&ixlib=rb-4.1.0&q=85"
                  alt="Learning Together"
                  className="w-24 h-24 object-cover rounded-full mx-auto mb-4"
                />
                <h4 className="text-lg font-semibold mb-2">Aprendizado Colaborativo</h4>
                <p className="text-gray-600">Aprenda com outras pessoas e compartilhe seu progresso</p>
              </div>
              <div className="text-center">
                <img 
                  src="https://images.pexels.com/photos/247819/pexels-photo-247819.jpeg"
                  alt="Learn"
                  className="w-24 h-24 object-cover rounded-full mx-auto mb-4"
                />
                <h4 className="text-lg font-semibold mb-2">Método Estruturado</h4>
                <p className="text-gray-600">Do alfabeto à fluência com lições organizadas</p>
              </div>
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxlZHVjYXRpb258ZW58MHx8fHwxNzU0NzU3ODY2fDA&ixlib=rb-4.1.0&q=85"
                  alt="Library"
                  className="w-24 h-24 object-cover rounded-full mx-auto mb-4"
                />
                <h4 className="text-lg font-semibold mb-2">Biblioteca Completa</h4>
                <p className="text-gray-600">Textos, exercícios e recursos para todos os níveis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLanguageOverview = () => {
    const lang = languages[selectedLanguage];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="container mx-auto px-6">
            <Button 
              onClick={() => setSelectedLanguage(null)}
              variant="outline"
              className="mb-6 border-white/30 text-white hover:bg-white/10"
            >
              ← Voltar aos Idiomas
            </Button>
            <div className="flex items-center space-x-4">
              <span className="text-6xl">{lang.flag}</span>
              <div>
                <h1 className="text-4xl font-bold">{lang.name}</h1>
                <p className="text-xl opacity-90">Domine este idioma passo a passo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card 
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-green-400 to-green-600 text-white"
              onClick={() => handleSectionSelect('alphabet')}
            >
              <div className="p-6 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Alfabeto</h3>
                <p className="text-sm opacity-90">Aprenda as letras básicas</p>
              </div>
            </Card>

            <Card 
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-blue-400 to-blue-600 text-white"
              onClick={() => handleSectionSelect('vocabulary')}
            >
              <div className="p-6 text-center">
                <Globe className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Vocabulário</h3>
                <p className="text-sm opacity-90">Palavras e frases essenciais</p>
              </div>
            </Card>

            <Card 
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-purple-400 to-purple-600 text-white"
              onClick={() => handleSectionSelect('exercises')}
            >
              <div className="p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Exercícios</h3>
                <p className="text-sm opacity-90">Teste seus conhecimentos</p>
              </div>
            </Card>

            <Card 
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-orange-400 to-orange-600 text-white"
              onClick={() => handleSectionSelect('texts')}
            >
              <div className="p-6 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Textos</h3>
                <p className="text-sm opacity-90">Leia e pratique</p>
              </div>
            </Card>
          </div>

          {/* Progress Overview */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-6">Seu Progresso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Alfabeto</span>
                  <span className="text-sm text-gray-500">85%</span>
                </div>
                <Progress value={85} className="mb-4" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Vocabulário</span>
                  <span className="text-sm text-gray-500">65%</span>
                </div>
                <Progress value={65} className="mb-4" />
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-6">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>Nível Básico</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Trophy className="w-4 h-4" />
                <span>12 exercícios concluídos</span>
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderAlphabet = () => {
    const lang = languages[selectedLanguage];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-6 py-12">
          <Button 
            onClick={() => setCurrentSection('overview')}
            variant="outline"
            className="mb-6"
          >
            ← Voltar
          </Button>
          
          <Card className="p-8 bg-white/90 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Alfabeto - {lang.name} {lang.flag}
            </h2>
            
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-w-4xl mx-auto">
              {lang.alphabet.map((letter, index) => (
                <div 
                  key={index}
                  className="aspect-square flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 text-white text-2xl font-bold rounded-lg hover:scale-110 transition-transform cursor-pointer shadow-lg"
                >
                  {letter}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderVocabulary = () => {
    const lang = languages[selectedLanguage];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-6 py-12">
          <Button 
            onClick={() => setCurrentSection('overview')}
            variant="outline"
            className="mb-6"
          >
            ← Voltar
          </Button>
          
          <Card className="p-8 bg-white/90 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Vocabulário - {lang.name} {lang.flag}
            </h2>
            
            <Tabs defaultValue="words" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="words">Palavras Básicas</TabsTrigger>
                <TabsTrigger value="phrases">Frases Comuns</TabsTrigger>
              </TabsList>
              
              <TabsContent value="words">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lang.basic_words.map((word, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="text-lg font-semibold text-blue-800">{word}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="phrases">
                <div className="space-y-4">
                  {lang.phrases.map((phrase, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="text-lg font-semibold text-purple-800">{phrase}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    );
  };

  const renderExercises = () => {
    if (exercises.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl font-semibold mb-2">Carregando exercícios...</h3>
          </div>
        </div>
      );
    }

    const exercise = exercises[currentExercise];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-6 py-12">
          <Button 
            onClick={() => setCurrentSection('overview')}
            variant="outline"
            className="mb-6"
          >
            ← Voltar
          </Button>
          
          <Card className="p-8 bg-white/90 backdrop-blur-sm max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline">
                  Exercício {currentExercise + 1} de {exercises.length}
                </Badge>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Pontuação</div>
                  <div className="text-2xl font-bold text-purple-600">{score}</div>
                </div>
              </div>
              <Progress value={(currentExercise / exercises.length) * 100} className="mb-4" />
            </div>

            <h3 className="text-2xl font-bold mb-6 text-center">{exercise.question}</h3>
            
            <div className="space-y-3 mb-6">
              {exercise.options.map((option, index) => (
                <Button
                  key={index}
                  variant={userAnswer === option ? "default" : "outline"}
                  className={`w-full p-4 text-left justify-start hover:scale-105 transition-all ${
                    showResult 
                      ? option === exercise.correct_answer 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : option === userAnswer && option !== exercise.correct_answer
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : ''
                      : ''
                  }`}
                  onClick={() => setUserAnswer(option)}
                  disabled={showResult}
                >
                  {option}
                  {showResult && option === exercise.correct_answer && (
                    <CheckCircle2 className="ml-auto w-5 h-5" />
                  )}
                </Button>
              ))}
            </div>

            {showResult && (
              <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
                <p className="text-blue-800">{exercise.explanation}</p>
              </Card>
            )}

            <Button 
              onClick={handleAnswerSubmit}
              disabled={!userAnswer || showResult}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {showResult ? 'Próximo exercício...' : 'Confirmar Resposta'}
            </Button>
          </Card>
        </div>
      </div>
    );
  };

  const renderTexts = () => {
    const lang = languages[selectedLanguage];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-6 py-12">
          <Button 
            onClick={() => setCurrentSection('overview')}
            variant="outline"
            className="mb-6"
          >
            ← Voltar
          </Button>
          
          <Card className="p-8 bg-white/90 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Textos - {lang.name} {lang.flag}
            </h2>
            
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-orange-600" />
              <h3 className="text-xl font-semibold mb-2">Textos em Breve!</h3>
              <p className="text-gray-600">Estamos preparando textos incríveis para você praticar a leitura.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // Main render logic
  if (!selectedLanguage) {
    return renderLanguageGrid();
  }

  if (currentSection === 'overview') {
    return renderLanguageOverview();
  }

  if (currentSection === 'alphabet') {
    return renderAlphabet();
  }

  if (currentSection === 'vocabulary') {
    return renderVocabulary();
  }

  if (currentSection === 'exercises') {
    return renderExercises();
  }

  if (currentSection === 'texts') {
    return renderTexts();
  }

  return renderLanguageGrid();
}

export default App;