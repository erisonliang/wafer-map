import React from "react";
import WaferMap from "../wafermap";
import waferData from "../data/wafermap-processed-data.json";

const WaferList = (props) => {
  const { waferCount } = props;

  const renderWafer = (count) => {
    const wafers = [];
    for (let i = 0; i < count; i++) {
      wafers.push(
        <WaferMap
          data={waferData}
          width={525}
          height={525}
          key={`wafer-map-key-${i}`}
        />
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
