export type PatchOp = { path: string; value: unknown };

function decode(token: string) {
  return token.replace(/~1/g, "/").replace(/~0/g, "~");
}

/** Applique des opérations "set" en pointeur JSON, sans muter l'objet d'origine. */
export function applyPatch<T>(doc: T, ops: PatchOp[]): T {
  const out = structuredClone(doc) as unknown;
  for (const { path, value } of ops) {
    const keys = path.split("/").slice(1).map(decode);
    if (keys.length === 0) throw new Error("Chemin racine interdit");
    let node = out as Record<string, unknown>;
    for (const key of keys.slice(0, -1)) {
      const next = node[key];
      if (typeof next !== "object" || next === null) throw new Error(`Chemin invalide : ${path}`);
      node = next as Record<string, unknown>;
    }
    const last = keys[keys.length - 1]!;
    if (Array.isArray(node) && last === "-") node.push(value);
    else node[last] = value;
  }
  return out as T;
}
