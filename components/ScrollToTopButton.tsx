'use client'; // Marca o componente como Client Component

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { CircleArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false); // Estado para controlar a visibilidade do botão

  // Função para verificar a posição do scroll
  const handleScroll = () => {
    if (window.scrollY > 100) {
      setIsVisible(true); // Mostra o botão se o scroll for maior que 100px
    } else {
      setIsVisible(false); // Oculta o botão se o scroll for menor ou igual a 100px
    }
  };

  // Adiciona o listener de scroll ao montar o componente
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll); // Remove o listener ao desmontar o componente
    };
  }, []);

  return (
    <Button
      variant="outline"
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 gap-1 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <CircleArrowUp className="w-5 h-5" />
      <span>Voltar ao topo</span>
    </Button>
  );
}
