let runtime;
let busy = false;
self.onmessage = async event => {
  const {id, code} = event.data || {};
  if (busy) { self.postMessage({id, error:'Python is already running.'}); return; }
  busy = true;
  try {
    if (!runtime) {
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');
      runtime = await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'});
      runtime.runPython('import sys, io');
    }
    runtime.runPython('sys.stdout = io.StringIO(); sys.stderr = io.StringIO()');
    const value = await runtime.runPythonAsync(code);
    const result = value?.toString ? value.toString() : '';
    value?.destroy?.();
    self.postMessage({id, stdout:runtime.runPython('sys.stdout.getvalue()'), stderr:runtime.runPython('sys.stderr.getvalue()'), result:result === 'None' ? '' : result});
  } catch (error) {
    let stdout='';
    let stderr='';
    try { stdout=runtime?.runPython('sys.stdout.getvalue()') || ''; } catch {}
    try { stderr=runtime?.runPython('sys.stderr.getvalue()') || ''; } catch {}
    self.postMessage({id, error:String(error), stdout, stderr});
  } finally { busy=false; }
};
