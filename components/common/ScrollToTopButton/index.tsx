"use client"; // Marca o componente como Client Component

import { Button } from "@/components-old/ui/button";
import { useEffect, useState } from "react";
import { CircleArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";

type ScrollToTopButtonProps = {
  scrollThreshold?: number;
};

export default function ScrollToTopButton({
  scrollThreshold = 100,
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(scrollThreshold <= 0); // Estado para controlar a visibilidade do botão
  const t = useTranslations("Messages");

  // Função para verificar a posição do scroll
  const handleScroll = () => {
    if (window.scrollY > scrollThreshold) {
      setIsVisible(true); // Mostra o botão se o scroll for maior que scrollThreshold px
    } else {
      setIsVisible(false); // Oculta o botão se o scroll for menor ou igual a scrollThreshold px
    }
  };

  // Adiciona o listener de scroll ao montar o componente
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll); // Remove o listener ao desmontar o componente
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <Button
      variant="outline"
      className={`fixed bottom-24 sm:bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 gap-1 ${
        isVisible
          ? "opacity-100 cursor-pointer"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={scrollToTop}
    >
      <CircleArrowUp className="w-5 h-5" />
      <span>{t("scrollToTop")}</span>
    </Button>
  );
}
