# D3 — Flight airports

**Source of truth:** [data/founder-decisions.yaml](../../data/founder-decisions.yaml) (`id: D3`)  
**Status:** DecisionRequired

## 為何現在要決定

Day1 入境、Day7 離境、住宿選區、行李與機場緩衝皆依機場；open-jaw 尚未 Confirmed。

## 已確認事實

- 台灣常見 TPE/TSA；韓國端 ICN/GMP/PUS（需查航空公司時刻，非 Confirmed 選項）

## 建議（仍 DecisionRequired）

**TPE → ICN** 入境、**PUS → TPE** 出境，open-jaw、優先全程直飛；待 D1 日期確定後以實際航班時間、總價、行李與取消條款驗證。

## 選項

| ID | 選項 |
|----|------|
| D3-A | 往返 ICN + KTX 釜山 |
| D3-B | Open-jaw：TPE → ICN、PUS → TPE（直飛 preferred） |
| D3-C | 暫不決定 |

## 回覆一行（含 A/B/C 定義）

**D3-A** = 桃園/松山 ↔ ICN 往返，釜山靠 KTX  
**D3-B** = Open-jaw：TPE → ICN 去、PUS → TPE 回（優先全程直飛）  
**D3-C** = 暫不決定機場

```text
D3: 選 D3-B — TPE→ICN 去、PUS→TPE 回，直飛 open-jaw（待 D1 後查票驗證）
```
