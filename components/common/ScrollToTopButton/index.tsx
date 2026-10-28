"use client";

import { Button } from "@/components/ui/button";
import { useMediaBarOpen } from "@/hooks/useMediaBarOpen";
import { CircleArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type ScrollToTopButtonProps = {
  scrollThreshold?: number;
};

export default function ScrollToTopButton({
  scrollThreshold = 100,
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(scrollThreshold <= 0); // Estado para controlar a visibilidade do botão
  const t = useTranslations("Messages");
  const mediaBarOpen = useMediaBarOpen();

  // Função para verificar a posição do scroll
  const handleScroll = useCallback(() => {
    if (window.scrollY > scrollThreshold) {
      setIsVisible(true); // Mostra o botão se o scroll for maior que scrollThreshold px
    } else {
      setIsVisible(false); // Oculta o botão se o scroll for menor ou igual a scrollThreshold px
    }
  }, [scrollThreshold]);

  // Adiciona o listener de scroll ao montar o componente
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll); // Remove o listener ao desmontar o componente
    };
  }, [handleScroll]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <Button
      variant="outline"
      className={`fixed left-1/2 transform -translate-x-1/2 transition-[opacity,bottom] duration-300 gap-1 ${
        mediaBarOpen ? "bottom-44 sm:bottom-28" : "bottom-24 sm:bottom-8"
      } ${
        isVisible
          ? "opacity-100 cursor-pointer"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={scrollToTop}
    >
      <CircleArrowUp size={20} />
      <span>{t("scrollToTop")}</span>
    </Button>
  );
}
