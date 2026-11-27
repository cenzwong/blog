# Python example migration audit

The old runtime offered Run controls for every Python block, including examples that required infrastructure or undefined variables. The migration makes execution explicit.

- The first four Python built-in examples in `content/2024/05/bit-manipulation-revision.md` are self-contained expressions supported by the pinned Pyodide runtime. Their fence metadata is marked `python run`; the expression text is unchanged. The remaining bit-manipulation snippets refer to `n` or `i` without defining them and remain display-only.
- PySpark articles use Spark sessions, data frames, cluster or S3 resources, so their Python blocks remain display-only. The count-if article's examples depend on `my_list` and, in some cases, external libraries or execution environments; they remain display-only.
- Python blocks in the imported HTML reference remain display-only. HTML is not permitted to opt code into the Python runner; authors can move a reviewed, self-contained example to an explicit Markdown run fence if interactivity is needed.

The compatibility manifest records the article hashes at relocation. The four fence annotations above are intentional post-relocation source edits, not changes to the examples' displayed code. The production browser suite exercises the published `bin(10)` example against the real on-demand Pyodide worker and tests cancellation and reset separately.
