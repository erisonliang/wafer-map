import * as PIXI from "pixi.js";
import { useStyles } from "./styles";
import { formatNumber } from "../helpers/util";
import React, { useRef, useEffect } from "react";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import RestoreIcon from "@material-ui/icons/Restore";

const WaferMap = (props) => {
  const rootRef = useRef(null);
  const classes = useStyles();
  const { width, height, data } = props;

  const MAX_SCALE_LIMIT = 64;
  const MIN_SCALE_LIMIT = 0.25;
  let scale = { x: 1, y: 1 };

  let app = null;
  let currentStagePos = null;
  let initialRectPos = null;
  let chipMatrix;
  let rectGraphics = new PIXI.Graphics();

  const chipWidth = 0.5;
  const chipHeight = 0.5;
  const chipGap = 0.25;

  const sort = (array) => {
    return array.sort((a, b) => {
      return a - b;
    });
  };

  const drawChipMap = (scale) => {
    const chipGraphics = new PIXI.Graphics();
    chipGraphics.interactive = true;

    if (data) {
      // find max x and y indexe
      const xIndexData = sort(data.map((i) => i.xIndex));
      const yIndexData = sort(data.map((i) => i.yIndex));
      const xMaxIndex = xIndexData[xIndexData.length - 1];
      const yMaxIndex = yIndexData[yIndexData.length - 1];

      chipMatrix = Array.from(Array(xMaxIndex + 1).fill(0), () =>
        new Array(yMaxIndex + 1).fill(0)
      );

      // map chip map into multi dimention array
      data.map((item) => {
        chipMatrix[item.xIndex][item.yIndex] = item;
      });

      // draw chips using matrix
      chipMatrix.forEach((row) => {
        if (row) {
          row.forEach((chip) => {
            // empty chip will have a value of 0
            if (chip) {
              const x = chip.xIndex * chipWidth + chip.xIndex * chipGap;
              const y = chip.yIndex * chipHeight + chip.yIndex * chipGap;
              if (chip.xIndex === 200 && chip.yIndex === 200) {
                chipGraphics.beginFill(0x000000);
              } else {
                chipGraphics.beginFill(chip.color);
              }
              chipGraphics.drawRect(x, y, chipWidth, chipHeight);
              chipGraphics.endFill();
            }
          });
        }
      });
    }

    chipGraphics.x = width / 2 - chipGraphics.width / 2;
    chipGraphics.y = height / 2 - chipGraphics.height / 2;
    app.stage.scale.x = scale.x;
    app.stage.scale.y = scale.y;
    app.stage.addChild(chipGraphics);
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
      .on("mousemove", onRendererMouseMove);

    rootRef.current.appendChild(app.view);
    drawChipMap(scale);

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

      // calculate rect dimension based on zoom level and stage position
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
  };

  const distanceBetweenPoints = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const findAreaOfTriangle = (a, b, c) => {
    // Heron's formula
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    return area;
  };

  const onRendererMouseUp = (e) => {
    const stageX = app.stage.x;
    const stageY = app.stage.y;
    const pos = e.data.global;

    let { x, y } = initialRectPos;
    x = (x - stageX) / scale.x;
    y = (y - stageY) / scale.y;

    let { dx, dy } = { dx: pos.x, dy: pos.y };
    dx = (dx - stageX) / scale.x;
    dy = (dy - stageY) / scale.y;

    const p = { x: 164, y: 164 };
    console.log(pos);

    // calculate area of rectangle A = l*b
    const rectLength = distanceBetweenPoints(x, y, dx, y);
    const rectWidth = distanceBetweenPoints(x, y, x, dy);
    const rectArea = rectLength * rectWidth;

    console.log("React area - ", rectArea);

    // calculate area of 4 triangle wrt point and rectangle
    // let P point and ABCD corners of rectangle

    // Area of APB triangle
    const Ap = distanceBetweenPoints(x, y, p.x, p.y);
    const Pb = distanceBetweenPoints(p.x, p.y, dx, y);
    const Ba = distanceBetweenPoints(x, y, dx, y);
    const APBTriangleArea = findAreaOfTriangle(Ap, Pb, Ba);

    // Area of BPC triangle
    const Bp = distanceBetweenPoints(dx, y, p.x, p.y);
    const Pc = distanceBetweenPoints(p.x, p.y, dx, dy);
    const Bc = distanceBetweenPoints(dx, y, dx, dy);
    const BPCTriangleArea = findAreaOfTriangle(Bp, Pc, Bc);

    // Area of CPD triangle
    const Cp = distanceBetweenPoints(dx, dy, p.x, p.y);
    const Pd = distanceBetweenPoints(p.x, p.y, x, dy);
    const Dc = distanceBetweenPoints(x, dy, dx, dy);
    const CPDTriangleArea = findAreaOfTriangle(Cp, Pd, Dc);

    // Area of DPA triangle
    const Dp = distanceBetweenPoints(x, dy, p.x, p.y);
    const Pa = distanceBetweenPoints(p.x, p.y, x, y);
    const Ad = distanceBetweenPoints(x, y, x, dy);
    const DPATriangleArea = findAreaOfTriangle(Dp, Pa, Ad);

    const triangleAreaSum =
      APBTriangleArea + BPCTriangleArea + CPDTriangleArea + DPATriangleArea;

    console.log("Triangle area sum - ", triangleAreaSum);

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

  const doPerformZoom = (scale) => {
    // check if max and min scale limit has reached
    const isWithInMaxRange = scale.x + scale.y / 2 <= MAX_SCALE_LIMIT;
    const isWithInMinRange = scale.x + scale.y / 2 >= MIN_SCALE_LIMIT;

    return isWithInMaxRange && isWithInMinRange;
  };

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

    // check if we can do a zoom
    if (doPerformZoom(newScale)) {
      stage.x -= newScreenPos.x - x;
      stage.y -= newScreenPos.y - y;
      stage.scale.x = newScale.x;
      stage.scale.y = newScale.y;
      scale = newScale;
    }
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
      >
        <span className={classes.waferNotes}>
          Total chip count: {formatNumber(data.length)}
        </span>
      </div>
    </div>
  );
};

export default WaferMap;
