# Psalter 91 legacy selection companion: method correction

The fresh exhaustive registry inventory for the 126–127 correction found that the earlier 91 note correction had left an existing legacy print-selection hash stale. The corrected score already has ABC SHA-256 `e15778c9cca19584816d2f48d8e7164c2917baf7cfacbdc6d46b1325c2427677`, while the witness still named `0153089061ce94a0ba18fd4803d73114cfebbf86fde01a154c989c0427b7a508`.

This addendum records a correction to companion-discovery coverage. A source-guard inventory must inspect all legacy migration hashes as well as musical supplements. Negative musical guard results do not establish that there are no exact-source companions. The original sealed source audit remains unchanged, including its original findings and checksum manifest.

The sole 91 change is rebinding that existing witness to the current source hash. Previous `[]` and current `[1,2,3,4,5]` membership are preserved. The score, notes, words, timing, source witnesses and generic migration implementation are unchanged.

With the stale hash, an unversioned historical all/default selection `[]` remains empty, because the source identity guard rejects migration. With the rebound hash it expands to all five stanzas. A versioned explicit empty choice with available `[1,2,3,4,5]` remains empty. An undefined, unversioned choice continues to default to all five. Focused tests cover all 32 subsets, explicit saved metadata, absent selections, stale/altered/missing hashes, wrong song identity and changed available membership. The exhaustive final inventory separately checks every one of the 75 existing legacy witness hashes against the actual current canonical source.
