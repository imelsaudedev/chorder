import { organizationConfig } from "@/config/organization";
import Image from "next/image";

export default function OrgHeader() {
  const { name, description, logo } = organizationConfig;

  const renderLogo = () => {
    if (logo.type === "emoji") {
      return (
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary/20 rounded-lg flex items-center justify-center text-2xl sm:text-4xl">
          {logo.value}
        </div>
      );
    }

    if (logo.type === "initials") {
      return (
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg sm:text-xl">
            {logo.value}
          </span>
        </div>
      );
    }

    if (logo.type === "image") {
      return (
        <div className="w-12 h-12 sm:w-16 sm:h-16 relative">
          <Image
            src={logo.value}
            alt={name}
            fill
            className="object-contain"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex items-center gap-4">
        {renderLogo()}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-primary">
            {name}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
