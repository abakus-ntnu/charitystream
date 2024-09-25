export {};
const Alert = ({ header, text }) => (
  <div className="flex bg-red-lighter">
    <div className="w-16 bg-red">
      <div className="p-4"></div>
    </div>
    <div className="w-auto text-black opacity-75 items-center p-4">
      <span className="text-lg font-bold pb-4">{header}</span>
      <p className="leading-tight">{text}</p>
    </div>
  </div>
);

export default Alert;
