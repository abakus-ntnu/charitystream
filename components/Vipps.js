import animations from "../styles/animations.module.css";

const Vipp = (props) => {
  return (
    <div
      className={`flex items-center overflow-hidden m-3 rounded-tl-lg rounded-tr-lg rounded-br-lg shadow-md ${animations.wiggle}`}
      style={{ background: "#ff5b24" }}
    >
      <img
        src="https://i.imgur.com/RVgB3E6.png"
        width="50px"
      />
      <span className="flex justify-between w-full">
        <span className="p-3">{props.name} donerte</span>
        <span className="p-3 font-bold">{props.amount}kr!!</span>
      </span>
    </div>
  );
};

const TopVipp = ({ vipp }) => {
  return (
    <div>
      <div className="font-bold m-1 text-xl mb-2">Største donasjon:</div>
      {vipp && (
        <div
          className={`flex items-center overflow-hidden m-3 rounded-tl-lg rounded-tr-lg rounded-br-lg shadow-md ${animations.wiggle}`}
          style={{ background: "#39AC37" }}
        >
          <img
            src="https://i.imgur.com/RVgB3E6.png"
            width="50px"
          />
          <span class="flex justify-between w-full">
            <span class="p-3">{vipp.name} donerte</span>
            <span class="p-3 font-bold">{vipp.amount}kr!!</span>
          </span>
        </div>
      )}
    </div>
  );
};

const Vipps = (props) => {
  const vipps = props.items
    .map((item) => <Vipp name={item.name} amount={item.amount} />);

  return (
    <div class="flex flex-col">
      <TopVipp vipp={props.topDonor} />
      <hr />
      {vipps}
    </div>
  );
};

export default Vipps;
