import icons from "@/assets";
import { useElement } from "@/editor/core/hooks";
import useElements from "@/editor/core/hooks/elements/hook";
import { IKeyTool } from "@/editor/core/hooks/tool/types";
import themeColors from "@/themes";
import { AtomIcon, AtomText, AtomWrapper, isDarkLight } from "@whil/ui";
import { FC, ReactNode, useCallback, useMemo } from "react";

type Props = {
  children?: ReactNode;
};

type IElementsIcons = {
  [key in IKeyTool]?: string;
};

const ElementsIcons: IElementsIcons = {
  BOX: icons.box,
  CIRCLE: icons.circle,
  IMAGE: icons.image,
  TEXT: icons.text,
  LINE: icons.line,
  MOVE: icons.cursor,
  DRAW: icons.peentool,
};

const ElementsList: FC<Props> = () => {
  const { elements } = useElements();
  const { handleChangeElement, element } = useElement();
  const getColor = useCallback(
    (id: string) => {
      return element?.id === id
        ? isDarkLight(` ${themeColors.primary}`)
        : "white";

      // return getColor
    },
    [element]
  );

  const elementsMemo = useMemo(() => Object.values(elements), [elements]);
  return (
    <AtomWrapper
      customCSS={(css) => css`
        height: calc(100vh - 24.4em);
        overflow: hidden;
        overflow-x: hidden;

        &:hover {
          overflow-y: scroll;

          ::-webkit-scrollbar {
            width: 6px;
          }
          ::-webkit-scrollbar-thumb {
            background: #ffffff67;
            border-radius: 99px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${themeColors.white};
            box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.2);
          }
        }

        display: flex;
        justify-content: flex-start;
      `}
      width="100%"
      flexDirection="column"
    >
      {elementsMemo?.map((item, index) => (
        <AtomWrapper
          key={item.id}
          padding="0.35em 0.7em"
          height="auto"
          className="CursorPointer"
          customCSS={(css) => css`
            width: 100%;
            border: 1px solid ${themeColors.dark};
            user-select: none !important;
            opacity: 0.8;
            ${element.id === item?.id &&
            css`
              border: 1px solid ${themeColors.primary};
              background-color: ${themeColors.primary};
              opacity: 1;
            `}
            &:hover {
              border: 1px solid ${themeColors.primary};
              opacity: 1;
            }
          `}
          flexDirection="row"
          alignItems="center"
          gap="5px"
          onClick={() => handleChangeElement(item)}
        >
          <AtomIcon
            src={ElementsIcons?.[`${item?.tool}` as IKeyTool]}
            color="default"
            height="20px"
            width="20px"
            customCSS={(css) => css`
              svg {
                path {
                  stroke: #ffffff;
                }
                line {
                  stroke: #ffffff;
                }
              }
            `}
          />
          <AtomText color={getColor(item?.id as string)} cursor="pointer">
            {index + 1}
          </AtomText>
          <AtomText
            color={getColor(item?.id as string)}
            cursor="pointer"
            customCSS={(css) => css`
              user-select: none;
              &::first-letter {
                text-transform: uppercase;
              }
              text-transform: lowercase;
            `}
          >
            {item.tool}
          </AtomText>
        </AtomWrapper>
      ))}
    </AtomWrapper>
  );
};

export default ElementsList;
