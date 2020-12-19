import React from "react";
import WaferMap from "../wafermap";

const WaferList = (props) => {
  const { waferCount } = props;

  const renderWafer = (count) => {
    const wafers = [];
    for (let i = 0; i < count; i++) {
      wafers.push(
        <WaferMap width={250} height={250} key={`wafer-map-key-${i}`} />
      );
    }

    return wafers;
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {renderWafer(waferCount)}
    </div>
  );
};

export default WaferList;
