import dinoEgg from "@/assets/dino-egg.png";

const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <img
        src={dinoEgg}
        alt=""
        className="absolute top-[10%] left-[5%] w-12 h-12 opacity-20 animate-float-slow"
        loading="lazy"
        width={48}
        height={48}
      />
      <img
        src={dinoEgg}
        alt=""
        className="absolute top-[30%] right-[8%] w-10 h-10 opacity-15 animate-float"
        loading="lazy"
        width={40}
        height={40}
      />
      <img
        src={dinoEgg}
        alt=""
        className="absolute bottom-[20%] left-[10%] w-8 h-8 opacity-10 animate-wiggle"
        loading="lazy"
        width={32}
        height={32}
      />
      <img
        src={dinoEgg}
        alt=""
        className="absolute top-[60%] right-[15%] w-14 h-14 opacity-10 animate-float-slow"
        loading="lazy"
        width={56}
        height={56}
      />
      {/* Decorative circles */}
      <div className="absolute top-[15%] right-[25%] w-32 h-32 rounded-full bg-dino-yellow/10 blur-2xl" />
      <div className="absolute bottom-[30%] left-[20%] w-40 h-40 rounded-full bg-dino-blue/10 blur-3xl" />
      <div className="absolute top-[50%] left-[50%] w-24 h-24 rounded-full bg-dino-green/10 blur-2xl" />
    </div>
  );
};

export default FloatingElements;
