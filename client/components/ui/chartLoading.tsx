import { CgSpinner } from "react-icons/cg";

const ChartLoading = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <CgSpinner className="mx-auto text-4xl md:text-6xl animate-spin" />
    </div>
  );
};

export default ChartLoading;
