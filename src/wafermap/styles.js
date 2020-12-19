import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles({
  waferRoot: {
    margin: "10px",
    border: "1px solid grey",
  },
  controlHolder: {
    textAlign: "right",
    position: "absolute",
    margin: ".5rem",
    "& *": {
      margin: "3px",
    },
  },
  canvasRoot: {
    cursor: "grab",
  },
});
