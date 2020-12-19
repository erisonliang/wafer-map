import * as PIXI from "pixi.js";
import { useStyles } from "./styles";
import React, { useRef, useEffect } from "react";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";

const WaferMap = (props) => {
  const rootRef = useRef(null);
  const classes = useStyles();
  const { width, height } = props;

  let scale = 1;
  let app = null;
  let currentStagePos = null;
  let scaleMultiplier = 0.25;

  const chipWidth = 0.5;
  const chipHeight = 0.5;
  const chipGap = 0.25;
  const chipCount = 300;

  const draw = (scale) => {
    const graphics = new PIXI.Graphics();
    graphics.interactive = true;

    for (let y = 0; y < chipCount; y++) {
      for (let x = 0; x < chipCount; x++) {
        const dx = x * chipWidth + x * chipGap;
        const dy = y * chipHeight + y * chipGap;
        graphics.beginFill(0xde3249);
        graphics.drawRect(dx, dy, chipWidth, chipHeight);
        graphics.endFill();
      }
    }

    graphics.x = width / 2 - graphics.width / 2;
    graphics.y = height / 2 - graphics.height / 2;
    app.stage.addChild(graphics);
    app.stage.scale.x = scale;
    app.stage.scale.y = scale;
  };

  /*const app = useMemo(
    () =>
      new PIXI.Application({
        width: width,
        height: height,
        antialias: true,
        transparent: true,
        resolution: window.devicePixelRatio || 1,
      }),
    [width, height]
  );*/

  useEffect(() => {
    app = new PIXI.Application({
      width: width,
      height: height,
      antialias: true,
      transparent: true,
      resolution: window.devicePixelRatio || 1,
    });
    rootRef.current.appendChild(app.view);
    draw(scale);

    return () => {
      app.destroy(app.view);
    };
  }, []);

  const onMinusClick = (e) => {
    scale *= scaleMultiplier;
    draw(scale);
  };

  const onPlusClick = (e) => {
    scale /= scaleMultiplier;
    draw(scale);
  };

  const onMouseDown = (e) => {
    currentStagePos = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const onMouseUp = (e) => {
    currentStagePos = null;
  };

  const onMouseMove = (e) => {
    if (currentStagePos) {
      const element = e.nativeEvent;
      app.stage.x += element.offsetX - currentStagePos.x;
      app.stage.y += element.offsetY - currentStagePos.y;
      currentStagePos = { x: element.offsetX, y: element.offsetY };
    }
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

    stage.x -= newScreenPos.x - x;
    stage.y -= newScreenPos.y - y;
    stage.scale.x = newScale.x;
    stage.scale.y = newScale.y;
  };

  const onWheel = (e) => {
    zoom(e.deltaY, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  return (
    <div className={classes.waferRoot} style={{ width: width, height: height }}>
      <div className={classes.controlHolder}>
        <div>
          <button onClick={onMinusClick}>
            <ZoomOutIcon fontSize="small" />
          </button>
        </div>
        <div>
          <button onClick={onPlusClick}>
            <ZoomInIcon fontSize="small" />
          </button>
        </div>
      </div>
      <div
        ref={rootRef}
        className={classes.canvasRoot}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      />
    </div>
  );
};

export default WaferMap;
