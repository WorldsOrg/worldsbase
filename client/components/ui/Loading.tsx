import { CgSpinner } from "react-icons/cg";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <CgSpinner className="mx-auto text-4xl md:text-6xl animate-spin text-primary" />
    </div>
  );
};

export default Loading;
