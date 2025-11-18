import type { OnClickGroup, OnDrag, OnRenderGroup, OnResize, OnRotate, OnRotateEnd } from "react-moveable";

export const canvasActions = {
    onDrag: (e: OnDrag) => {
        e.target.style.transform = e.transform;
    },
    onRenderGroup: (e: OnRenderGroup) => {
        e.events.forEach(ev => {
            ev.target.style.cssText += ev.cssText;
        });
    },
    onResize: (e: OnResize) => {
        e.target.style.width = `${e.width}px`;
        e.target.style.height = `${e.height}px`;
        e.target.style.transform = e.drag.transform;
    },
    onRotate: (e: OnRotate) => {
        e.target.style.transform = e.transform;
    },
    onRotateEnd: (e: OnRotateEnd, callback: (elementId: string, newAngle: number) => void) => {
        const elementId = e.target.getAttribute("data-element-id");
        if (!elementId) return;
        const lastEvent = e.lastEvent;
        if (!lastEvent) return;
        const newAngle = lastEvent.rotate;
        // setCanvasElements((prev) =>
        //   prev.map((el) =>
        //     el.id === elementId ? { ...el, angle : newAngle } : el,
        //   ),
        // );
        callback(elementId, newAngle);
    },


    snapDirections: {
        top: true,
        left: true,
        bottom: true,
        right: true,
        center: true,
        middle: true,
    },
    elementSnapDirections: {
        top: true,
        left: true,
        bottom: true,
        right: true,
        center: true,
        middle: true,
    }
}  