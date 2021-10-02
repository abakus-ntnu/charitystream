import { useState } from "react";

const BeerCounter = ({ beerCount }) => {
  return (
    <div className={"flex flex-center justify-center"}>
      <img
        className={"flex-grow max-w-lg absolute z-0"}
        src="beeer.png"
        alt="Picture of a beer"
      />
      <div
        className="text-center text-3xl z-10 text-black font-extrabold -ml-2"
        style={{ marginTop: "7rem" }}
      >
        {beerCount}
      </div>
    </div>
  );
};

export default BeerCounter;
