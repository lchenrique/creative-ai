import { useCreativeStore, type CanvasElement } from "@/stores/creative-store";
import { useCallback } from "react";

export const useElementTransform = () => {
  const elements = useCreativeStore((state) => state.canvasElements);
  const setElements = useCreativeStore((state) => state.setCanvasElements);
  const updateElement = useCreativeStore((state) => state.updateElement);

  const groupElements = useCallback((ids: number[]) => {
    if (ids.length < 2) return null;

    const groupId = Math.max(...elements.map((e) => e.id), 0) + 1;
    const selectedElements = elements.filter((el) => ids.includes(el.id));

    const minX = Math.min(...selectedElements.map((el) => el.x));
    const minY = Math.min(...selectedElements.map((el) => el.y));
    const maxX = Math.max(...selectedElements.map((el) => el.x + el.w));
    const maxY = Math.max(...selectedElements.map((el) => el.y + el.h));

    const groupElement: CanvasElement = {
      id: groupId,
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY,
      angle: 0,
      color: "transparent",
      isGroup: true,
      children: ids,
    };

    setElements((prev) => {
      const updated = prev.map((el) =>
        ids.includes(el.id) ? { ...el, groupId } : el,
      );
      return [...updated, groupElement];
    });

    return groupId;
  }, [elements, setElements]);

  const ungroupElements = useCallback((groupIds: number[]) => {
    const validGroupIds = groupIds.filter((id) => {
      const el = elements.find((e) => e.id === id);
      return el?.isGroup;
    });

    if (validGroupIds.length === 0) return [];

    const childIds = elements
      .filter((el) => validGroupIds.includes(el.id) && el.children)
      .flatMap((el) => el.children || []);

    setElements((prev) => {
      const ungrouped = prev
        .filter((el) => !validGroupIds.includes(el.id))
        .map((el) =>
          validGroupIds.includes(el.groupId || -1)
            ? { ...el, groupId: undefined }
            : el,
        );
      return ungrouped;
    });

    return childIds;
  }, [elements, setElements]);

  const updateGroupTransform = useCallback((
    groupId: number,
    transform: {
      x?: number;
      y?: number;
      w?: number;
      h?: number;
      angle?: number;
    }
  ) => {
    const group = elements.find((el) => el.id === groupId);
    if (!group?.isGroup || !group.children) return;

    const { x, y, w, h, angle } = transform;

    if (x !== undefined && y !== undefined) {
      // Move group and children
      const deltaX = x - group.x;
      const deltaY = y - group.y;

      setElements((prev) =>
        prev.map((el) => {
          if (el.id === groupId) {
            return { ...el, x, y };
          }
          if (group.children?.includes(el.id)) {
            return { ...el, x: el.x + deltaX, y: el.y + deltaY };
          }
          return el;
        }),
      );
    }

    if (w !== undefined && h !== undefined) {
      // Resize group and scale children
      const scaleX = w / group.w;
      const scaleY = h / group.h;

      setElements((prev) =>
        prev.map((el) => {
          if (el.id === groupId) {
            return { ...el, x: x ?? group.x, y: y ?? group.y, w, h };
          }
          if (group.children?.includes(el.id)) {
            const relX = el.x - group.x;
            const relY = el.y - group.y;
            return {
              ...el,
              x: (x ?? group.x) + relX * scaleX,
              y: (y ?? group.y) + relY * scaleY,
              w: el.w * scaleX,
              h: el.h * scaleY,
            };
          }
          return el;
        }),
      );
    }

    if (angle !== undefined) {
      // Rotate group and children around center
      const centerX = group.x + group.w / 2;
      const centerY = group.y + group.h / 2;
      const angleDelta = angle - group.angle;
      const rad = (angleDelta * Math.PI) / 180;

      setElements((prev) =>
        prev.map((el) => {
          if (el.id === groupId) {
            return { ...el, x: x ?? group.x, y: y ?? group.y, angle };
          }
          if (group.children?.includes(el.id)) {
            const childCenterX = el.x + el.w / 2;
            const childCenterY = el.y + el.h / 2;
            const relX = childCenterX - centerX;
            const relY = childCenterY - centerY;

            const newRelX = relX * Math.cos(rad) - relY * Math.sin(rad);
            const newRelY = relX * Math.sin(rad) + relY * Math.cos(rad);

            return {
              ...el,
              x: centerX + newRelX - el.w / 2,
              y: centerY + newRelY - el.h / 2,
              angle: el.angle + angleDelta,
            };
          }
          return el;
        }),
      );
    }
  }, [elements, setElements]);

  return {
    groupElements,
    ungroupElements,
    updateGroupTransform,
    updateElement,
  };
};
