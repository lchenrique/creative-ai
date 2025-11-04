import React, { useState, useEffect, useRef } from 'react';

const FabricEditor = () => {
  const canvasRef = useRef(null);
  const canvasInstance = useRef(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const guidelinesRef = useRef([]);

  // Load custom fonts
  useEffect(() => {
    const loadFonts = async () => {
      const fontUrls = {
        VT323: 'url(https://fonts.gstatic.com/s/vt323/v17/pxiKyp0ihIEF2isfFJXUdVNF.woff2)',
        Pacifico: 'url(https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ-6H6MmBp0u-.woff2)',
        Lato100: 'url(https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHh30AXC-qNiXg7Q.woff2)',
        Lato900: 'url(https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh50XSwiPGQ3q5d0.woff2)',
      };

      const fontFaces = [
        new FontFace('VT323', fontUrls.VT323, { style: 'normal', weight: 'normal' }),
        new FontFace('Pacifico', fontUrls.Pacifico, { style: 'normal', weight: 'normal' }),
        new FontFace('Lato', fontUrls.Lato100, { style: 'normal', weight: '100' }),
        new FontFace('Lato', fontUrls.Lato900, { style: 'normal', weight: '900' }),
      ];

      try {
        await Promise.all(fontFaces.map(font => font.load()));
        fontFaces.forEach(font => document.fonts.add(font));
        setFontsLoaded(true);
      } catch (error) {
        console.error('Font loading error:', error);
      }
    };

    loadFonts();
  }, []);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!fontsLoaded) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 900,
      height: 500,
      backgroundColor: '#ffffff',
    });

    canvasInstance.current = canvas;

    // Draw grid
    const drawGrid = () => {
      canvas.clearOnCache();
      if (!showGrid) return;

      const gridSize = 20;
      for (let i = 0; i < canvas.width; i += gridSize) {
        canvas.add(
          new fabric.Line([i, 0, i, canvas.height], {
            stroke: '#cccccc',
            strokeWidth: 0.5,
            selectable: false,
            evented: false,
          })
        );
      }
      for (let i = 0; i < canvas.height; i += gridSize) {
        canvas.add(
          new fabric.Line([0, i, canvas.width, i], {
            stroke: '#cccccc',
            strokeWidth: 0.5,
            selectable: false,
            evented: false,
          })
        );
      }
    };

    drawGrid();

    // Smart guides and snap-to-grid
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      const gridSize = 20;

      // Clear previous guidelines
      guidelinesRef.current.forEach(line => canvas.remove(line));
      guidelinesRef.current = [];

      // Snap to grid
      if (snapToGrid) {
        obj.left = Math.round(obj.left / gridSize) * gridSize;
        obj.top = Math.round(obj.top / gridSize) * gridSize;
      }

      // Smart guides - check alignment with other objects
      canvas.forEachObject((otherObj) => {
        if (otherObj === obj || otherObj.selectable === false) return;

        const threshold = 5;

        // Vertical alignments (left, center, right)
        if (Math.abs(obj.left - otherObj.left) < threshold) {
          // Left align
          obj.left = otherObj.left;
          const line = new fabric.Line(
            [obj.left, 0, obj.left, canvas.height],
            {
              stroke: '#FF0000',
              strokeWidth: 2,
              selectable: false,
              evented: false,
            }
          );
          canvas.add(line);
          guidelinesRef.current.push(line);
        }

        if (
          Math.abs(obj.left + obj.width / 2 - (otherObj.left + otherObj.width / 2)) < threshold
        ) {
          // Center align
          obj.left = otherObj.left + otherObj.width / 2 - obj.width / 2;
          const line = new fabric.Line(
            [obj.left + obj.width / 2, 0, obj.left + obj.width / 2, canvas.height],
            {
              stroke: '#FF0000',
              strokeWidth: 2,
              selectable: false,
              evented: false,
            }
          );
          canvas.add(line);
          guidelinesRef.current.push(line);
        }

        if (Math.abs(obj.left + obj.width - (otherObj.left + otherObj.width)) < threshold) {
          // Right align
          obj.left = otherObj.left + otherObj.width - obj.width;
          const line = new fabric.Line(
            [obj.left + obj.width, 0, obj.left + obj.width, canvas.height],
            {
              stroke: '#FF0000',
              strokeWidth: 2,
              selectable: false,
              evented: false,
            }
          );
          canvas.add(line);
          guidelinesRef.current.push(line);
        }

        // Horizontal alignments (top, center, bottom)
        if (Math.abs(obj.top - otherObj.top) < threshold) {
          // Top align
          obj.top = otherObj.top;
          const line = new fabric.Line(
            [0, obj.top, canvas.width, obj.top],
            {
              stroke: '#FF0000',
              strokeWidth: 2,
              selectable: false,
              evented: false,
            }
          );
          canvas.add(line);
          guidelinesRef.current.push(line);
        }

        if (
          Math.abs(obj.top + obj.height / 2 - (otherObj.top + otherObj.height / 2)) < threshold
        ) {
          // Center align
          obj.top = otherObj.top + otherObj.height / 2 - obj.height / 2;
          const line = new fabric.Line(
            [0, obj.top + obj.height / 2, canvas.width, obj.top + obj.height / 2],
            {
              stroke: '#FF0000',
              strokeWidth: 2,
              selectable: false,
              evented: false,
            }
          );
          canvas.add(line);
          guidelinesRef.current.push(line);
        }

        if (Math.abs(obj.top + obj.height - (otherObj.top + otherObj.height)) < threshold) {
          // Bottom align
          obj.top = otherObj.top + otherObj.height - obj.height;
          const line = new fabric.Line(
            [0, obj.top + obj.height, canvas.width, obj.top + obj.height],
            {
              stroke: '#FF0000',
              strokeWidth: 2,
              selectable: false,
              evented: false,
            }
          );
          canvas.add(line);
          guidelinesRef.current.push(line);
        }
      });

      canvas.renderAll();
    });

    canvas.on('object:modified', () => {
      guidelinesRef.current.forEach(line => canvas.remove(line));
      guidelinesRef.current = [];
      canvas.renderAll();
    });

    return () => {
      canvas.dispose();
    };
  }, [fontsLoaded, showGrid, snapToGrid]);

  const addText = (fontFamily, fontSize, fontWeight = 'normal', color = '#000000') => {
    if (!canvasInstance.current) return;

    const text = new fabric.Textbox('Click to edit', {
      left: Math.random() * 500,
      top: Math.random() * 300,
      fontSize,
      fontFamily,
      fontWeight,
      fill: color,
      width: 200,
    });

    canvasInstance.current.add(text);
    canvasInstance.current.renderAll();
  };

  const createTemplate = () => {
    if (!canvasInstance.current) return;

    const canvas = canvasInstance.current;
    canvas.clear();

    const elements = [
      {
        text: 'Beautiful Template',
        fontFamily: 'Pacifico',
        fontSize: 60,
        fontWeight: 'normal',
        fill: '#2c3e50',
        left: 50,
        top: 20,
        width: 800,
      },
      {
        text: 'With Custom Fonts',
        fontFamily: 'Lato',
        fontSize: 32,
        fontWeight: '900',
        fill: '#34495e',
        left: 50,
        top: 100,
        width: 800,
      },
      {
        text: 'VT323 Font',
        fontFamily: 'VT323',
        fontSize: 28,
        fontWeight: 'normal',
        fill: '#2980b9',
        left: 50,
        top: 180,
        width: 200,
      },
      {
        text: 'Lato 100 Light',
        fontFamily: 'Lato',
        fontSize: 32,
        fontWeight: '100',
        fill: '#27ae60',
        left: 300,
        top: 180,
        width: 200,
      },
      {
        text: 'Lato 900 Bold',
        fontFamily: 'Lato',
        fontSize: 32,
        fontWeight: '900',
        fill: '#e74c3c',
        left: 550,
        top: 180,
        width: 200,
      },
    ];

    elements.forEach((el) => {
      const textObj = new fabric.Textbox(el.text, {
        left: el.left,
        top: el.top,
        fontSize: el.fontSize,
        fontFamily: el.fontFamily,
        fontWeight: el.fontWeight,
        fill: el.fill,
        width: el.width,
      });
      canvas.add(textObj);
    });

    canvas.renderAll();
  };

  const clearCanvas = () => {
    if (!canvasInstance.current) return;
    canvasInstance.current.clear();
    guidelinesRef.current = [];
  };

  const exportJSON = () => {
    if (!canvasInstance.current) return;
    const json = canvasInstance.current.toJSON();
    alert(JSON.stringify(json, null, 2));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Fabric.js Canvas Editor</h1>
      
      <div style={{ marginBottom: '15px' }}>
        <span style={{ marginRight: '20px' }}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          <label style={{ marginLeft: '5px' }}>Show Grid</label>
        </span>
        <span>
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => setSnapToGrid(e.target.checked)}
          />
          <label style={{ marginLeft: '5px' }}>Snap to Grid</label>
        </span>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={createTemplate}
          style={{
            padding: '10px 15px',
            marginRight: '10px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          Create Template
        </button>
        <button
          onClick={() => addText('VT323', 28, 'normal', '#2980b9')}
          style={{
            padding: '10px 15px',
            marginRight: '10px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Add VT323
        </button>
        <button
          onClick={() => addText('Pacifico', 32, 'normal', '#e74c3c')}
          style={{
            padding: '10px 15px',
            marginRight: '10px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Add Pacifico
        </button>
        <button
          onClick={() => addText('Lato', 28, '100', '#27ae60')}
          style={{
            padding: '10px 15px',
            marginRight: '10px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Add Lato 100
        </button>
        <button
          onClick={() => addText('Lato', 28, '900', '#8e44ad')}
          style={{
            padding: '10px 15px',
            marginRight: '10px',
            backgroundColor: '#8e44ad',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Add Lato 900
        </button>
        <button
          onClick={clearCanvas}
          style={{
            padding: '10px 15px',
            marginRight: '10px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Clear Canvas
        </button>
        <button
          onClick={exportJSON}
          style={{
            padding: '10px 15px',
            backgroundColor: '#9b59b6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Export JSON
        </button>
      </div>

      <div
        style={{
          border: '2px solid #cccccc',
          display: 'inline-block',
          borderRadius: '4px',
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        {fontsLoaded ? '✅ Fonts loaded - Ready to edit!' : '⏳ Loading fonts...'}
      </div>
    </div>
  );
};

export default FabricEditor;
