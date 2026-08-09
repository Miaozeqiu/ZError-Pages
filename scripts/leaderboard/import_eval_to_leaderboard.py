#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 zerror_eval_*.json 导入 public/leaderboard（对齐 excluded / subject_remap / 多选严判）。"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LB = ROOT / "public" / "leaderboard"

TRAD_SIMP = {
    "鵬": "鹏", "語": "语", "國": "国", "學": "学", "會": "会", "對": "对", "與": "与",
    "無": "无", "開": "开", "關": "关", "機": "机", "東": "东", "車": "车", "長": "长",
    "門": "门", "問": "问", "為": "为", "這": "这", "來": "来", "時": "时", "過": "过",
    "還": "还", "發": "发", "經": "经", "總": "总", "業": "业", "堅": "坚", "態": "态", "誌": "志",
}

TYPES = ["单选题", "多选题", "判断题", "填空题"]
SUBJECT_ORDER = [
    "数学", "英语", "思政政治", "机械制造", "综合其他", "医学护理",
    "文史哲法", "计算机", "物理化学", "经管财经", "艺术设计", "汽车交通",
]


def normalize(s: str) -> str:
    t = str(s or "")
    try:
        t = unicodedata.normalize("NFKC", t)
    except Exception:
        pass
    t = "".join(TRAD_SIMP.get(ch, ch) for ch in t)
    t = t.replace("\u3000", " ").replace("\xa0", " ")
    t = re.sub(r"\s+", "", t)
    t = t.replace("（", "(").replace("）", ")").replace("，", ",").replace("。", ".")
    t = t.lower()
    t = re.sub(r"^[a-z][\.、．\)]", "", t)
    return t


def split_multi(s: str) -> list[str]:
    return [x.strip() for x in re.split(r"###|\n+", str(s or "")) if x.strip()]


def blank_alts(blank: str) -> list[str]:
    return [normalize(x) for x in re.split(r"[；;]", blank) if normalize(x)]


def looks_like_key(s: str) -> bool:
    t = str(s or "").strip()
    if re.fullmatch(r"[A-Za-z]", t):
        return True
    if re.fullmatch(r"[A-Z]{2,8}", t) and all(c in "ABCDEFGHIJKLMNOP" for c in set(t)):
        return True
    return False


def parse_option_map(options: str) -> dict[str, str]:
    m: dict[str, str] = {}
    for ln in str(options or "").splitlines():
        mm = re.match(r"^([A-Za-z])[\.、．\)]\s*(.*)$", ln.strip())
        if mm:
            m[mm.group(1).upper()] = mm.group(2).strip()
    return m


def score_multi_strict(gold: str, pred: str, options: str) -> bool:
    g = str(gold or "").strip()
    p = str(pred or "").strip()
    if not g or not p:
        return False
    opt_map = parse_option_map(options)
    p_key = re.sub(r"\s+", "", p)
    if looks_like_key(p_key) and opt_map:
        letters = list(p_key.upper())
        mapped = [opt_map[c] for c in letters if c in opt_map]
        if len(mapped) == len(letters):
            p = "###".join(mapped)
    m = re.match(r"^([A-Za-z])[\.、．\)]\s*(.+)$", p)
    if m:
        rest = m.group(2).strip()
        expected = opt_map.get(m.group(1).upper())
        if expected == rest or rest in opt_map.values():
            p = rest
    gold_blanks = split_multi(g)
    pred_blanks = [normalize(x) for x in split_multi(p) if normalize(x)]
    if not gold_blanks or not pred_blanks:
        return False
    used = set()
    matched = 0
    for blank in gold_blanks:
        alts = blank_alts(blank)
        hit = -1
        for i, pi in enumerate(pred_blanks):
            if i in used:
                continue
            if any(pi == a or (a and (a in pi or pi in a)) for a in alts):
                hit = i
                break
        if hit >= 0:
            used.add(hit)
            matched += 1
    return matched == len(gold_blanks) and len(pred_blanks) == len(gold_blanks)


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def build(args: argparse.Namespace) -> None:
    ev = load_json(Path(args.eval_json).expanduser())
    excluded = load_json(LB / "excluded.json")
    remap = load_json(LB / "subject_remap.json")
    manual = load_json(LB / "ai_judge_manual.json")

    ex_set = set(excluded["indices"])
    remap_map = {m["index"]: m["to"] for m in remap["moves"]}
    # 仅应用本模型 key；若无则尝试按 index 匹配任意模型（通常新模型无人工补判）
    manual_by_index = {}
    for j in manual.get("judgments") or []:
        if j.get("model") == args.id:
            manual_by_index[j["index"]] = bool(j["correct"])

    results = list(ev.get("results") or [])
    multi_strict_fixed = 0
    manual_judge_fixed = 0
    kept = []

    for r in results:
        idx = r.get("index")
        if idx in ex_set:
            continue
        item = dict(r)
        if idx in remap_map:
            item["subject"] = remap_map[idx]

        # 多选严判
        if item.get("type") == "多选题" and not item.get("error"):
            strict_ok = score_multi_strict(
                item.get("gold") or "",
                item.get("pred") or "",
                item.get("options") or "",
            )
            prev = bool(item.get("correct"))
            if prev and not strict_ok:
                multi_strict_fixed += 1
            item["correct"] = strict_ok
            if strict_ok:
                item["score_reason"] = "set_match"
            elif item.get("score_reason") in (None, "exact", "set_match", "contain"):
                item["score_reason"] = "set_mismatch"

        # 人工补判 ai_judge_error
        if item.get("score_reason") == "ai_judge_error" or (
            item.get("error") and "ai_judge" in str(item.get("error"))
        ):
            if idx in manual_by_index:
                item["correct"] = manual_by_index[idx]
                item["error"] = None
                item["score_reason"] = "manual_judge"
                manual_judge_fixed += 1

        # 排行榜有效题不计 error（若仍有 error 则视为错且保留）
        kept.append(item)

    # 矩阵
    cell_q: dict[tuple[str, str], list] = defaultdict(list)
    for item in kept:
        subj = item.get("subject") or "综合其他"
        typ = item.get("type") or "单选题"
        if typ not in TYPES:
            continue
        q = {
            "index": item.get("index"),
            "title": item.get("title") or "",
            "options": item.get("options") or "",
            "gold": item.get("gold") or "",
            "pred": item.get("pred") or "",
            "correct": bool(item.get("correct")) and not item.get("error"),
            "score_reason": item.get("score_reason"),
            "error": item.get("error"),
            "elapsed": item.get("elapsed"),
            "attempts": item.get("attempts"),
        }
        cell_q[(subj, typ)].append(q)

    subjects = [s for s in SUBJECT_ORDER if any((s, t) in cell_q for t in TYPES)]
    for s, _t in cell_q:
        if s not in subjects:
            subjects.append(s)

    rows = []
    type_totals = {t: {"n": 0, "ok": 0, "err": 0, "acc": 0.0} for t in TYPES}
    total_n = total_ok = total_err = 0

    for subj in subjects:
        cells = {}
        row_n = row_ok = row_err = 0
        for typ in TYPES:
            qs = cell_q.get((subj, typ), [])
            n = len(qs)
            ok = sum(1 for q in qs if q["correct"])
            err = sum(1 for q in qs if q.get("error"))
            acc = round(ok / n, 4) if n else 0.0
            cells[typ] = {"n": n, "ok": ok, "err": err, "acc": acc, "questions": qs}
            row_n += n
            row_ok += ok
            row_err += err
            type_totals[typ]["n"] += n
            type_totals[typ]["ok"] += ok
            type_totals[typ]["err"] += err
        rows.append(
            {
                "subject": subj,
                "cells": cells,
                "total": {
                    "n": row_n,
                    "ok": row_ok,
                    "err": row_err,
                    "acc": round(row_ok / row_n, 4) if row_n else 0.0,
                },
            }
        )
        total_n += row_n
        total_ok += row_ok
        total_err += row_err

    for t, v in type_totals.items():
        v["acc"] = round(v["ok"] / v["n"], 4) if v["n"] else 0.0

    by_type = {
        t: {
            "n": type_totals[t]["n"],
            "ok": type_totals[t]["ok"],
            "err": type_totals[t]["err"],
            "acc": type_totals[t]["acc"],
        }
        for t in TYPES
    }
    accuracy = round(total_ok / total_n, 4) if total_n else 0.0
    exported_at = (ev.get("summary") or {}).get("exported_at") or datetime.now(timezone.utc).isoformat()
    judge_model = (ev.get("summary") or {}).get("judge_model") or "glm-5.2-fast-preview"

    model = {
        "id": args.id,
        "rank": 0,
        "name": args.name,
        "displayName": args.name,
        "provider": args.provider,
        "judgeModel": judge_model,
        "accuracy": accuracy,
        "n": total_n,
        "correct": total_ok,
        "wrong": total_n - total_ok - total_err,
        "errors": total_err,
        "by_type": by_type,
        "datasetMode": (ev.get("summary") or {}).get("dataset_mode") or "text",
        "exportedAt": exported_at,
        "excludedCount": len(ex_set),
        "manualJudgeFixed": manual_judge_fixed,
        "multiStrictFixed": multi_strict_fixed,
        "types": TYPES,
        "subjects": subjects,
        "rows": rows,
        "typeTotals": type_totals,
    }

    out = LB / f"{args.id}.json"
    out.write_text(json.dumps(model, ensure_ascii=False), encoding="utf-8")
    print(
        f"wrote {out} n={total_n} acc={accuracy} "
        f"multiStrictFixed={multi_strict_fixed} manualJudgeFixed={manual_judge_fixed}"
    )

    # 更新 index.json
    index_path = LB / "index.json"
    index = load_json(index_path)
    entry = {
        "id": model["id"],
        "rank": 0,
        "name": model["name"],
        "displayName": model["displayName"],
        "provider": model["provider"],
        "judgeModel": model["judgeModel"],
        "accuracy": model["accuracy"],
        "n": model["n"],
        "correct": model["correct"],
        "wrong": model["wrong"],
        "errors": model["errors"],
        "by_type": model["by_type"],
        "datasetMode": model["datasetMode"],
        "exportedAt": model["exportedAt"],
        "excludedCount": model["excludedCount"],
        "manualJudgeFixed": model["manualJudgeFixed"],
        "multiStrictFixed": model["multiStrictFixed"],
    }
    models = [m for m in index.get("models") or [] if m.get("id") != args.id]
    models.append(entry)
    models.sort(key=lambda m: (-float(m.get("accuracy") or 0), m.get("id") or ""))
    for i, m in enumerate(models, 1):
        m["rank"] = i
    index["models"] = models
    index["updatedAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    if total_n:
        index["effectiveN"] = total_n
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("updated index ranks:")
    for m in models:
        print(f"  #{m['rank']} {m['id']} {m['accuracy']:.4f}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--eval-json", required=True)
    ap.add_argument("--id", required=True)
    ap.add_argument("--name", required=True)
    ap.add_argument("--provider", default="Longcat")
    args = ap.parse_args()
    build(args)


if __name__ == "__main__":
    main()
