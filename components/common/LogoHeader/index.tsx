import Image from "next/image";

export default function LogoHeader() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-0">
      <Image
        src="/logo_amanhar.webp"
        alt="Logo"
        width={400}
        height={400}
        priority
        className="h-auto w-auto max-w-full"
      />
    </div>
  );
}
