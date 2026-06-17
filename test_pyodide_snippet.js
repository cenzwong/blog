let pyodide = null;

async function initPyodide() {
  if (!pyodide) {
    pyodide = await loadPyodide();
  }
  return pyodide;
}

async function runPython(code) {
  const py = await initPyodide();
  return await py.runPythonAsync(code);
}
