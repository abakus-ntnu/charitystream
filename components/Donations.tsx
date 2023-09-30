import animations from "../styles/animations.module.css";
import { Donation } from "../models/types";

const DonationCard = (props) => {
  return (
    <div
      className={`flex items-center overflow-hidden m-3 rounded shadow-md ${animations.wiggle}`}
      style={{ background: "#ff5b24" }}
    >
      <img src="https://i.imgur.com/RVgB3E6.png" width="50px" />
      <span className="flex justify-between w-full">
        <span className="p-3 truncate max-w-xs">{props.name}</span>
        <span className="p-3 font-bold">{props.amount}kr!!</span>
      </span>
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
          <img src="https://i.imgur.com/RVgB3E6.png" width="50px" />
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
