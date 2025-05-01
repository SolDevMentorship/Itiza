import { wavyitem, flatgift, pendant, beads } from "@/images";

interface PageBackgroundProps {
  children: React.ReactNode;
}

export function PageBackground({ children }: PageBackgroundProps) {
  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#fce8e6] via-[#fbd9db] to-[#f9f1ec]">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={wavyitem}
          alt="Wavy fabric"
          className="absolute top-0 right-0 w-64 opacity-30 blur-sm transform scale-110 rotate-6"
        />
        <img
          src={flatgift}
          alt="Gift box"
          className="absolute bottom-4 left-4 w-40 opacity-40 blur-[1px]"
        />
        <img
          src={pendant}
          alt="Pendant"
          className="absolute top-10 left-6 w-24 opacity-30 rotate-12 blur-sm"
        />
        <img
          src={beads}
          alt="Pearls"
          className="absolute bottom-6 right-6 w-28 opacity-30 blur-sm"
        />
      </div>
      {children}
    </div>
  );
}
