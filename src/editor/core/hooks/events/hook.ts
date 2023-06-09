/* eslint-disable react-hooks/exhaustive-deps */
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import stagePosition from "../../helpers/stage/position";
import useElement from "../element/hook";
import useElements from "../elements/hook";
import usePipe from "../pipe/hook";
import useSelection from "../selection/hook";
import useTool from "../tool/hook";
import eventElements from "./event";
import { IEndEvent, IStageEvents, IStartEvent } from "./types";

const useEvent = () => {
  const { isCreatingElement, tool, setTool, disableKeyBoard } = useTool();
  const {
    elements,
    handleSetElements,
    handleDeleteElement,
    handleDeleteManyElements,
  } = useElements();
  const { pipeline, handleEmptyElement, handleSetElement } = usePipe();
  const {
    element,
    handleSetElement: handleSetEl,
    handleEmptyElement: handleElementEmpty,
  } = useElement();
  const stageDataRef = useRef<Konva.Stage>(null);

  const [drawing, setDraw] = useState(false);
  const [eventsKeyboard, setEventsKeyboard] =
    useState<IStageEvents>("STAGE_COPY_ELEMENT");
  const {
    selectionRefsState: { rectRef: selectionRectRef, layerRef, trRef },
    selectionRef: selection,
    setSelected,
    isSelected,
  } = useSelection();

  const [elementsIds, setElementsIds] = useState<string[]>([]);

  const updateSelectionRect = useCallback(() => {
    const node = selectionRectRef.current;
    if (node) {
      node.setAttrs({
        visible: selection.current.visible,
        x: Math.min(selection.current.x1, selection.current.x2),
        y: Math.min(selection.current.y1, selection.current.y2),
        width: Math.abs(selection.current.x1 - selection.current.x2),
        height: Math.abs(selection.current.y1 - selection.current.y2),
        fill: "rgba(0, 161, 255, 0.3)",
      });
      node.getLayer().batchDraw();
    }
  }, [selectionRectRef]);

  const handleMouseDown = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      if (
        !isCreatingElement &&
        eventsKeyboard === "STAGE_WATCHING" &&
        !drawing &&
        !element?.id &&
        !pipeline?.id &&
        !isSelected
      ) {
        const stage = event.target?.getStage?.() as Konva.Stage;
        const { x, y } = stagePosition(stage);
        selection.current.visible = true;
        selection.current.x1 = Number(x);
        selection.current.y1 = Number(y);
        selection.current.x2 = Number(x);
        selection.current.y2 = Number(y);
        updateSelectionRect();
      }

      if (isCreatingElement) {
        setDraw(true);
        const createStartElement = eventElements?.[tool]?.start as IStartEvent;

        const createdElement = createStartElement(
          event,
          Object.keys(elements).length
        );

        handleSetElement(createdElement);
      }

      if (
        eventsKeyboard === "STAGE_COPY_ELEMENT" &&
        element?.id &&
        !isSelected
      ) {
        const newElement = Object.assign({}, element, { id: v4() });

        handleSetElement(newElement);
      }

      if (eventsKeyboard === "STAGE_COPY_ELEMENT" && isSelected) {
        for (const item of elementsIds) {
          handleSetElements(Object.assign({}, elements[item], { id: v4() }));
        }
      }
    },
    [isCreatingElement, eventsKeyboard, drawing, element, pipeline, isSelected]
  );
  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (
        !isCreatingElement &&
        eventsKeyboard === "STAGE_WATCHING" &&
        !drawing &&
        !element?.id &&
        !pipeline?.id &&
        !isSelected
      ) {
        if (!selection.current.visible) {
          return;
        }
        const stage = e.target?.getStage?.() as Konva.Stage;
        const { x, y } = stagePosition(stage);
        selection.current.x2 = Number(x);
        selection.current.y2 = Number(y);
        updateSelectionRect();
      }

      if (!drawing) return;
      if (isCreatingElement) {
        const updateProgressElement = eventElements?.[tool]
          ?.progress as IEndEvent;

        const updateElement = updateProgressElement(e, pipeline);
        handleSetElement(updateElement);
      }
      if (eventsKeyboard === "STAGE_COPY_ELEMENT" && pipeline?.id) {
        const stage = e.target?.getStage?.() as Konva.Stage;
        const { x, y } = stagePosition(stage);

        const updateElement = Object.assign({}, pipeline, { x, y });
        handleSetEl(updateElement);
      }
    },
    [isCreatingElement, eventsKeyboard, drawing, element, pipeline, isSelected]
  );

  const handleMouseUp = useCallback(() => {
    if (selection.current.visible) {
      selection.current.visible = false;
      const { x1, x2, y1, y2 } = selection.current;
      const moved = x1 !== x2 || y1 !== y2;
      if (!moved) {
        updateSelectionRect();
        return;
      }
      updateSelectionRect();
      const selBox = selectionRectRef?.current?.getClientRect?.();

      const elementsSelected = layerRef?.current?.children?.filter?.(
        (elementNode) => {
          if (elementNode?.attrs?.id === "select-rect-default") return;
          const elBox = elementNode.getClientRect();
          if (Konva.Util.haveIntersection(selBox, elBox)) {
            return elementNode;
          }
        }
      );
      setElementsIds(
        elementsSelected?.map((item) => `${item?.attrs?.id}`) as string[]
      );

      setSelected(Boolean(Number(elementsSelected?.length)));
      if (elementsSelected?.length) {
        trRef.current.nodes(elementsSelected);
      } else {
        trRef.current.nodes([]);
      }
    }

    if (eventsKeyboard === "STAGE_COPY_ELEMENT") {
      setEventsKeyboard("STAGE_WATCHING");
    }
    if (drawing) {
      setDraw(false);
    }
    if (tool !== "MOVE") {
      setTool("MOVE");
    }
    if (pipeline?.id) {
      handleSetElements(pipeline);
      handleEmptyElement();
    }
    if (element?.id) {
      handleSetElements(element);
    }
  }, [selection, layerRef, eventsKeyboard, drawing, tool, pipeline, element]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const KEY = event.key?.toUpperCase();

      if (disableKeyBoard) {
        if (KEY === "DELETE") {
          if (!isSelected) {
            handleDeleteElement(`${element?.id}`);

            handleElementEmpty();
          } else {
            handleDeleteManyElements(elementsIds);
            handleElementEmpty();
            setSelected(false);
            trRef.current.nodes([]);
            setElementsIds([]);
          }
        }
        if (KEY === "ALT") {
          setEventsKeyboard("STAGE_COPY_ELEMENT");
        }
        if (KEY === "O") {
          setTool("CIRCLE");
          handleElementEmpty();
          handleEmptyElement();
        }
        if (KEY === "O") {
          setTool("CIRCLE");
          handleEmptyElement();
          handleElementEmpty();
        }
        if (KEY === "L") {
          setTool("LINE");
          handleElementEmpty();
          handleEmptyElement();
        }
        if (KEY === "V") {
          setTool("MOVE");
          handleElementEmpty();
          handleEmptyElement();
        }
        if (KEY === "I") {
          setTool("IMAGE");
          handleEmptyElement();
          handleElementEmpty();
        }
        if (KEY === "F") {
          setTool("BOX");
          handleElementEmpty();
          handleEmptyElement();
        }
        if (KEY === "T") {
          handleElementEmpty();
          handleEmptyElement();
          setTool("TEXT");
        }
      }
    };
    const handleKeyUp = () => {
      setEventsKeyboard("STAGE_WATCHING");
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [pipeline, disableKeyBoard, element, elementsIds]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    stageDataRef,
  };
};

export default useEvent;
