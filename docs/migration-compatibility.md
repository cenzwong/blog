# Migration compatibility manifest

Inventory captured before the Astro migration. Public article routes must remain stable. Hashes record the source bytes at relocation; later intentional edits are documented in the [Python example audit](python-example-audit.md).

| Original source | Target source | Public route | Interactive | SHA-256 before move |
|---|---|---|---|---|
| `content/bit-manipulation-revision.md` | `content/2024/05/bit-manipulation-revision.md` | `/blog/posts/bit-manipulation-revision/` | no | `96ca0b774aa67e2a660b6b1481104445da1402378fe1f752d54e95a3974afe3f` |
| `content/bloom-filter-on-pyspark-and-iceberg.html` | `content/2026/06/bloom-filter-on-pyspark-and-iceberg.html` | `/blog/posts/iceberg-pyspark-bloom-filter-deep-dive/` | yes | `810d2c3f7336ba0b672ccc228c85601caac983511bc9e731f72f613671a4b7fb` |
| `content/pyspark-big-o-complexity.md` | `content/2026/05/pyspark-big-o-complexity.md` | `/blog/posts/pyspark-big-o-complexity/` | no | `853a9932c1bc59a2de0f4f64de82b2263e7e4dc0cea9e4c5ed6406b5c0e9dab5` |
| `content/pyspark-everything-memory.md` | `content/2026/06/pyspark-everything-memory.md` | `/blog/posts/pyspark-executor-memory-tuning/` | no | `caf97c1fd4edaa35dc3ff823124656391e3a2adf8cc42730aeec3f3995976237` |
| `content/pyspark-join-architecture.md` | `content/2026/05/pyspark-join-architecture.md` | `/blog/posts/pyspark-join-architecture/` | no | `bcf4089e0f3eeec9317c1d9e8b4be0ba1a82d69290bd7e2ab598d86b0e13a9dd` |
| `content/python-count-if-engineering-matrix.md` | `content/2026/06/python-count-if-engineering-matrix.md` | `/blog/posts/python-count-if-engineering-matrix/` | no | `bc7940fa02ab528d9c3aff6668009597ddb6882e7b6b6fcfbb89f0cf2fe31983` |
| `content/python-performance-guide.html` | `content/2026/06/python-performance-guide.html` | `/blog/posts/python-performance-guide/` | no | `65555637d92fe50ca4267e56eb920288fcf9258cc8622226b4b2e5a1fedda558` |
| `content/rolling-toolbox-pinned-workspace.md` | `content/2026/11/rolling-toolbox-pinned-workspace.md` | `/blog/posts/rolling-toolbox-pinned-workspace/` | no | `ef7411475212b85909e550fec56144b68ad9c192ce36ac00960462ebfb934443` |
