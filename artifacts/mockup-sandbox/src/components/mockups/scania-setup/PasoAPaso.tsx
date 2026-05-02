import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function PasoAPaso() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && firstName.trim() !== '') {
      setStep(2);
    } else if (step === 2 && lastName.trim() !== '') {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Simulate error for mockup purposes
      setError('Nombre no encontrado en la lista de usuarios autorizados.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans text-[#2B3A4A]">
      {/* Header */}
      <header className="bg-[#2B3A4A] text-white p-4 flex items-center justify-between shadow-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ffb800] flex items-center justify-center font-bold text-[#2B3A4A]">
            S
          </div>
          <span className="font-semibold text-lg tracking-wide">SCANIA NOVEDADES</span>
        </div>
        <button className="text-gray-300 hover:text-white flex items-center gap-2 text-sm transition-colors">
          <LogOut size={16} />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Progress Dots */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex gap-3">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-[#ffb800]' : step > i ? 'w-2 bg-[#2B3A4A]' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all duration-500 relative">
          
          <form onSubmit={step === 3 ? handleSubmit : handleNext}>
            {/* Step 1 */}
            <div className={`transition-all duration-500 absolute inset-0 p-8 flex flex-col justify-center ${step === 1 ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
              <h1 className="text-3xl font-bold mb-8 text-[#2B3A4A] leading-tight">
                ¡Hola! <br/>¿Cuál es tu nombre?
              </h1>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Ej. Juan"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="text-2xl py-6 px-4 border-2 focus-visible:ring-[#ffb800] focus-visible:border-[#ffb800] rounded-xl transition-all"
                    autoFocus
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!firstName.trim()}
                  className="w-full text-lg py-6 bg-[#ffb800] hover:bg-[#e6a600] text-[#2B3A4A] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  Continuar <ArrowRight size={20} />
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`transition-all duration-500 absolute inset-0 p-8 flex flex-col justify-center ${step === 2 ? 'opacity-100 translate-x-0 pointer-events-auto' : step < 2 ? 'opacity-0 translate-x-full pointer-events-none' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
              <button 
                type="button" 
                onClick={handleBack}
                className="absolute top-6 left-6 text-gray-400 hover:text-[#2B3A4A] transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              
              <h1 className="text-3xl font-bold mb-8 text-[#2B3A4A] leading-tight mt-6">
                Un gusto, {firstName}. <br/>¿Y tu apellido?
              </h1>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Ej. Pérez"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="text-2xl py-6 px-4 border-2 focus-visible:ring-[#ffb800] focus-visible:border-[#ffb800] rounded-xl transition-all"
                    autoFocus={step === 2}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!lastName.trim()}
                  className="w-full text-lg py-6 bg-[#ffb800] hover:bg-[#e6a600] text-[#2B3A4A] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  Continuar <ArrowRight size={20} />
                </Button>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`transition-all duration-500 absolute inset-0 p-8 flex flex-col justify-center ${step === 3 ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-full pointer-events-none'}`}>
              <button 
                type="button" 
                onClick={handleBack}
                disabled={isSubmitting}
                className="absolute top-6 left-6 text-gray-400 hover:text-[#2B3A4A] transition-colors disabled:opacity-50"
              >
                <ArrowLeft size={24} />
              </button>

              <div className="flex flex-col items-center text-center mt-6">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} className="text-blue-500" />
                </div>
                
                <h1 className="text-2xl font-bold mb-2 text-[#2B3A4A]">
                  Confirma tus datos
                </h1>
                
                <p className="text-gray-500 mb-8">
                  Vamos a verificar si estás en la lista de usuarios autorizados como:
                </p>

                <div className="bg-gray-50 w-full py-4 px-6 rounded-xl border border-gray-100 mb-8 shadow-inner">
                  <p className="text-xl font-semibold text-[#2B3A4A]">
                    {firstName} {lastName}
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-6 text-left border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Acceso denegado</AlertTitle>
                    <AlertDescription className="text-red-700 mt-1">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full text-lg py-6 bg-[#ffb800] hover:bg-[#e6a600] text-[#2B3A4A] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Comenzar'
                  )}
                </Button>
              </div>
            </div>

            {/* Invisible placeholder to maintain height */}
            <div className="opacity-0 pointer-events-none p-8 flex flex-col justify-center">
               <h1 className="text-3xl font-bold mb-8 leading-tight mt-6">
                Un gusto, {firstName}. <br/>¿Y tu apellido?
              </h1>
              <div className="space-y-6">
                 <Input className="text-2xl py-6 px-4" />
                 <Button className="w-full text-lg py-6">Continuar</Button>
              </div>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
