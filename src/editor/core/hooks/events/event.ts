import boxElementProgress from "./progress/BOX";
import circleElementProgress from "./progress/CIRCLE";
import drawElementProgress from "./progress/DRAW";
import imageElementProgress from "./progress/IMAGE";
import lineElementProgress from "./progress/LINE";
import textElementProgress from "./progress/TEXT";
import boxElementStart from "./start/BOX";
import circleElementStart from "./start/CIRCLE";
import drawElementStart from "./start/DRAW";
import imageElementStart from "./start/IMAGE";
import lineElementStart from "./start/LINE";
import textElementStart from "./start/TEXT";
import { IEventElement } from "./types";

const eventElements: IEventElement = {
  BOX: {
    start: boxElementStart,
    progress: boxElementProgress,
  },
  DRAW: {
    start: drawElementStart,
    progress: drawElementProgress,
  },
  CIRCLE: {
    start: circleElementStart,
    progress: circleElementProgress,
  },
  LINE: {
    start: lineElementStart,
    progress: lineElementProgress,
  },
  IMAGE: {
    start: imageElementStart,
    progress: imageElementProgress,
  },
  TEXT: {
    start: textElementStart,
    progress: textElementProgress,
  },
};

export default eventElements;
