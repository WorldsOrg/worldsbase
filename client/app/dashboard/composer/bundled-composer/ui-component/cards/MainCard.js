import PropTypes from "prop-types";
import { forwardRef } from "react";

// ==============================|| CUSTOM MAIN CARD ||============================== //

const MainCard = forwardRef(function MainCard({ border = true, boxShadow, children, content = true, darkTitle, secondary, title, ...others }, ref) {
  return (
    <div ref={ref} {...others} className={`card bg-white border rounded-lg shadow-md`}>
      {/* card header and action */}
      {title && (
        <div className={`card-header text-primary`}>
          {typeof title === "string" ? <h3>{title}</h3> : title}
          {secondary}
        </div>
      )}

      {/* content & header divider */}
      {title && <hr />}

      {/* card content */}
      {content ? <div className="card-content">{children}</div> : children}
    </div>
  );
});

MainCard.propTypes = {
  border: PropTypes.bool,
  boxShadow: PropTypes.bool,
  children: PropTypes.node,
  content: PropTypes.bool,
  darkTitle: PropTypes.bool,
  secondary: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
};

export default MainCard;
