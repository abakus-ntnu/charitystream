const BeerCounter = ({ count }) => {
  return (
    <div className={"flex align-center justify-center relative"}>
      <img
        className={"max-w-lg z-0 max-w-full"}
        src="beeer.png"
        alt="Picture of a beer"
        width={700}
      />
      <div
        className="text-center text-6xl z-10 absolute text-black font-extrabold -ml-2"
        style={{ top: "40%" }}
      >
        {count}
      </div>
    </div>
  );
};

export default BeerCounter;
