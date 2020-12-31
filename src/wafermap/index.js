import * as PIXI from "pixi.js";
import { useStyles } from "./styles";
import React, { useRef, useEffect } from "react";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import RestoreIcon from "@material-ui/icons/Restore";

const WaferMap = (props) => {
  const rootRef = useRef(null);
  const classes = useStyles();
  const { width, height, data } = props;

  let scale = { x: 1, y: 1 };
  let app = null;
  let graphics = null;
  let currentStagePos = null;
  let initialRectPos = null;
  let rectGraphics = new PIXI.Graphics();

  const chipWidth = 0.5;
  const chipHeight = 0.5;
  const chipGap = 0.25;
  const chipCount = 300;

  const sort = (array) => {
    return array.sort((a, b) => {
      return a - b;
    });
  };

  const draw = (scale) => {
    graphics = new PIXI.Graphics();
    graphics.interactive = true;

    if (data) {
      // find max x and y indexe
      const xIndexData = sort(data.map((i) => i.xIndex));
      const yIndexData = sort(data.map((i) => i.yIndex));
      const xMaxIndex = xIndexData[xIndexData.length - 1];
      const yMaxIndex = yIndexData[yIndexData.length - 1];

      const waferData = Array.from(Array(xMaxIndex + 1).fill(0), () =>
        new Array(yMaxIndex + 1).fill(0)
      );

      // map wafer map into multi dimention array
      data.map((item) => {
        waferData[item.xIndex][item.yIndex] = item;
      });

      console.log(`Total chip count ${data.length}`);

      waferData.forEach((row) => {
        if (row) {
          row.forEach((chip) => {
            // empty chip will have a value of 0
            if (chip) {
              const dx = chip.xIndex * chipWidth + chip.xIndex * chipGap;
              const dy = chip.yIndex * chipHeight + chip.yIndex * chipGap;
              graphics.beginFill(chip.color);
              graphics.drawRect(dx, dy, chipWidth, chipHeight);
              graphics.endFill();
            }
          });
        }
      });
    }

    graphics.x = width / 2 - graphics.width / 2;
    graphics.y = height / 2 - graphics.height / 2;
    app.stage.scale.x = scale.x;
    app.stage.scale.y = scale.y;
    app.stage.addChild(graphics);
  };

  useEffect(() => {
    app = new PIXI.Application({
      width: width,
      height: height,
      antialias: true,
      transparent: true,
      resolution: window.devicePixelRatio || 1,
    });

    app.renderer.plugins.interaction
      .on("mousedown", onRendererMouseDown)
      .on("mouseup", onRendererMouseUp)
      .on("mousemove", onRendererMouseMove)
      .on("mouseupoutside", onRendererMouseOutsideUp);

    rootRef.current.appendChild(app.view);
    draw(scale);

    return () => {
      app.destroy(app.view);
    };
  }, []);

  const onRendererMouseMove = (e) => {
    if (initialRectPos) {
      const stageX = app.stage.x;
      const stageY = app.stage.y;
      const pos = e.data.global;
      const { x, y } = initialRectPos;
      const dx = (x - stageX) / scale.x;
      const dy = (y - stageY) / scale.y;
      const width = (pos.x - x) / scale.x;
      const height = (pos.y - y) / scale.y;
      drawRect(dx, dy, width, height);
    }
  };

  const onRendererMouseDown = (e) => {
    const pos = e.data.global;
    initialRectPos = {
      x: pos.x,
      y: pos.y,
    };
    console.log(pos.x, pos.y);
    console.log("Stage xy", app.stage.x, app.stage.y);
    console.log("scale", scale);
  };

  const onRendererMouseUp = (e) => {
    initialRectPos = null;
  };

  const onRendererMouseOutsideUp = (e) => {
    initialRectPos = null;
  };

  const onMinusClick = (e) => {
    zoom(1, e.nativeEvent.offsetX, e.nativeEvent.offsetX);
  };

  const onPlusClick = (e) => {
    zoom(-1, e.nativeEvent.offsetX, e.nativeEvent.offsetX);
  };

  const onResetClick = (e) => {
    const stage = app.stage;
    scale = { x: 1, y: 1 };
    stage.x = 0;
    stage.y = 0;
    stage.scale.x = scale.x;
    stage.scale.y = scale.y;
  };

  const drawRect = (x, y, width, height) => {
    rectGraphics.clear();
    rectGraphics.lineStyle(1, 0xff0000);
    rectGraphics.drawRect(x, y, width, height);
    rectGraphics.endFill();
    app.stage.addChild(rectGraphics);
  };

  const onMouseDown = (e) => {
    initialRectPos = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
    console.log("Client XY", e.nativeEvent.clientX, e.nativeEvent.clientY);
    console.log("Offset XY", e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  // const onMouseDown = (e) => {
  //   initialRectPos = {
  //     x: e.nativeEvent.offsetX,
  //     y: e.nativeEvent.offsetY,
  //   };
  //   console.log("Client XY", e.nativeEvent.clientX, e.nativeEvent.clientY);
  //   console.log("Offset XY", e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  // };

  // const onMouseUp = (e) => {
  //   initialRectPos = null;
  // };

  // const onMouseMove = (e) => {
  //   if (initialRectPos) {
  //     const { x, y } = initialRectPos;
  //     const pos = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  //     drawRect(x, y, pos.x - x, pos.y - y);
  //   }
  // };

  // const onMouseDown = (e) => {
  //   currentStagePos = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  // };

  // const onMouseUp = (e) => {
  //   currentStagePos = null;
  // };

  // const onMouseMove = (e) => {
  //   if (currentStagePos) {
  //     const element = e.nativeEvent;
  //     app.stage.x += element.offsetX - currentStagePos.x;
  //     app.stage.y += element.offsetY - currentStagePos.y;
  //     currentStagePos = { x: element.offsetX, y: element.offsetY };
  //   }
  // };

  const zoom = (delta, x, y) => {
    const stage = app.stage;
    const scaleOffset = delta > 0 ? 0.5 : 2;

    const stagePos = {
      x: (x - stage.x) / stage.scale.x,
      y: (y - stage.y) / stage.scale.y,
    };
    const newScale = {
      x: stage.scale.x * scaleOffset,
      y: stage.scale.y * scaleOffset,
    };
    const newScreenPos = {
      x: stagePos.x * newScale.x + stage.x,
      y: stagePos.y * newScale.y + stage.y,
    };

    stage.x -= newScreenPos.x - x;
    stage.y -= newScreenPos.y - y;
    stage.scale.x = newScale.x;
    stage.scale.y = newScale.y;
    scale = newScale;
  };

  const onWheel = (e) => {
    zoom(e.deltaY, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  return (
    <div className={classes.waferRoot} style={{ width: width, height: height }}>
      <div className={classes.controlHolder}>
        <div>
          <button onClick={onMinusClick} title="Zoom out">
            <ZoomOutIcon fontSize="small" />
          </button>
        </div>
        <div>
          <button onClick={onPlusClick} title="Zoom in">
            <ZoomInIcon fontSize="small" />
          </button>
        </div>
        <div>
          <button onClick={onResetClick} title="Reset to default">
            <RestoreIcon fontSize="small" />
          </button>
        </div>
      </div>
      <div
        ref={rootRef}
        className={classes.canvasRootDraw}
        onWheel={onWheel}
        /*onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}*/
      />
    </div>
  );
};

export default WaferMap;
