import { IElement } from "@/editor/core/elements/type";
import { IKeyTool } from "@/editor/core/hooks/tool/types";
import { Image } from "konva/lib/shapes/Image";
import { Line } from "konva/lib/shapes/Line";
import { Rect } from "konva/lib/shapes/Rect";
import { Text } from "konva/lib/shapes/Text";
import ThreadLine from "./thread-line";
import ThreadText from "./thread-txt";
import ThreadBox from "./threads-box";
import ThreadCircle from "./threads-circle";
import ThreadDraw from "./threads-draw";
import ThreadImg from "./threads.image";

export type Threads = Rect | Image | Line | Text;

type IThreads = {
  [key in IKeyTool]?: (element: IElement | Partial<IElement>) => Threads;
};

const threads: IThreads = {
  BOX: ThreadBox,
  IMAGE: ThreadImg,
  CIRCLE: ThreadCircle,
  DRAW: ThreadDraw,
  TEXT: ThreadText,
  LINE: ThreadLine,
};

export default threads;
