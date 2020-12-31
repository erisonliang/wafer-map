import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles({
  waferRoot: {
    margin: "1%",
    border: "1px solid grey",
    position: "relative",
  },
  controlHolder: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    margin: ".5rem",
    right: "1%",
    "& div": {
      paddingBottom: "3px",
    },
  },
  canvasRoot: {
    cursor: "grab",
  },
  canvasRootDraw: {
    cursor: "crosshair",
  },
  waferNotes: {
    position: "absolute",
    top: "95%",
    right: "1%",
    backgroundColor: "white",
    padding: "3px",
  },
});
