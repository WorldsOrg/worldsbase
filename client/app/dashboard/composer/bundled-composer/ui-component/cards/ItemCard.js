import PropTypes from "prop-types";

// project imports
import MainCard from "./MainCard"; // Make sure MainCard is also adapted to Tailwind
import SkeletonWorkflowCard from "./Skeleton/WorkflowCard";

// Const
import { networks } from "../../store/constant";

// ===========================|| CONTRACT CARD ||=========================== //

const ItemCard = ({ isLoading, data, images, onClick }) => {
  const getNetworkItem = (network) => {
    return networks.find((ntw) => ntw.name === network);
  };

  // get random number between 11 and 2000 (for demo purposes to provide for execution count)
  const getRandomNumber = () => {
    return Math.floor(Math.random() * (2000 - 11 + 1)) + 11;
  };

  return (
    <>
      {isLoading ? (
        <SkeletonWorkflowCard />
      ) : (
        <MainCard content={false} onClick={onClick} className="relative overflow-hidden cursor-pointer hover:bg-gray-100">
          <div className="p-2.25">
            <div className="flex flex-col">
              <div className="flex flex-row items-center">
                <h2 className="text-1.5rem font-medium">{data.name}</h2>
              </div>
              <div className="flex flex-row mt-1 mb-1">
                <div className="flex-grow">
                  {data.address && (
                    <p className="text-base font-medium text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis max-w-[250px]">
                      {`${data.address.substring(0, 8)}...${data.address.slice(-4)}`}
                    </p>
                  )}
                  {data.flowData && <p className="text-base font-medium text-gray-600">Total Executions: {getRandomNumber() || "0"}</p>}
                </div>
                {data.deployed && (
                  <div>
                    <span className="px-2 py-1 bg-green-700 text-black text-sm rounded-full">Deployed</span>
                  </div>
                )}
              </div>
              {data.network && (
                <div>
                  <span className={`px-2 py-1 text-white text-sm rounded-full ${getNetworkItem(data.network)?.color || "bg-gray-600"}`}>
                    {getNetworkItem(data.network)?.label || `${data.network} (DEPRECATED)`}
                  </span>
                </div>
              )}
              {images && (
                <div className="flex flex-row mt-2.5">
                  {images.map((img) => (
                    <div key={img} className="w-10 h-10 mr-1.25 bg-white rounded-full">
                      <img className="w-full h-full p-1.25 object-contain" alt="" src={img} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </MainCard>
      )}
    </>
  );
};

ItemCard.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.object,
  images: PropTypes.array,
  onClick: PropTypes.func,
};

export default ItemCard;
