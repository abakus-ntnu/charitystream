import Image from "next/image";

import { Donation } from "@/models/types";

import animations from "@/styles/animations.module.css";

type Props = {
  name: string;
  amount: number;
  message: string;
};

const DonationCard = (props: Props) => {
  return (
    <div
      className={`flex items-center overflow-hidden m-3 rounded shadow-md ${animations.wiggle}`}
      style={{ background: "#ff5b24" }}
    >
      <Image
        src="https://i.imgur.com/RVgB3E6.png"
        alt="Vipps logo"
        width={50}
        height={50}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span className="flex justify-between w-full">
          <span className="p-3 pb-0 truncate max-w-xs">{props.name}</span>
          <span className="p-3 pb-0 font-bold">{props.amount}kr!!</span>
        </span>
        <span className="p-3 pt-0 opacity-80 line-clamp-1 w-full text-ellipsis truncate max-w-xl">
          {props.message}
        </span>
      </div>
    </div>
  );
};

const TopDonation = ({ topDonor }: { topDonor: Donation }) => {
  return (
    <div>
      <div className="font-bold m-1 text-xl mb-2">Biggest vippser:</div>
      {topDonor && (
        <div
          className={`flex items-center overflow-hidden m-3 rounded shadow-md ${animations.wiggle}`}
          style={{ background: "#39AC37" }}
        >
          <Image
            src="https://i.imgur.com/RVgB3E6.png"
            width={50}
            height={50}
            alt="Vipps logo"
          />
          <span className="flex justify-between w-full">
            <span className="p-3">{topDonor.name}</span>
            <span className="p-3 font-bold">{topDonor.amount}kr!!</span>
          </span>
        </div>
      )}
    </div>
  );
};

const Donations = ({
  donations,
  topDonor,
}: {
  donations: Donation[];
  topDonor: Donation;
}) => {
  const vipps = donations
    .slice(0, 10)
    .map((donation) => (
      <DonationCard
        name={donation.name}
        amount={donation.amount}
        message={donation.message}
        key={donation._id}
      />
    ));

  return (
    <div className="flex flex-col h-full max-w-full">
      <TopDonation topDonor={topDonor} />
      <hr />
      {vipps}
      {donations.length === 0 && (
        <p className="text-center">
          Ingen Vipps-donasjoner er registrert enda! :(
        </p>
      )}
    </div>
  );
};

export default Donations;
